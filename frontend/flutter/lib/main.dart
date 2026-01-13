import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'core/routing/app_navigation.dart';
import 'core/routing/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/utils/user_profile.dart';
import 'core/utils/user_profile_service.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ShieldmateApp());
}

Future<void> _initializeApp() async {
  try {
    await dotenv.load();
  } catch (_) {
    // Ignore missing .env assets in production builds.
  }
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
}

class ShieldmateApp extends StatelessWidget {
  const ShieldmateApp({super.key});

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<void>(
      future: _initializeApp(),
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
              return _buildApp(AppSession.loading());
            }

            final user = authSnapshot.data;
            if (user == null) {
              return _buildApp(AppSession.unauthenticated());
            }

            return FutureBuilder<_SessionData>(
              future: _loadSession(user),
              builder: (context, sessionSnapshot) {
                if (sessionSnapshot.connectionState == ConnectionState.waiting) {
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
      debugShowCheckedModeBanner: false,
      title: 'ShieldMate',
      theme: AppTheme.light(),
      onGenerateRoute: AppRouter(session: session).onGenerateRoute,
      initialRoute: AppRoutes.root,
    );
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
