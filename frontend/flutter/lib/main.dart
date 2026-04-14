import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_app_check/firebase_app_check.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart' show kDebugMode, kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/routing/app_navigation.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/user_profile.dart';
import 'core/utils/user_profile_service.dart';
import 'firebase_options.dart';

const String _webAppCheckSiteKey = String.fromEnvironment(
  'FIREBASE_APPCHECK_SITE_KEY',
  defaultValue: String.fromEnvironment('VITE_FIREBASE_APPCHECK_KEY'),
);

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ShieldmateApp());
}

Future<void> _initializeApp() async {
  if (!kIsWeb) {
    try {
      await dotenv.load(isOptional: true);
    } catch (_) {
      // Ignore missing .env assets in production builds.
    }
  }
  await Firebase
      .initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      )
      .timeout(const Duration(seconds: 12));
  await _initializeAppCheck();
}

Future<void> _initializeAppCheck() async {
  if (kIsWeb) {
    if (_webAppCheckSiteKey.isEmpty) {
      throw StateError(
        'Missing FIREBASE_APPCHECK_SITE_KEY for web App Check.',
      );
    }
    await FirebaseAppCheck.instance.activate(
      providerWeb: ReCaptchaV3Provider(_webAppCheckSiteKey),
      providerAndroid: kDebugMode
          ? const AndroidDebugProvider()
          : const AndroidPlayIntegrityProvider(),
      providerApple: kDebugMode
          ? const AppleDebugProvider()
          : const AppleDeviceCheckProvider(),
    );
    return;
  }

  await FirebaseAppCheck.instance.activate(
    providerAndroid: kDebugMode
        ? const AndroidDebugProvider()
        : const AndroidPlayIntegrityProvider(),
    providerApple: kDebugMode
        ? const AppleDebugProvider()
        : const AppleDeviceCheckProvider(),
  );
}

class ShieldmateApp extends StatefulWidget {
  const ShieldmateApp({super.key});

  @override
  State<ShieldmateApp> createState() => _ShieldmateAppState();
}

class _ShieldmateAppState extends State<ShieldmateApp> {
  late final Future<void> _initializationFuture;
  String? _sessionUid;
  Future<_SessionData>? _sessionFuture;

  @override
  void initState() {
    super.initState();
    _initializationFuture = _initializeApp();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initializationFuture,
      builder: (context, initSnapshot) {
        if (initSnapshot.connectionState != ConnectionState.done) {
          return _buildApp(AppSession.loading());
        }
        if (initSnapshot.hasError) {
          return _buildApp(
            AppSession.error(message: 'Initialization failed.'),
          );
        }

        return StreamBuilder<User?>(
          stream: FirebaseAuth.instance.authStateChanges(),
          builder: (context, authSnapshot) {
            if (authSnapshot.connectionState == ConnectionState.waiting) {
              final cachedUser = FirebaseAuth.instance.currentUser;
              if (cachedUser == null) {
                return _buildApp(AppSession.unauthenticated());
              }
              return FutureBuilder<_SessionData>(
                future: _sessionFor(cachedUser),
                builder: (context, sessionSnapshot) {
                  if (sessionSnapshot.connectionState == ConnectionState.waiting) {
                    return _buildApp(AppSession.loading());
                  }
                  if (sessionSnapshot.hasError) {
                    return _buildApp(
                      AppSession.error(message: 'Unable to load your profile.'),
                    );
                  }
                  final data = sessionSnapshot.data;
                  if (data == null) {
                    return _buildApp(
                      AppSession.error(message: 'Unable to load session data.'),
                    );
                  }
                  return _buildApp(
                    AppSession.authenticated(
                      role: data.role,
                      hasProfile: data.profile != null,
                      profile: data.profile,
                    ),
                  );
                },
              );
            }

            final user = authSnapshot.data;
            if (user == null) {
              _sessionUid = null;
              _sessionFuture = null;
              return _buildApp(AppSession.unauthenticated());
            }

            return FutureBuilder<_SessionData>(
              future: _sessionFor(user),
              builder: (context, sessionSnapshot) {
                if (sessionSnapshot.connectionState ==
                    ConnectionState.waiting) {
                  return _buildApp(AppSession.loading());
                }

                if (sessionSnapshot.hasError) {
                  final error = sessionSnapshot.error;
                  final isDenied = error is FirebaseException &&
                      error.code == 'permission-denied';
                  return _buildApp(
                    AppSession.error(
                      message: isDenied
                          ? 'Profile access denied.'
                          : 'Unable to load your profile.',
                      permissionDenied: isDenied,
                    ),
                  );
                }

                final data = sessionSnapshot.data;
                if (data == null) {
                  return _buildApp(
                    AppSession.error(message: 'Unable to load session data.'),
                  );
                }

                return _buildApp(
                  AppSession.authenticated(
                    role: data.role,
                    hasProfile: data.profile != null,
                    profile: data.profile,
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  MaterialApp _buildApp(AppSession session) {
    return MaterialApp(
      key: ValueKey(_sessionAppKey(session)),
      debugShowCheckedModeBanner: false,
      title: 'ShieldMate',
      theme: AppTheme.light(),
      onGenerateRoute: AppRouter(session: session).onGenerateRoute,
      initialRoute: AppRoutes.root,
    );
  }

  Future<_SessionData> _sessionFor(User user) {
    if (_sessionUid == user.uid && _sessionFuture != null) {
      return _sessionFuture!;
    }

    _sessionUid = user.uid;
    _sessionFuture = _loadSession(user).timeout(
      const Duration(seconds: 12),
      onTimeout: () => const _SessionData(role: AppRole.client, profile: null),
    );
    return _sessionFuture!;
  }

  String _sessionAppKey(AppSession session) {
    if (session.isLoading) return 'loading';
    if (session.error != null) return 'error:${session.error!.permissionDenied}';
    if (!session.isAuthenticated) return 'unauthenticated';
    return 'authenticated:${session.role.name}:${session.hasProfile}:${_sessionUid ?? 'unknown'}';
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const ShieldmateApp();
  }
}

class _SessionData {
  const _SessionData({required this.role, required this.profile});

  final AppRole role;
  final UserProfile? profile;
}

Future<_SessionData> _loadSession(User user) async {
  final profileService = UserProfileService();
  final profile = await profileService.fetchProfile(user.uid);
  final role = await profileService.resolveRole(user, profile: profile);
  return _SessionData(role: role, profile: profile);
}
