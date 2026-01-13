import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ResumeBuilderService extends McpService {
  ResumeBuilderService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Resume Builder',
          baseUri: baseUri ?? EnvConfig.resumeBuilderUri,
          isConfigured: enabled ?? EnvConfig.hasResumeBuilderUri,
        );

  Future<JsonMap> buildResume(JsonMap profile) async {
    final user = firebaseAuth.currentUser;
    final payload = <String, dynamic>{
      'profile': profile,
      if (user != null) 'userId': user.uid,
      if (user?.email != null) 'email': user!.email,
    };
    return postJson(body: payload);
  }
}
