import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/env.dart';
import 'mcp_service.dart';

typedef JsonMap = Map<String, dynamic>;

class RobinhoodBrokerService extends McpService {
  RobinhoodBrokerService({
    super.httpClient,
    super.firebaseAuth,
    super.tokenProvider,
    Uri? baseUri,
    bool? enabled,
  }) : super(
          serviceName: 'Robinhood Broker',
          baseUri: baseUri ?? EnvConfig.robinhoodMcp,
          isConfigured: enabled ?? EnvConfig.hasRobinhoodMcp,
        );

  String get _brokerBaseUrl => EnvConfig.robinhoodBroker.trim();

  Uri _brokerUri(String segment) {
    final base = _brokerBaseUrl;
    if (base.isEmpty) {
      throw Exception('Robinhood MCP URL missing.');
    }
    final normalizedBase = base.endsWith('/') ? base : '$base/';
    final sanitizedSegment = segment.startsWith('/') ? segment.substring(1) : segment;
    return Uri.parse('$normalizedBase$sanitizedSegment');
  }

  Future<Map<String, dynamic>> getPositions() async {
    final response = await http.get(_brokerUri('positions'));
    if (response.statusCode == 200) {
      return _decodeBrokerResponse(response);
    }
    throw Exception(
      'Robinhood positions failed: ${response.statusCode} ${response.body}',
    );
  }

  Future<Map<String, dynamic>> placeOrder(Map<String, dynamic> payload) async {
    final response = await http.post(
      _brokerUri('order'),
      headers: const {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
    if (response.statusCode == 200) {
      return _decodeBrokerResponse(response);
    }
    throw Exception(
      'Robinhood order failed: ${response.statusCode} ${response.body}',
    );
  }

  Future<JsonMap> getPortfolio({String? userId}) async {
    final uid = userId ?? firebaseAuth.currentUser?.uid;
    final payload = <String, dynamic>{
      if (uid != null) 'userId': uid,
    };
    return postJson(body: payload);
  }

  Future<JsonMap> placeTrade(JsonMap tradeRequest) {
    return postJson(body: tradeRequest, path: '/trade');
  }

  Map<String, dynamic> _decodeBrokerResponse(http.Response response) {
    if (response.body.isEmpty) {
      return const <String, dynamic>{};
    }
    final decoded = jsonDecode(response.body);
    if (decoded is Map<String, dynamic>) {
      return decoded;
    }
    return {'data': decoded};
  }
}
