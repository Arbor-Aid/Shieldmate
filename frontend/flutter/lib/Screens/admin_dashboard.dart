import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/conversations_service.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  final ConversationsService _conversationsService = ConversationsService();

  bool _loading = true;
  String? _error;
  List<_LeadershipInsight> _insights = const [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _fetchLeadershipSummary());
  }

  Future<void> _fetchLeadershipSummary() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _conversationsService.sendMessage(
        'Provide strategic summary for leadership dashboard.',
        userId: 'ceo-agent',
      );
      if (!mounted) {
        return;
      }
      setState(() {
        _insights = _parseInsights(response);
        _loading = false;
      });
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _insights = const [];
        _loading = false;
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to fetch leadership summary right now.';
        _insights = const [];
        _loading = false;
      });
      _showSnack('Service temporarily unavailable');
    }
  }

  List<_LeadershipInsight> _parseInsights(Map<String, dynamic> response) {
    final messages = response['messages'] ?? response['data'];
    if (messages is List) {
      return messages
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _LeadershipInsight(
              title: entry['title']?.toString() ?? 'Focus Area',
              content: entry['content']?.toString() ?? entry['summary']?.toString() ?? '',
            ),
          )
          .where((insight) => insight.content.isNotEmpty)
          .toList();
    }
    if (response.containsKey('summary')) {
      return [
        _LeadershipInsight(
          title: 'Summary',
          content: response['summary'].toString(),
        ),
      ];
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
        title: const Text('Admin Dashboard'),
        actions: [
          IconButton(
            onPressed: _loading ? null : _fetchLeadershipSummary,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh summary',
          ),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(16),
              child: _insights.isEmpty
                  ? Center(
                      child: Text(
                        _error ?? 'No leadership insights available yet.',
                        textAlign: TextAlign.center,
                      ),
                    )
                  : ListView.separated(
                      itemCount: _insights.length,
                      separatorBuilder: (_, __) => const SizedBox(height: 12),
                      itemBuilder: (context, index) {
                        final insight = _insights[index];
                        return Card(
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  insight.title,
                                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                                ),
                                const SizedBox(height: 8),
                                Text(insight.content),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}

class _LeadershipInsight {
  const _LeadershipInsight({required this.title, required this.content});
  final String title;
  final String content;
}
