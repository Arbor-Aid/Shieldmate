import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: '2Marines Shieldmate',
      home: Scaffold(
        appBar: AppBar(title: const Text('Shieldmate Test Build')),
        body: const Center(
          child: Text(
            'Hello Shieldmate',
            style: TextStyle(fontSize: 24),
          ),
        ),
      ),
    );
  }
}
