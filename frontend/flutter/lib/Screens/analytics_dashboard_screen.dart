import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../services/mcp_service.dart' show McpServiceException;
import '../services/reporting_dashboard_service.dart';
import '../services/robinhood_broker_service.dart';
import '../widgets/header_bar.dart';

class AnalyticsDashboardScreen extends StatefulWidget {
  const AnalyticsDashboardScreen({super.key});

  @override
  State<AnalyticsDashboardScreen> createState() => _AnalyticsDashboardScreenState();
}

class _AnalyticsDashboardScreenState extends State<AnalyticsDashboardScreen> {
  final ReportingDashboardService _reportingService = ReportingDashboardService();
  final RobinhoodBrokerService _robinhoodService = RobinhoodBrokerService();

  static const JsonEncoder _prettyJson = JsonEncoder.withIndent('  ');

  bool _loadingAnalytics = true;
  bool _loadingRobinhood = true;
  bool _brokerBusy = false;
  Map<String, dynamic>? _analyticsData;
  Map<String, dynamic>? _robinhoodData;
  String? _analyticsError;
  String? _robinhoodError;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _refreshAnalytics();
      _refreshRobinhood();
    });
  }

  Future<void> _refreshAnalytics() async {
    setState(() {
      _loadingAnalytics = true;
      _analyticsError = null;
    });

    try {
      final response = await _reportingService.getAnalytics(region: 'US');
      if (!mounted) {
        return;
      }
      setState(() {
        _analyticsData = response;
        _loadingAnalytics = false;
      });
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _analyticsError = error.message;
        _loadingAnalytics = false;
      });
      _showSnack('Service temporarily unavailable');
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _analyticsError = 'Unable to load analytics right now.';
        _loadingAnalytics = false;
      });
      _showSnack('Service temporarily unavailable');
    }
  }

  Future<void> _refreshRobinhood() async {
    setState(() {
      _loadingRobinhood = true;
      _robinhoodError = null;
    });

    final userId = FirebaseAuth.instance.currentUser?.uid ?? 'demo-user';

    try {
      final response = await _robinhoodService.getPortfolio(userId: userId);
      if (!mounted) {
        return;
      }
      setState(() {
        _robinhoodData = response;
        _loadingRobinhood = false;
      });
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _robinhoodError = error.message;
        _loadingRobinhood = false;
      });
      _showSnack('Service temporarily unavailable');
    } catch (error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _robinhoodError = 'Unable to load market data right now.';
        _loadingRobinhood = false;
      });
      _showSnack('Service temporarily unavailable');
    }
  }

  Future<void> _handleViewPositions() async {
    if (_brokerBusy) {
      return;
    }
    setState(() => _brokerBusy = true);
    try {
      final data = await _robinhoodService.getPositions();
      if (!mounted) {
        return;
      }
      await _showBrokerSheet('Robinhood Positions', data);
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnack('Unable to load positions: $error');
    } finally {
      if (mounted) {
        setState(() => _brokerBusy = false);
      }
    }
  }

  Future<void> _handlePlaceOrder() async {
    if (_brokerBusy) {
      return;
    }
    const payload = {
      'symbol': 'AAPL',
      'side': 'buy',
      'quantity': 1,
      'orderType': 'market',
      'timeInForce': 'gtc',
    };
    setState(() => _brokerBusy = true);
    try {
      final data = await _robinhoodService.placeOrder(payload);
      if (!mounted) {
        return;
      }
      await _showBrokerSheet('Paper Order Placed', data);
    } catch (error) {
      if (!mounted) {
        return;
      }
      _showSnack('Order request failed: $error');
    } finally {
      if (mounted) {
        setState(() => _brokerBusy = false);
      }
    }
  }

  Future<void> _showBrokerSheet(String title, Map<String, dynamic> payload) async {
    final pretty = _prettyJson.convert(payload);
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        final theme = Theme.of(sheetContext);
        final bottomPadding = MediaQuery.of(sheetContext).viewInsets.bottom;
        return FractionallySizedBox(
          heightFactor: 0.7,
          child: Padding(
            padding: EdgeInsets.fromLTRB(24, 24, 24, bottomPadding + 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                Expanded(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.35),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: SingleChildScrollView(
                        child: SelectableText(
                          pretty,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            fontFamily: 'Courier',
                            height: 1.4,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
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
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: HeaderBar(
          title: 'Analytics Dashboard',
          actions: [
            IconButton(
              onPressed: () {
                _refreshAnalytics();
                _refreshRobinhood();
              },
              icon: const Icon(Icons.refresh),
            ),
          ],
          bottom: const TabBar(
            tabs: [
              Tab(icon: Icon(Icons.analytics), text: 'Mission Metrics'),
              Tab(icon: Icon(Icons.trending_up), text: 'Robinhood'),
            ],
          ),
        ),
        body: TabBarView(
          children: [
            RefreshIndicator(
              onRefresh: _refreshAnalytics,
              child: _buildAnalyticsView(),
            ),
            RefreshIndicator(
              onRefresh: _refreshRobinhood,
              child: _buildRobinhoodView(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyticsView() {
    if (_loadingAnalytics) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_analyticsError != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            _analyticsError!,
            style: const TextStyle(color: Colors.redAccent),
          ),
        ],
      );
    }

    final data = _analyticsData ?? const <String, dynamic>{};
    final summary = (data['summary'] as Map?)?.cast<String, dynamic>();
    final regions = _extractTableData(data, 'regions');
    final programs = _extractTableData(data, 'programs');
    final readinessTrend = _extractReadinessTrend(data);

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [
        if (readinessTrend.isNotEmpty) ...[
          _MissionReadinessChart(dataPoints: readinessTrend),
          const SizedBox(height: 24),
        ],
        if (summary != null && summary.isNotEmpty) ...[
          const Text(
            'Operational Summary',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: summary.entries
                .map(
                  (entry) => _MetricCard(
                    icon: Icons.insights,
                    label: _formatTitle(entry.key),
                    value: entry.value.toString(),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 24),
        ],
        if (regions.isNotEmpty) ...[
          const Text(
            'Regional Performance',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          _buildDataTable(regions),
          const SizedBox(height: 24),
        ],
        if (programs.isNotEmpty) ...[
          const Text(
            'Program Outcomes',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          _buildDataTable(programs),
          const SizedBox(height: 24),
        ],
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Raw Analytics Payload',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  _prettyJson.convert(data),
                  style: const TextStyle(fontFamily: 'Courier', fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildRobinhoodView() {
    if (_loadingRobinhood) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_robinhoodError != null) {
      return ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            _robinhoodError!,
            style: const TextStyle(color: Colors.redAccent),
          ),
        ],
      );
    }

    final data = _robinhoodData ?? const <String, dynamic>{};
    final summary = (data['summary'] as Map?)?.cast<String, dynamic>();
    final positions = _extractTableData(data, 'positions');
    final trades = _extractTableData(data, 'trades');

    return ListView(
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                FilledButton.icon(
                  onPressed: _brokerBusy ? null : _handleViewPositions,
                  icon: const Icon(Icons.stacked_line_chart),
                  label: const Text('View Positions'),
                ),
                OutlinedButton.icon(
                  onPressed: _brokerBusy ? null : _handlePlaceOrder,
                  icon: const Icon(Icons.shopping_cart_checkout),
                  label: _brokerBusy ? const Text('Working...') : const Text('Place Test Order'),
                ),
              ],
            ),
          ),
        ),
        if (summary != null && summary.isNotEmpty) ...[
          const Text(
            'Portfolio Snapshot',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 16,
            runSpacing: 16,
            children: summary.entries
                .map(
                  (entry) => _MetricCard(
                    icon: Icons.leaderboard,
                    label: _formatTitle(entry.key),
                    value: entry.value.toString(),
                  ),
                )
                .toList(),
          ),
          const SizedBox(height: 24),
        ],
        if (positions.isNotEmpty) ...[
          const Text(
            'Active Positions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          _buildDataTable(positions),
          const SizedBox(height: 24),
        ],
        if (trades.isNotEmpty) ...[
          const Text(
            'Recent Trades',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          _buildDataTable(trades),
          const SizedBox(height: 24),
        ],
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Raw Robinhood Payload',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  _prettyJson.convert(data),
                  style: const TextStyle(fontFamily: 'Courier', fontSize: 12),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  List<Map<String, dynamic>> _extractTableData(Map<String, dynamic> source, String key) {
    final value = source[key];
    if (value is List) {
      return value.whereType<Map>().map((entry) => entry.cast<String, dynamic>()).toList();
    }
    return const [];
  }

  List<double> _extractReadinessTrend(Map<String, dynamic> source) {
    final trend = source['readinessTrend'] ?? source['trend'];
    if (trend is List) {
      final values = trend.whereType<num>().map((value) => value.toDouble()).toList();
      if (values.isNotEmpty) {
        return values;
      }
    }
    return const [72, 75, 79, 83, 87, 90, 92];
  }

  Widget _buildDataTable(List<Map<String, dynamic>> rows) {
    if (rows.isEmpty) {
      return const SizedBox.shrink();
    }

    final columns = rows.first.keys.toList();
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: DataTable(
        columns: columns.map((col) => DataColumn(label: Text(_formatTitle(col)))).toList(),
        rows: rows
            .map(
              (row) => DataRow(
                cells: columns
                    .map(
                      (col) => DataCell(
                        Text(row[col]?.toString() ?? ''),
                      ),
                    )
                    .toList(),
              ),
            )
            .toList(),
      ),
    );
  }

  static String _formatTitle(String value) {
    return value
        .replaceAll('_', ' ')
        .replaceAll('-', ' ')
        .split(' ')
        .where((segment) => segment.isNotEmpty)
        .map((segment) => segment[0].toUpperCase() + segment.substring(1))
        .join(' ');
  }
}

class _MetricCard extends StatelessWidget {
  const _MetricCard({required this.icon, required this.label, required this.value});

  final IconData icon;
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(icon, size: 32, color: Theme.of(context).colorScheme.secondary),
              const SizedBox(height: 12),
              Text(
                value,
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Text(label),
            ],
          ),
        ),
      ),
    );
  }
}

class _MissionReadinessChart extends StatelessWidget {
  const _MissionReadinessChart({required this.dataPoints});

  final List<double> dataPoints;

  @override
  Widget build(BuildContext context) {
    if (dataPoints.isEmpty) {
      return const SizedBox.shrink();
    }

    final colorScheme = Theme.of(context).colorScheme;
    final spots = <FlSpot>[
      for (var i = 0; i < dataPoints.length; i++) FlSpot(i.toDouble(), dataPoints[i]),
    ];

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Mission Readiness Trend',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 220,
              child: LineChart(
                LineChartData(
                  minY: 0,
                  maxY: 100,
                  borderData: FlBorderData(show: false),
                  gridData: FlGridData(
                    show: true,
                    horizontalInterval: 20,
                    drawVerticalLine: false,
                    getDrawingHorizontalLine: (value) => FlLine(
                      color: colorScheme.onSurface.withValues(alpha: 0.08),
                      strokeWidth: 1,
                    ),
                  ),
                  titlesData: FlTitlesData(
                    topTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: 20,
                        reservedSize: 40,
                        getTitlesWidget: (value, _) => Text(
                          '${value.toInt()}%',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        interval: 1,
                        getTitlesWidget: (value, _) {
                          final index = value.toInt();
                          if (index < 0 || index >= dataPoints.length) {
                            return const SizedBox.shrink();
                          }
                          return Text(
                            'W${index + 1}',
                            style: const TextStyle(fontSize: 12),
                          );
                        },
                      ),
                    ),
                  ),
                  lineTouchData: LineTouchData(
                    enabled: true,
                    touchTooltipData: LineTouchTooltipData(
                      getTooltipItems: (spots) => spots
                          .map(
                            (spot) => LineTooltipItem(
                              'Week ${spot.x.toInt() + 1}\n'
                              '${spot.y.toStringAsFixed(1)}%',
                              const TextStyle(fontWeight: FontWeight.w600),
                            ),
                          )
                          .toList(),
                    ),
                  ),
                  lineBarsData: [
                    LineChartBarData(
                      spots: spots,
                      isCurved: true,
                      barWidth: 4,
                      color: colorScheme.primary,
                      dotData: FlDotData(show: false),
                      belowBarData: BarAreaData(
                        show: true,
                        gradient: LinearGradient(
                          colors: [
                            colorScheme.primary.withValues(alpha: 0.35),
                            colorScheme.primary.withValues(alpha: 0.05),
                          ],
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
