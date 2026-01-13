import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/employment_service.dart';

class EmploymentScreen extends StatefulWidget {
  const EmploymentScreen({super.key});

  @override
  State<EmploymentScreen> createState() => _EmploymentScreenState();
}

class _EmploymentScreenState extends State<EmploymentScreen> {
  final EmploymentService _employmentService = EmploymentService();

  bool _loading = false;
  List<_EmploymentResult> _results = const [];
  String? _error;

  final List<_Opportunity> _opportunities = const [
    _Opportunity('Logistics Operations Lead', 'Camp Lejeune - Transitioning service members'),
    _Opportunity('Cybersecurity Analyst', 'Remote - Security clearance recommended'),
    _Opportunity('Project Coordinator', 'San Diego - Veterans preferred'),
  ];

  Future<void> _fetchEmployment() async {
    if (_loading) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to fetch tailored opportunities.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _employmentService.fetchOpportunities();
      if (!mounted) {
        return;
      }
      setState(() {
        _results = _parseJobs(response);
      });
      _showSnack('Employment opportunities updated.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _results = const [];
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to fetch opportunities right now.';
        _results = const [];
      });
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<_EmploymentResult> _parseJobs(Map<String, dynamic> response) {
    final jobs = response['jobs'] ?? response['data'];
    if (jobs is List) {
      return jobs
          .whereType<Map<String, dynamic>>()
          .map(
            (job) => _EmploymentResult(
              title: job['title']?.toString() ?? 'Opportunity',
              location: job['location']?.toString() ?? 'Location TBD',
              summary: job['summary']?.toString() ??
                  job['description']?.toString() ??
                  'No summary available.',
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
        title: const Text('Employment & Career Resources'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _fetchEmployment,
            icon: _loading
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Refresh opportunities',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchEmployment,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Card(
              child: ListTile(
                leading: const Icon(Icons.work_outline),
                title: const Text('Career Coaching'),
                subtitle: const Text(
                  'Schedule one-on-one sessions to translate your MOS and build resumes.',
                ),
                trailing: TextButton(onPressed: () {}, child: const Text('Book')),
              ),
            ),
            const SizedBox(height: 12),
            Card(
              child: ListTile(
                leading: const Icon(Icons.school),
                title: const Text('SkillBridge & Apprenticeships'),
                subtitle: const Text(
                  'Connect with DOD-approved partners for real-world experience before separation.',
                ),
                trailing: TextButton(onPressed: () {}, child: const Text('Explore')),
              ),
            ),
            const SizedBox(height: 16),
            const Text(
              'Highlighted Roles',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            ..._opportunities.map((role) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.badge),
                    title: Text(role.title),
                    subtitle: Text(role.details),
                  ),
                )),
            if (_results.isNotEmpty) ...[
              const SizedBox(height: 16),
              const Text(
                'Recommended for You',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._results.map(
                (job) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.workspace_premium),
                    title: Text(job.title),
                    subtitle: Text('${job.location}\n${job.summary}'),
                    isThreeLine: true,
                  ),
                ),
              ),
            ],
            if (_error != null && _results.isEmpty) ...[
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
        onPressed: _loading ? null : _fetchEmployment,
        icon: const Icon(Icons.send),
        label: const Text('Fetch opportunities'),
      ),
    );
  }
}

class _Opportunity {
  const _Opportunity(this.title, this.details);
  final String title;
  final String details;
}

class _EmploymentResult {
  const _EmploymentResult({required this.title, required this.location, required this.summary});
  final String title;
  final String location;
  final String summary;
}
