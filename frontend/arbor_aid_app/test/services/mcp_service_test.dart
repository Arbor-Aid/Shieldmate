import 'dart:convert';

import 'package:arbor_aid_app/services/budget_planner_service.dart';
import 'package:arbor_aid_app/services/mcp_service.dart';
import 'package:arbor_aid_app/services/reporting_dashboard_service.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:http/http.dart' as http;
import 'package:http/testing.dart';

void main() {
  group('BudgetPlannerService', () {
    test('getPlan posts payload with auth header', () async {
      final mockClient = MockClient((request) async {
        expect(request.url.toString(), equals('https://budget.example.com'));
        expect(request.headers['Authorization'], equals('Bearer fake-jwt'));
        expect(request.headers['Content-Type'], contains('application/json'));

        final body = jsonDecode(request.body) as Map<String, dynamic>;
        expect(body['monthlyIncome'], equals(6200));
        expect(body['goals'], contains('Emergency fund'));

        return http.Response(jsonEncode({'status': 'ok'}), 200);
      });

      final service = BudgetPlannerService(
        httpClient: mockClient,
        tokenProvider: () async => 'fake-jwt',
        baseUri: Uri.parse('https://budget.example.com'),
        enabled: true,
      );

      final result = await service.getPlan({
        'monthlyIncome': 6200,
        'goals': ['Emergency fund'],
      });

      expect(result, equals({'status': 'ok'}));
    });

    test('returns placeholder when service disabled', () async {
      final service = BudgetPlannerService(
        tokenProvider: () async => 'unused',
        enabled: false,
        baseUri: Uri.parse('https://placeholder.invalid'),
      );

      final result = await service.getPlan({'demo': true});

      expect(result['status'], equals('placeholder'));
      expect(result['service'], equals('Budget Planner'));
    });
  });

  group('ReportingDashboardService', () {
    test('throws McpServiceException on non-success', () async {
      final mockClient = MockClient((request) async {
        return http.Response('{"error":"forbidden"}', 403);
      });

      final service = ReportingDashboardService(
        httpClient: mockClient,
        tokenProvider: () async => 'fake-token',
        baseUri: Uri.parse('https://analytics.example.com'),
        enabled: true,
      );

      expect(
        () => service.getAnalytics(region: 'US'),
        throwsA(isA<McpServiceException>()
            .having((e) => e.statusCode, 'statusCode', 403)),
      );
    });
  });
}
