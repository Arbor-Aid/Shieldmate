import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ReferralService extends McpService {
  ReferralService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Referral',
          baseUri: baseUri ?? EnvConfig.referralMcp,
          isConfigured: enabled ?? EnvConfig.hasReferralMcp,
        );

  Future<JsonMap> getReferrals(JsonMap answers) {
    final payload = {
      'answers': answers,
      'userId': firebaseAuth.currentUser?.uid,
    };
    return postJson(body: payload);
  }
}
