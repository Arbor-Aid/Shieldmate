import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class BudgetPlannerService extends McpService {
  BudgetPlannerService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Budget Planner',
          baseUri: baseUri ?? EnvConfig.aiBudgetPlannerUri,
          isConfigured: enabled ?? EnvConfig.hasAiBudgetPlannerMcp,
        );

  Future<JsonMap> getPlan(JsonMap input) {
    return postJson(body: input);
  }
}
