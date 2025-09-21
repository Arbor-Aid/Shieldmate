import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../services/budget_planner_service.dart';
import '../services/expense_manager_service.dart';
import '../services/financial_analyst_service.dart';
import '../services/mcp_service.dart' show McpServiceException;
import '../services/reporting_dashboard_service.dart';
import '../services/webscraping_service.dart';
import '../widgets/animated_card_grid.dart';

typedef JsonMap = Map<String, dynamic>;

class ResourcesHubScreen extends StatefulWidget {
  const ResourcesHubScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<ResourcesHubScreen> createState() => _ResourcesHubScreenState();
}

class _ResourcesHubScreenState extends State<ResourcesHubScreen> {
  final WebscrapingService _webscrapingService = WebscrapingService();
  final BudgetPlannerService _budgetPlannerService = BudgetPlannerService();
  final ExpenseManagerService _expenseManagerService = ExpenseManagerService();
  final FinancialAnalystService _financialAnalystService = FinancialAnalystService();
  final ReportingDashboardService _reportingService = ReportingDashboardService();

  bool _loadingHotspots = false;
  List<_Hotspot> _hotspots = const [];
  String? _error;

  final List<_ResourceLink> _resources = const [
    _ResourceLink('Housing Support', Icons.home_work_outlined, '/resources/housing'),
    _ResourceLink('Employment Services', Icons.work_outline, '/resources/employment'),
    _ResourceLink('Health & Wellness', Icons.healing, '/resources/health'),
    _ResourceLink('Benefits & Finance', Icons.attach_money, '/resources/benefits'),
    _ResourceLink('Service Locator', Icons.map, '/service-locator'),
  ];

  Future<void> _fetchHotspots() async {
    if (_loadingHotspots) {
      return;
    }

    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      _showSnack('Sign in to access hotspot analytics.');
      return;
    }

    setState(() {
      _loadingHotspots = true;
      _error = null;
    });

