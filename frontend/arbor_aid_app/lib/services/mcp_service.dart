import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

typedef JsonMap = Map<String, dynamic>;

class McpServiceException implements Exception {
  McpServiceException(this.message, {this.statusCode, this.details});

  final String message;
  final int? statusCode;
  final Object? details;

  @override
  String toString() =>
      'McpServiceException(message: $message, statusCode: $statusCode, details: $details)';
}

abstract class McpService {
  McpService({
    required this.serviceName,
    required Uri baseUri,
    required bool isConfigured,
    http.Client? httpClient,
    FirebaseAuth? firebaseAuth,
    Future<String> Function()? tokenProvider,
  })  : _baseUri = baseUri,
        _isConfigured = isConfigured,
        _httpClient = httpClient ?? http.Client(),
        _firebaseAuth = firebaseAuth,
        _tokenProvider = tokenProvider;

  final String serviceName;
  final Uri _baseUri;
  final bool _isConfigured;
  final http.Client _httpClient;
  final FirebaseAuth? _firebaseAuth;
  final Future<String> Function()? _tokenProvider;

  @protected
  Uri get baseUri => _baseUri;

  @protected
  FirebaseAuth get firebaseAuth => _firebaseAuth ?? FirebaseAuth.instance;

  @protected
  bool get isConfigured => _isConfigured;

  Future<JsonMap> postJson({
    JsonMap body = const {},
    String? path,
    Map<String, String>? headers,
  }) async {
    if (!_isConfigured) {
      return _placeholderResponse(body);
    }

    final uri = _resolve(path);
    final token = await _getIdToken();
    final effectiveHeaders = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
      ...?headers,
    };

    try {
      final response = await _httpClient.post(
        uri,
        headers: effectiveHeaders,
        body: jsonEncode(body),
      );
      return _handleResponse(response);
    } on McpServiceException {
      rethrow;
    } catch (error, stackTrace) {
      if (kDebugMode) {
        debugPrint('[$serviceName] POST $uri failed: $error');
        debugPrint('$stackTrace');
      }
      throw McpServiceException(
        'Failed to reach $serviceName service.',
        details: error,
      );
    }
  }

  Future<JsonMap> getJson({
    String? path,
    Map<String, String>? headers,
    Map<String, dynamic>? query,
  }) async {
    if (!_isConfigured) {
      return _placeholderResponse(query ?? const {});
    }

    final uri = _resolve(path, queryParameters: query);
    final token = await _getIdToken();
    final effectiveHeaders = {
      'Authorization': 'Bearer $token',
      ...?headers,
    };

    try {
      final response = await _httpClient.get(uri, headers: effectiveHeaders);
      return _handleResponse(response);
    } on McpServiceException {
      rethrow;
    } catch (error, stackTrace) {
      if (kDebugMode) {
        debugPrint('[$serviceName] GET $uri failed: $error');
        debugPrint('$stackTrace');
      }
      throw McpServiceException(
        'Failed to reach $serviceName service.',
        details: error,
      );
    }
  }

  JsonMap _handleResponse(http.Response response) {
    final decoded = _decode(response.body);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is JsonMap) {
        return decoded;
      }
      return {'data': decoded};
    }

    throw McpServiceException(
      '$serviceName request failed with status ${response.statusCode}',
      statusCode: response.statusCode,
      details: decoded,
    );
  }

  dynamic _decode(String body) {
    if (body.isEmpty) {
      return const <String, dynamic>{};
    }
    try {
      return jsonDecode(body);
    } catch (error) {
      if (kDebugMode) {
        debugPrint('[$serviceName] Failed to decode response body: $error');
      }
      return {'raw': body};
    }
  }

  Uri _resolve(String? path, {Map<String, dynamic>? queryParameters}) {
    if (path == null || path.isEmpty) {
      if (queryParameters == null || queryParameters.isEmpty) {
        return _baseUri;
      }
      return _baseUri.replace(queryParameters: _encodeQuery(queryParameters));
    }
    final resolved = _baseUri.resolve(path);
    if (queryParameters == null || queryParameters.isEmpty) {
      return resolved;
    }
    return resolved.replace(queryParameters: _encodeQuery(queryParameters));
  }

  Map<String, String> _encodeQuery(Map<String, dynamic> query) {
    return query.map((key, value) => MapEntry(key, value?.toString() ?? ''));
  }

  Future<String> _getIdToken() async {
    if (_tokenProvider != null) {
      final token = await _tokenProvider!.call();
      if (token.isNotEmpty) {
        return token;
      }
    }

    final auth = _firebaseAuth ?? FirebaseAuth.instance;
    final user = auth.currentUser;
    if (user == null) {
      throw McpServiceException(
        'You must be signed in before using $serviceName.',
      );
    }

    final token = await user.getIdToken();
    if (token == null || token.isEmpty) {
      throw McpServiceException(
        'Unable to retrieve Firebase ID token for $serviceName.',
      );
    }
    return token;
  }

  JsonMap _placeholderResponse(JsonMap payload) {
    return {
      'status': 'placeholder',
      'service': serviceName,
      'message': '$serviceName endpoint is not configured. '
          'Update your .env or deployment environment.',
      'echo': payload,
      'endpoint': _baseUri.toString(),
    };
  }
}
