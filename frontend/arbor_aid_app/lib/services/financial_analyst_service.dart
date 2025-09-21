import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class FinancialAnalystService extends McpService {
  FinancialAnalystService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Financial Analyst',
          baseUri: baseUri ?? EnvConfig.financialAnalystUri,
          isConfigured: enabled ?? EnvConfig.hasFinancialAnalystMcp,
        );

  Future<JsonMap> analyzePortfolio(JsonMap portfolio) {
    return postJson(body: portfolio);
  }
}
