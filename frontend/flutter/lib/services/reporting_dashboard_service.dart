import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ReportingDashboardService extends McpService {
  ReportingDashboardService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Reporting Dashboard',
          baseUri: baseUri ?? EnvConfig.reportingDashboardUri,
          isConfigured: enabled ?? EnvConfig.hasReportingDashboardUri,
        );

  Future<JsonMap> getAnalytics({String region = 'US'}) {
    return postJson(body: {'region': region});
  }

  Future<JsonMap> getSummary() {
    return getJson();
  }
}
