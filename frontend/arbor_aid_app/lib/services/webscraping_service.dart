import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class WebscrapingService extends McpService {
  WebscrapingService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Webscraping',
          baseUri: baseUri ?? EnvConfig.webscrapingMcp,
          isConfigured: enabled ?? EnvConfig.hasWebscrapingMcp,
        );

  Future<JsonMap> search(String query) {
    return postJson(body: {'query': query});
  }
}
