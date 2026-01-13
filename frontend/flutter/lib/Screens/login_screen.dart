import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

import '../config/env.dart';
import '../services/auth_service.dart';
import '../widgets/header_bar.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final AuthService _authService = AuthService();

  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _loadingEmail = false;
  bool _loadingGoogle = false;
  bool _loadingApple = false;

  bool get _supportsAppleSignIn {
    if (!EnvConfig.appleEnabled) {
      return false;
    }
    if (kIsWeb) {
      return true;
    }
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

  Future<void> _login() async {
    if (_loadingEmail || _loadingGoogle || _loadingApple) {
      return;
    }

    setState(() => _loadingEmail = true);
    try {
      await _firebaseAuth.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );
      if (!mounted) {
        return;
      }
      final token = await _firebaseAuth.currentUser?.getIdToken();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Signed in. Token: ${token?.substring(0, 12) ?? 'n/a'}...')),
      );
    } on FirebaseAuthException catch (error) {
      _showError(error.message ?? 'Unable to sign in with email and password.');
    } catch (_) {
      _showError('Unable to sign in with email and password.');
    } finally {
      if (mounted) {
        setState(() => _loadingEmail = false);
      }
    }
  }

  Future<void> _signInWithGoogle() async {
    if (_loadingGoogle || _loadingEmail || _loadingApple) {
      return;
    }

    setState(() => _loadingGoogle = true);
    try {
      final result = await _authService.signInWithGoogle();
      if (!mounted || result == null) {
        return;
      }
      final token = result.idToken ?? await _firebaseAuth.currentUser?.getIdToken();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Welcome ${result.user?.displayName ?? 'Marine'}! Token: ${token?.substring(0, 12) ?? 'n/a'}...')),
      );
    } on Exception {
      _showError('Google sign-in failed. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _loadingGoogle = false);
      }
    }
  }

  Future<void> _signInWithApple() async {
    if (_loadingApple || _loadingGoogle || _loadingEmail) {
      return;
    }
    if (!_supportsAppleSignIn) {
      _showError('Apple sign-in is not available on this device.');
      return;
    }

    setState(() => _loadingApple = true);
    try {
      final result = await _authService.signInWithApple();
      if (!mounted || result == null) {
        return;
      }
      final token = result.idToken ?? await _firebaseAuth.currentUser?.getIdToken();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text(
                'Welcome ${result.user?.displayName ?? 'Marine'}! Token: ${token?.substring(0, 12) ?? 'n/a'}...')),
      );
    } on UnsupportedError catch (error) {
      _showError(error.message ?? 'Apple sign-in is not supported on this platform.');
    } catch (_) {
      _showError('Apple sign-in failed. Please try again.');
    } finally {
      if (mounted) {
        setState(() => _loadingApple = false);
      }
    }
  }

  Future<void> _signOut() async {
    try {
      await _authService.signOut();
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Signed out successfully.')),
      );
    } on Exception {
      _showError('Unable to sign out right now.');
    }
  }

  void _showError(String message) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: const HeaderBar(title: 'Login'),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              StreamBuilder<User?>(
                stream: _firebaseAuth.authStateChanges(),
                builder: (context, snapshot) {
                  final user = snapshot.data;
                  if (user == null) {
                    return const ListTile(
                      leading: Icon(Icons.lock_outline),
                      title: Text('You are not signed in'),
                      subtitle: Text('Use email/password or Google to continue.'),
                    );
                  }

                  return Card(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Signed in as ${user.email ?? user.displayName ?? user.uid}',
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Text('UID: ${user.uid}'),
                          const SizedBox(height: 8),
                          FutureBuilder<String?>(
                            future: user.getIdToken(),
                            builder: (context, snapshot) {
                              if (snapshot.connectionState == ConnectionState.waiting) {
                                return const Text('Fetching ID token...');
                              }
                              final token = snapshot.data;
                              if (token == null || token.isEmpty) {
                                return const Text('Unable to fetch ID token.');
                              }
                              return SelectableText('ID Token: $token');
                            },
                          ),
                          const SizedBox(height: 12),
                          Align(
                            alignment: Alignment.centerRight,
                            child: OutlinedButton.icon(
                              onPressed: _signOut,
                              icon: const Icon(Icons.logout),
                              label: const Text('Sign out'),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadingEmail ? null : _login,
                child: _loadingEmail
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Text('Login'),
              ),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: _loadingGoogle ? null : _signInWithGoogle,
                icon: _loadingGoogle
                    ? const SizedBox(
                        height: 16,
                        width: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.login),
                label: const Text('Sign in with Google'),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(48),
                ),
              ),
              if (_supportsAppleSignIn) ...[
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: _loadingApple ? null : _signInWithApple,
                  icon: _loadingApple
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Icon(Icons.apple),
                  label: const Text('Sign in with Apple'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size.fromHeight(48),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
