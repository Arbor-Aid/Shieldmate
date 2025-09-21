import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ExpenseManagerService extends McpService {
  ExpenseManagerService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Expense Manager',
          baseUri: baseUri ?? EnvConfig.expenseManagerUri,
          isConfigured: enabled ?? EnvConfig.hasExpenseManagerMcp,
        );

  Future<JsonMap> submitExpense(JsonMap expense) {
    return postJson(body: expense);
  }
}
