import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class HousingService extends McpService {
  HousingService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Housing',
          baseUri: baseUri ?? EnvConfig.housingMcp,
          isConfigured: enabled ?? EnvConfig.hasHousingMcp,
        );

  Future<JsonMap> fetchOptions() {
    final user = firebaseAuth.currentUser;
    final payload = {
      if (user != null) 'userId': user.uid,
    };
    return postJson(body: payload);
  }
}
