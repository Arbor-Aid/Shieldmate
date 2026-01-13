import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/health_service.dart';

class HealthScreen extends StatefulWidget {
  const HealthScreen({super.key});

  @override
  State<HealthScreen> createState() => _HealthScreenState();
}

class _HealthScreenState extends State<HealthScreen> {
  final HealthService _healthService = HealthService();

  bool _loading = false;
  List<_HealthResource> _resources = const [];
  String? _error;

  final List<_HealthService> _featuredServices = const [
    _HealthService(
        'Behavioral Health', 'Confidential counseling, resilience training, and crisis support.'),
    _HealthService('Telehealth', 'Schedule secure virtual appointments with providers nationwide.'),
    _HealthService(
        'Medical Navigation', 'Connect with TRICARE resources and appointment scheduling.'),
    _HealthService(
        'Peer Support Groups', 'Join Marine-led groups focusing on transition and wellness.'),
  ];

  Future<void> _fetchHealthResources() async {
    if (_loading) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to view personalized health resources.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _healthService.fetchResources();
      if (!mounted) {
        return;
      }
      setState(() {
        _resources = _parseResources(response);
      });
      _showSnack('Health resources refreshed.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _resources = const [];
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to fetch resources right now.';
        _resources = const [];
      });
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<_HealthResource> _parseResources(Map<String, dynamic> response) {
    final data = response['resources'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _HealthResource(
              name: entry['name']?.toString() ?? 'Resource',
              description: entry['description']?.toString() ?? 'No description available.',
              link: entry['link']?.toString(),
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
      appBar: AppBar(
        title: const Text('Health & Wellness'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _fetchHealthResources,
            icon: _loading
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Refresh recommendations',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchHealthResources,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ..._featuredServices.map(
              (service) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.favorite),
                  title: Text(service.title),
                  subtitle: Text(service.description),
                ),
              ),
            ),
            if (_resources.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text(
                'Personalized Resources',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._resources.map(
                (resource) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.health_and_safety),
                    title: Text(resource.name),
                    subtitle: Text(resource.description),
                    trailing: resource.link != null ? const Icon(Icons.open_in_new) : null,
                    onTap: resource.link != null ? () => _showSnack('Open ${resource.link}') : null,
                  ),
                ),
              ),
            ],
            if (_error != null && _resources.isEmpty) ...[
              const SizedBox(height: 16),
              Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _loading ? null : _fetchHealthResources,
        icon: const Icon(Icons.health_and_safety),
        label: const Text('Fetch resources'),
      ),
    );
  }
}

class _HealthService {
  const _HealthService(this.title, this.description);
  final String title;
  final String description;
}

class _HealthResource {
  const _HealthResource({required this.name, required this.description, this.link});
  final String name;
  final String description;
  final String? link;
}
