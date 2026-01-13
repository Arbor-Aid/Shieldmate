import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class HealthService extends McpService {
  HealthService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Health',
          baseUri: baseUri ?? EnvConfig.healthMcp,
          isConfigured: enabled ?? EnvConfig.hasHealthMcp,
        );

  Future<JsonMap> fetchResources() {
    final user = firebaseAuth.currentUser;
    final payload = {
      if (user != null) 'userId': user.uid,
    };
    return postJson(body: payload);
  }
}
