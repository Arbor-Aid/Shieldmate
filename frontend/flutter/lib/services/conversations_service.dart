import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class ConversationsService extends McpService {
  ConversationsService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Conversations',
          baseUri: baseUri ?? EnvConfig.conversationsMcp,
          isConfigured: enabled ?? EnvConfig.hasConversationsMcp,
        );

  Future<JsonMap> fetchHistory({String? userId}) {
    final uid = userId ?? firebaseAuth.currentUser?.uid;
    final payload = {
      if (uid != null) 'userId': uid,
    };
    return postJson(body: payload, path: '/history');
  }

  Future<JsonMap> sendMessage(String message, {String? userId}) {
    final uid = userId ?? firebaseAuth.currentUser?.uid;
    final payload = {
      'message': message,
      if (uid != null) 'userId': uid,
    };
    return postJson(body: payload);
  }
}
