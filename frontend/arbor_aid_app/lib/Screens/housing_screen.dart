import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/housing_service.dart';
import '../widgets/shieldmate_app_bar.dart';

class HousingScreen extends StatefulWidget {
  const HousingScreen({super.key});

  @override
  State<HousingScreen> createState() => _HousingScreenState();
}

class _HousingScreenState extends State<HousingScreen> {
  final HousingService _housingService = HousingService();

  bool _loading = false;
  List<_HousingResult> _fetchedOptions = const [];
  String? _error;

  final List<_HousingPathway> _pathways = const [
    _HousingPathway(
      'Emergency Housing',
      'Rapid placement support and coordination with shelters and base lodging.',
    ),
    _HousingPathway(
      'Rental Assistance',
      'Access BAH calculators, grants, and local housing partners.',
    ),
    _HousingPathway(
      'Homeownership',
      'Learn about VA loans, credit readiness, and financial workshops.',
    ),
  ];

  Future<void> _fetchHousingOptions() async {
    if (_loading) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to view housing recommendations.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _housingService.fetchOptions();
      if (!mounted) {
        return;
      }
      setState(() {
        _fetchedOptions = _parseResults(response);
      });
      _showSnack('Housing options refreshed.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _fetchedOptions = const [];
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Something went wrong while fetching housing options.';
        _fetchedOptions = const [];
      });
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<_HousingResult> _parseResults(Map<String, dynamic> response) {
    final data = response['options'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _HousingResult(
              title: entry['title']?.toString() ?? 'Housing resource',
              description: entry['description']?.toString() ?? 'No description available.',
              contact: entry['contact']?.toString(),
            ),
          )
          .toList();
    }
    return const [];
  }

  void _showSnack(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const ShieldmateAppBar(title: 'Housing Assistance'),
      body: RefreshIndicator(
        onRefresh: _fetchHousingOptions,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: ListTile(
                leading: const Icon(Icons.location_searching),
                title: const Text('Locator Tool'),
                subtitle: const Text(
                  'Search for on-base, off-base, and partner housing near any installation.',
                ),
                trailing: TextButton(
                  onPressed: _loading ? null : _fetchHousingOptions,
                  child: _loading
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Fetch options'),
                ),
              ),
            ),
            const SizedBox(height: 12),
            ..._pathways.map(
              (path) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.home_work_outlined),
                  title: Text(path.title),
                  subtitle: Text(path.description),
                ),
              ),
            ),
            if (_fetchedOptions.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Recommended Housing Options',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._fetchedOptions.map(
                (option) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.house),
                    title: Text(option.title),
                    subtitle: Text(option.description),
                    trailing: option.contact != null ? Text(option.contact!) : null,
                  ),
                ),
              ),
            ],
            if (_error != null && _fetchedOptions.isEmpty) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _HousingPathway {
  const _HousingPathway(this.title, this.description);
  final String title;
  final String description;
}

class _HousingResult {
  const _HousingResult({required this.title, required this.description, this.contact});
  final String title;
  final String description;
  final String? contact;
}
