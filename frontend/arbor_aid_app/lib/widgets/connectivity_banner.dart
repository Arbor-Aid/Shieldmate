import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';

class ConnectivityBanner extends StatefulWidget {
  const ConnectivityBanner({super.key});

  @override
  State<ConnectivityBanner> createState() => _ConnectivityBannerState();
}

class _ConnectivityBannerState extends State<ConnectivityBanner> {
  ConnectivityResult _status = ConnectivityResult.none;
  late final Connectivity _connectivity;
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  bool get _isConnected => _status != ConnectivityResult.none;

  @override
  void initState() {
    super.initState();
    _connectivity = Connectivity();
    _hydrateStatus();
    _subscription = _connectivity.onConnectivityChanged.listen((results) {
      final next = results.isNotEmpty ? results.first : ConnectivityResult.none;
      _updateConnectivity(next);
    });
  }

  Future<void> _hydrateStatus() async {
    final dynamic results = await _connectivity.checkConnectivity();
    final status = results is List<ConnectivityResult>
        ? (results.isNotEmpty ? results.first : ConnectivityResult.none)
        : results is ConnectivityResult
            ? results
            : ConnectivityResult.none;
    if (!mounted) {
      return;
    }
    setState(() => _status = status);
  }

  void _updateConnectivity(ConnectivityResult result) {
    if (!mounted) {
      return;
    }
    setState(() => _status = result);
  }

  @override
  void dispose() {
    _subscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return AnimatedCrossFade(
      duration: const Duration(milliseconds: 250),
      crossFadeState: _isConnected ? CrossFadeState.showFirst : CrossFadeState.showSecond,
      firstChild: const SizedBox.shrink(),
      secondChild: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
        color: colorScheme.errorContainer,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.wifi_off, color: colorScheme.onErrorContainer),
            const SizedBox(width: 8),
            Text(
              'You are offline. Some features are unavailable.',
              style: TextStyle(color: colorScheme.onErrorContainer),
            ),
          ],
        ),
      ),
    );
  }
}
