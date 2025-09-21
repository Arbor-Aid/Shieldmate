// lib/login_register_screen.dart
import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:your_project/firebase_service.dart';
import 'admin_dashboard.dart'; // Navigate to admin dashboard on successful login

class LoginRegisterScreen extends StatefulWidget {
  const LoginRegisterScreen({super.key});

  @override
  _LoginRegisterScreenState createState() => _LoginRegisterScreenState();
}

class _LoginRegisterScreenState extends State<LoginRegisterScreen> {
  final FirebaseService _firebaseService = FirebaseService();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool isLogin = true; // Track whether it's login or register mode

  void _toggleLoginRegister() {
    setState(() {
      isLogin = !isLogin;
    });
  }

  void _submit() async {
    String email = _emailController.text;
    String password = _passwordController.text;

    if (isLogin) {
      // Sign in user
      User? user =
          await _firebaseService.signInWithEmailPassword(email, password);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
            builder: (context) =>
                const AdminDashboard()), // Navigate on success
      );
    } else {
      // Register user
      User? user =
          await _firebaseService.signUpWithEmailPassword(email, password);
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
            builder: (context) =>
                const AdminDashboard()), // Navigate on success
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(isLogin ? 'Login' : 'Register')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _emailController,
              decoration: const InputDecoration(labelText: 'Email'),
            ),
            TextField(
              controller: _passwordController,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submit,
              child: Text(isLogin ? 'Login' : 'Register'),
            ),
            TextButton(
              onPressed: _toggleLoginRegister,
              child: Text(isLogin
                  ? 'Don\'t have an account? Register'
                  : 'Already have an account? Login'),
            ),
          ],
        ),
      ),
    );
  }
}
