import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class BenefitsService extends McpService {
  BenefitsService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Benefits',
          baseUri: baseUri ?? EnvConfig.benefitsMcp,
          isConfigured: enabled ?? EnvConfig.hasBenefitsMcp,
        );

  Future<JsonMap> fetchRecommendations() {
    final user = firebaseAuth.currentUser;
    final payload = {
      if (user != null) 'userId': user.uid,
    };
    return postJson(body: payload);
  }
}
