import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/benefits_service.dart';

class BenefitsScreen extends StatefulWidget {
  const BenefitsScreen({super.key});

  @override
  State<BenefitsScreen> createState() => _BenefitsScreenState();
}

class _BenefitsScreenState extends State<BenefitsScreen> {
  final BenefitsService _benefitsService = BenefitsService();

  bool _loading = false;
  List<_BenefitRecommendation> _recommendations = const [];
  String? _error;

  final List<_BenefitItem> _benefits = const [
    _BenefitItem('GI Bill & Education',
        'Explore tuition assistance, certifications, and online learning programs.'),
    _BenefitItem(
        'Disability Compensation', 'Understand eligibility, documentation, and claim assistance.'),
    _BenefitItem('Family Support', 'Allowances, childcare, and family readiness resources.'),
    _BenefitItem('Financial Planning',
        'Schedule sessions with financial counselors for budgeting and savings.'),
  ];

  Future<void> _fetchBenefits() async {
    if (_loading) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to see VA benefits tailored to you.');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _benefitsService.fetchRecommendations();
      if (!mounted) {
        return;
      }
      setState(() {
        _recommendations = _parseRecommendations(response);
      });
      _showSnack('Benefits recommendations updated.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _recommendations = const [];
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to fetch benefits right now.';
        _recommendations = const [];
      });
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  List<_BenefitRecommendation> _parseRecommendations(Map<String, dynamic> response) {
    final data = response['benefits'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _BenefitRecommendation(
              title: entry['title']?.toString() ?? 'Benefit',
              description: entry['description']?.toString() ?? 'No description available.',
              status: entry['status']?.toString(),
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
        title: const Text('Benefits & Financial Assistance'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _fetchBenefits,
            icon: _loading
                ? const SizedBox(
                    height: 16,
                    width: 16,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.refresh),
            tooltip: 'Refresh benefits',
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _fetchBenefits,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            ..._benefits.map(
              (item) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.stars),
                  title: Text(item.title),
                  subtitle: Text(item.description),
                ),
              ),
            ),
            if (_recommendations.isNotEmpty) ...[
              const SizedBox(height: 8),
              const Text(
                'Recommended Actions',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              ..._recommendations.map(
                (item) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.assignment_turned_in),
                    title: Text(item.title),
                    subtitle: Text(item.description),
                    trailing: item.status != null ? Chip(label: Text(item.status!)) : null,
                  ),
                ),
              ),
            ],
            if (_error != null && _recommendations.isEmpty) ...[
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
        onPressed: _loading ? null : _fetchBenefits,
        icon: const Icon(Icons.account_balance),
        label: const Text('Fetch benefits'),
      ),
    );
  }
}

class _BenefitItem {
  const _BenefitItem(this.title, this.description);
  final String title;
  final String description;
}

class _BenefitRecommendation {
  const _BenefitRecommendation({required this.title, required this.description, this.status});
  final String title;
  final String description;
  final String? status;
}
