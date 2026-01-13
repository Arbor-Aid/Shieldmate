import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class SessionManager {
  SessionManager({FlutterSecureStorage? secureStorage})
      : _storage = secureStorage ?? const FlutterSecureStorage();

  final FlutterSecureStorage _storage;

  static const String _idTokenKey = 'shieldmate_id_token';

  Future<void> persistIdToken(String? token) async {
    if (token == null || token.isEmpty) {
      await _storage.delete(key: _idTokenKey);
      return;
    }
    await _storage.write(key: _idTokenKey, value: token);
  }

  Future<String?> readIdToken() => _storage.read(key: _idTokenKey);

  Future<void> clear() => _storage.delete(key: _idTokenKey);
}
