// lib/messages_screen.dart
import 'package:flutter/material.dart';

class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
      ),
      body: ListView.builder(
        itemCount: 10, // Placeholder: Replace with actual messages count
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(
                'Message $index'), // Placeholder: Replace with actual message data
            subtitle: const Text('This is a sample message.'),
          );
        },
      ),
    );
  }
}
