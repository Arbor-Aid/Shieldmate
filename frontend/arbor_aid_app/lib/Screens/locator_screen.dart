import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart' as geocoding;
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:map_launcher/map_launcher.dart' as map_launcher;
import 'package:permission_handler/permission_handler.dart';
import 'package:url_launcher/url_launcher.dart';

import '../widgets/header_bar.dart';

class LocatorScreen extends StatefulWidget {
  const LocatorScreen({super.key});

  @override
  State<LocatorScreen> createState() => _LocatorScreenState();
}

class _LocatorScreenState extends State<LocatorScreen> {
  final Completer<GoogleMapController> _controller = Completer();
  LatLng? _center;
  String? _address;
  bool _requesting = true;
  bool _permissionDenied = false;

  @override
  void initState() {
    super.initState();
    _init();
  }

  Future<void> _init() async {
    try {
      if (!kIsWeb) {
        final status = await Permission.locationWhenInUse.request();
        if (!status.isGranted) {
          setState(() {
            _permissionDenied = true;
            _requesting = false;
          });
          return;
        }
      }

      final position = await Geolocator.getCurrentPosition();
      final center = LatLng(position.latitude, position.longitude);
      String? resolvedAddress;
      try {
        final placemarks = await geocoding.placemarkFromCoordinates(
          center.latitude,
          center.longitude,
        );
        if (placemarks.isNotEmpty) {
          final place = placemarks.first;
          resolvedAddress = [
            place.street,
            place.locality,
            place.administrativeArea,
          ].whereType<String>().where((part) => part.isNotEmpty).join(', ');
        }
      } catch (_) {
        resolvedAddress = null;
      }

      if (!mounted) {
        return;
      }

      setState(() {
        _center = center;
        _address = resolvedAddress;
        _requesting = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _requesting = false;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to acquire current location.')),
      );
    }
  }

  Set<Marker> _buildMarkers() {
    final center = _center;
    if (center == null) {
      return const <Marker>{};
    }

    final markers = <Marker>{
      Marker(
        markerId: const MarkerId('me'),
        position: center,
        infoWindow: InfoWindow(title: 'You are here', snippet: _address),
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueAzure),
      ),
    };

    const sampleOffsets = <List<double>>[
      [0.0045, 0.002],
      [-0.003, 0.0035],
      [0.0025, -0.004],
    ];

    final titles = [
      'Marine & Family Support Center',
      'Community Readiness Office',
      'Wellness & Resilience Clinic',
    ];

    for (var i = 0; i < sampleOffsets.length; i++) {
      final offset = sampleOffsets[i];
      markers.add(
        Marker(
          markerId: MarkerId('support-${i + 1}'),
          position: LatLng(
            center.latitude + offset[0],
            center.longitude + offset[1],
          ),
          infoWindow: InfoWindow(title: titles[i]),
        ),
      );
    }

    return markers;
  }

  Future<void> _openExternalMaps(LatLng destination) async {
    try {
      if (!kIsWeb) {
        final installed = await map_launcher.MapLauncher.installedMaps;
        map_launcher.AvailableMap? preferred;
        if (installed.isNotEmpty) {
          switch (defaultTargetPlatform) {
            case TargetPlatform.iOS:
            case TargetPlatform.macOS:
              preferred = installed.firstWhere(
                (map) => map.mapType == map_launcher.MapType.apple,
                orElse: () => installed.first,
              );
              break;
            default:
              preferred = installed.firstWhere(
                (map) => map.mapType == map_launcher.MapType.google,
                orElse: () => installed.first,
              );
          }
        }
        if (preferred != null) {
          await preferred.showDirections(
            destination: map_launcher.Coords(
              destination.latitude,
              destination.longitude,
            ),
            destinationTitle: 'Support Location',
          );
          return;
        }
      }
    } catch (_) {
      // Fall through to URL launcher fallback.
    }

    final uri = (defaultTargetPlatform == TargetPlatform.iOS ||
            defaultTargetPlatform == TargetPlatform.macOS)
        ? Uri.parse(
            'http://maps.apple.com/?daddr=${destination.latitude},${destination.longitude}',
          )
        : Uri.parse(
            'https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}',
          );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Unable to open external maps.')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final center = _center;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: const HeaderBar(title: 'Find Support Near Me'),
      floatingActionButton: center == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => _openExternalMaps(center),
              icon: const Icon(Icons.map),
              label: const Text('Open in Maps'),
            ),
      body: Builder(
        builder: (context) {
          if (_requesting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (_permissionDenied) {
            return _PermissionMessage(theme: theme);
          }

          if (center == null) {
            return _ErrorMessage(theme: theme);
          }

          return GoogleMap(
            onMapCreated: (controller) => _controller.complete(controller),
            initialCameraPosition: CameraPosition(target: center, zoom: 14),
            myLocationEnabled: true,
            myLocationButtonEnabled: true,
            compassEnabled: true,
            markers: _buildMarkers(),
          );
        },
      ),
    );
  }
}

class _PermissionMessage extends StatelessWidget {
  const _PermissionMessage({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.location_off, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 12),
            const Text(
              'Location permission is required to show nearby support.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () => openAppSettings(),
              child: const Text('Open Settings'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ErrorMessage extends StatelessWidget {
  const _ErrorMessage({required this.theme});

  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.error_outline, size: 48, color: theme.colorScheme.error),
            const SizedBox(height: 12),
            const Text(
              'We were unable to determine your location.',
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Geolocator.openLocationSettings(),
              child: const Text('Check Location Services'),
            ),
          ],
        ),
      ),
    );
  }
}