    try {
      final response = await _webscrapingService.search('veteran poverty zip codes');
      if (!mounted) {
        return;
      }
      setState(() => _hotspots = _parseHotspots(response));
      _showSnack('Hotspots updated.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = error.message;
        _hotspots = const [];
      });
      _showSnack('Service temporarily unavailable');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _error = 'Unable to fetch hotspot data right now.';
        _hotspots = const [];
      });
      _showSnack('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loadingHotspots = false);
      }
    }
  }

  void _showAutomationSheet(_AutomationAction action) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      builder: (context) {
        return Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: 24 + MediaQuery.of(context).viewInsets.bottom,
          ),
          child: FutureBuilder<JsonMap>(
            future: action.run(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SizedBox(
                  height: 160,
                  child: Center(child: CircularProgressIndicator()),
                );
              }
              if (snapshot.hasError) {
                return SizedBox(
                  height: 160,
                  child: Center(
                    child: Text(
                      'Could not reach ${action.title}. Please try again later.',
                      style: const TextStyle(color: Colors.redAccent),
                      textAlign: TextAlign.center,
                    ),
                  ),
                );
              }

              final data = snapshot.data ?? const <String, dynamic>{};
              final pretty = const JsonEncoder.withIndent('  ').convert(data);

              return Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    action.title,
                    style: Theme.of(context)
                        .textTheme
                        .titleLarge
                        ?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Text(action.subtitle),
                  const SizedBox(height: 16),
                  Container(
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F3FF),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.all(16),
                    child: SelectableText(
                      pretty,
                      style: const TextStyle(
                        fontFamily: 'Courier',
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  List<_Hotspot> _parseHotspots(JsonMap response) {
    final data = response['results'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _Hotspot(
              region: entry['region']?.toString() ?? entry['title']?.toString() ?? 'Region',
              summary: entry['summary']?.toString() ?? entry['description']?.toString(),
              score: entry['score']?.toString(),
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
    final automationActions = [
      _AutomationAction(
        title: 'AI Budget Planner',
        subtitle: 'Generate a spending plan in seconds.',
        icon: Icons.account_balance_wallet,
        run: () => _budgetPlannerService.getPlan({
          'monthlyIncome': 6200,
          'objectives': ['Emergency fund', 'PCS savings'],
          'expenses': {
            'housing': 2100,
            'transportation': 475,
            'groceries': 540,
            'childcare': 320,
          },
        }),
      ),
      _AutomationAction(
        title: 'Expense Manager',
        subtitle: 'Log and categorize a field expense report.',
        icon: Icons.receipt_long,
        run: () => _expenseManagerService.submitExpense({
          'category': 'Equipment',
          'amount': 218.50,
          'description': 'Replacement training gear order',
        }),
      ),
      _AutomationAction(
        title: 'Financial Analyst',
        subtitle: 'Review asset allocation against mission risk.',
        icon: Icons.stacked_line_chart,
        run: () => _financialAnalystService.analyzePortfolio({
          'holdings': [
            {'symbol': 'VMFXX', 'allocation': 0.35},
            {'symbol': 'VTSAX', 'allocation': 0.45},
            {'symbol': 'BND', 'allocation': 0.20},
          ],
        }),
      ),
      _AutomationAction(
        title: 'Reporting Snapshot',
        subtitle: 'Return enterprise metrics from MCP analytics.',
        icon: Icons.bar_chart,
        run: () => _reportingService.getAnalytics(region: 'US'),
      ),
    ];

    final body = SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Row(
                  children: [
                    Icon(Icons.wifi_tethering,
                        size: 40, color: Theme.of(context).colorScheme.primary),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text(
                            'Find Hotspots',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          SizedBox(height: 6),
                          Text(
                            'Identify communities with the highest need for support.',
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _loadingHotspots ? null : _fetchHotspots,
                      child: _loadingHotspots
                          ? const SizedBox(
                              height: 16,
                              width: 16,
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            )
                          : const Text('Scan'),
                    ),
                  ],
                ),
              ),
            ),
            if (_hotspots.isNotEmpty) ...[
              const SizedBox(height: 20),
              const Text(
                'Community Hotspots',
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),
              ..._hotspots.map(
                (spot) => Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: const Icon(Icons.place),
                    title: Text(spot.region),
                    subtitle: Text(spot.summary ?? 'High-need region identified.'),
                    trailing: spot.score != null ? Chip(label: Text('Score ${spot.score}')) : null,
                  ),
                ),
              ),
            ],
            if (_error != null && _hotspots.isEmpty) ...[
              const SizedBox(height: 20),
              Text(
                _error!,
                style: const TextStyle(color: Colors.redAccent),
              ),
            ],
            const SizedBox(height: 24),
            const Text(
              'MCP Automations',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            AnimatedCardGrid(
              items: automationActions
                  .map(
                    (action) => AnimatedCardItem(
                      title: action.title,
                      subtitle: action.subtitle,
                      icon: action.icon,
                      onTap: () => _showAutomationSheet(action),
                      trailing: const Icon(Icons.auto_awesome),
                    ),
                  )
                  .toList(),
              crossAxisCount: 2,
              aspectRatio: 1.5,
            ),
            const SizedBox(height: 24),
            const Text(
              'Resource Library',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            AnimatedCardGrid(
              items: _resources
                  .map(
                    (resource) => AnimatedCardItem(
                      title: resource.title,
                      subtitle: 'Open ${resource.title.toLowerCase()}',
                      icon: resource.icon,
                      onTap: () => Navigator.of(context).pushNamed(resource.route),
                      trailing: const Icon(Icons.arrow_forward),
                    ),
                  )
                  .toList(),
              crossAxisCount: 2,
              aspectRatio: 1.4,
            ),
          ],
        ),
      ),
    );

    if (widget.embedded) {
      return body;
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Resource Center'),
        actions: [
          IconButton(
            onPressed: _loadingHotspots ? null : _fetchHotspots,
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh hotspots',
          ),
        ],
      ),
      body: body,
    );
  }
}

class _ResourceLink {
  const _ResourceLink(this.title, this.icon, this.route);
  final String title;
  final IconData icon;
  final String route;
}

class _Hotspot {
  const _Hotspot({required this.region, this.summary, this.score});
  final String region;
  final String? summary;
  final String? score;
}

class _AutomationAction {
  const _AutomationAction({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.run,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Future<JsonMap> Function() run;
}
