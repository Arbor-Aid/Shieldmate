import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:arbor_aid_app/gen/assets.gen.dart';
import 'package:arbor_aid_app/services/auth_service.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  AuthService? _authService;
  bool _isLoading = false;
  String? _errorMessage;

  AuthService get _authServiceInstance {
    return _authService ??= AuthService();
  }

  Future<void> _handleGoogleSignIn() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await _authServiceInstance.signInWithGoogle();
    } catch (error) {
      final message = _messageForError(error);
      setState(() {
        _errorMessage = message;
      });
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _messageForError(Object error) {
    if (error is FirebaseAuthException) {
      return error.message ?? 'Sign-in failed. Please try again.';
    }
    return 'Sign-in failed. Please try again.';
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'ShieldMate',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Assets.images.shieldmateLogo.image(
              width: 72,
              height: 72,
              fit: BoxFit.contain,
            ),
          ),
          const SizedBox(height: 16),
          const AppSectionHeader(
            title: 'Welcome back',
            subtitle: 'Sign in to continue your support journey.',
          ),
          AppCard(
            child: AppStateView(
              isLoading: _isLoading,
              errorMessage: _errorMessage,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  PrimaryButton(
                    label: 'Continue with Google',
                    icon: Icons.login,
                    onPressed: _handleGoogleSignIn,
                  ),
                  const SizedBox(height: 12),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
                    child: const Text('Create an account'),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.forgotPassword),
                    child: const Text('Forgot password?'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
