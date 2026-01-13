import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:sign_in_with_apple/sign_in_with_apple.dart';

import '../config/env.dart';
import 'session_manager.dart';

class AuthResult {
  const AuthResult({required this.user, required this.idToken});

  final User? user;
  final String? idToken;
}

class AuthService {
  static const List<String> _googleScopes = ['openid', 'email', 'profile'];
  static Future<void>? _googleInitialization;

  AuthService({
    FirebaseAuth? firebaseAuth,
    GoogleSignIn? googleSignIn,
    SessionManager? sessionManager,
  })  : _firebaseAuth = firebaseAuth ?? FirebaseAuth.instance,
        _googleSignIn = googleSignIn ?? (_platformSupportsGoogleSignIn ? GoogleSignIn.instance : null),
        _sessionManager = sessionManager ?? SessionManager();

  final FirebaseAuth _firebaseAuth;
  final GoogleSignIn? _googleSignIn;
  final SessionManager _sessionManager;

  Future<AuthResult?> signInWithGoogle() async {
    if (_supportsGoogleSignIn) {
      return _signInWithGoogleFlow();
    }
    return _signInAnonymously();
  }

  Future<AuthResult?> signInWithApple() async {
    if (!EnvConfig.appleEnabled) {
      throw UnsupportedError('Apple Sign-In disabled.');
    }

    if (kIsWeb || _supportsApplePlatforms) {
      try {
        final credential = await _requestAppleCredential();
        final userCredential = await _firebaseAuth.signInWithCredential(credential);
        final user = userCredential.user;
        final token = await user?.getIdToken();
        await _sessionManager.persistIdToken(token);
        return AuthResult(user: user, idToken: token);
      } catch (error) {
        rethrow;
      }
    }

    return _signInAnonymously();
  }

  Future<void> _ensureGoogleInitialized(GoogleSignIn googleSignIn) {
    if (!identical(googleSignIn, GoogleSignIn.instance)) {
      return Future.value();
    }
    final existing = _googleInitialization;
    if (existing != null) {
      return existing;
    }
    final future = googleSignIn.initialize();
    _googleInitialization = future;
    return future;
  }

  Future<AuthResult?> _signInWithGoogleFlow() async {
    final googleSignIn = _googleSignIn;
    if (googleSignIn == null) {
      throw UnsupportedError('Google Sign-In is not available on this platform.');
    }

    try {
      await _ensureGoogleInitialized(googleSignIn);
      final account = await googleSignIn.authenticate(scopeHint: _googleScopes);
            final authentication = account.authentication;
      final idToken = authentication.idToken;
      if (idToken == null || idToken.isEmpty) {
        throw StateError('Google Sign-In did not return a valid ID token.');
      }

      String? accessToken;
      try {
        final authorizationClient = account.authorizationClient;
        final cached = await authorizationClient.authorizationForScopes(_googleScopes);
        if (cached != null) {
          accessToken = cached.accessToken;
        } else {
          accessToken = (await authorizationClient.authorizeScopes(_googleScopes)).accessToken;
        }
      } on GoogleSignInException {
        // Best-effort: continue without an access token if authorization fails.
      }

      final credential = GoogleAuthProvider.credential(
        accessToken: accessToken,
        idToken: idToken,
      );

      final userCredential = await _firebaseAuth.signInWithCredential(credential);
      final user = userCredential.user;
      final token = await user?.getIdToken();
      await _sessionManager.persistIdToken(token);

      return AuthResult(user: user, idToken: token);
    } on GoogleSignInException catch (error) {
      if (error.code == GoogleSignInExceptionCode.canceled) {
        return null;
      }
      rethrow;
    }
  }

  Future<AuthResult?> _signInAnonymously() async {
    if (!EnvConfig.allowFakeLogin) {
      throw UnsupportedError('This authentication method is not supported on this platform.');
    }
    final credential = await _firebaseAuth.signInAnonymously();
    final user = credential.user;
    final token = await user?.getIdToken();
    await _sessionManager.persistIdToken(token);
    return AuthResult(user: user, idToken: token);
  }

  bool get _supportsGoogleSignIn => _platformSupportsGoogleSignIn;

  static bool get _platformSupportsGoogleSignIn {
    if (kIsWeb) {
      return true;
    }

    switch (defaultTargetPlatform) {
      case TargetPlatform.android:
      case TargetPlatform.iOS:
        return true;
      case TargetPlatform.fuchsia:
      case TargetPlatform.linux:
      case TargetPlatform.macOS:
      case TargetPlatform.windows:
        return false;
    }
  }

  bool get _supportsApplePlatforms {
    switch (defaultTargetPlatform) {
      case TargetPlatform.iOS:
      case TargetPlatform.macOS:
        return true;
      case TargetPlatform.android:
      case TargetPlatform.fuchsia:
      case TargetPlatform.linux:
      case TargetPlatform.windows:
        return false;
    }
  }

  Future<AuthCredential> _requestAppleCredential() async {
    final scopes = [
      AppleIDAuthorizationScopes.email,
      AppleIDAuthorizationScopes.fullName,
    ];

    AuthorizationCredentialAppleID credential;
    if (kIsWeb) {
      final clientId = EnvConfig.appleServiceId ?? EnvConfig.appleClientId;
      final redirectUri = EnvConfig.appleRedirectUri;
      if (clientId == null || clientId.isEmpty || redirectUri == null || redirectUri.isEmpty) {
        throw StateError(
            'APPLE_SERVICE_ID and APPLE_REDIRECT_URI must be configured for web sign-in.');
      }
      credential = await SignInWithApple.getAppleIDCredential(
        scopes: scopes,
        webAuthenticationOptions: WebAuthenticationOptions(
          clientId: clientId,
          redirectUri: Uri.parse(redirectUri),
        ),
      );
    } else {
      credential = await SignInWithApple.getAppleIDCredential(scopes: scopes);
    }

    final String? idToken = credential.identityToken;
    final String authCode = credential.authorizationCode;
    if (idToken == null || idToken.isEmpty || authCode.isEmpty) {
      throw StateError('Apple Sign-In returned an invalid credential.');
    }

    final oauthProvider = OAuthProvider('apple.com');
    return oauthProvider.credential(
      idToken: idToken,
      accessToken: authCode,
    );
  }

  Future<void> signOut() async {
    await _firebaseAuth.signOut();
    await _sessionManager.clear();
    final googleSignIn = _googleSignIn;
    if (googleSignIn != null) {
      await googleSignIn.signOut();
      try {
        await googleSignIn.disconnect();
      } on Exception {
        // Ignore disconnect errors; user may have already revoked the session.
      }
    }
  }
}
