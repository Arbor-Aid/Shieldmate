import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class EmploymentService extends McpService {
  EmploymentService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Employment',
          baseUri: baseUri ?? EnvConfig.employmentMcp,
          isConfigured: enabled ?? EnvConfig.hasEmploymentMcp,
        );

  Future<JsonMap> fetchOpportunities() {
    final user = firebaseAuth.currentUser;
    final payload = {
      if (user != null) 'userId': user.uid,
    };
    return postJson(body: payload);
  }
}
