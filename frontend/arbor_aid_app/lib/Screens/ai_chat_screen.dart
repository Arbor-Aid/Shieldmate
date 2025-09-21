// lib/ai_chat_screen.dart
import 'package:flutter/material.dart';

class AIChatScreen extends StatelessWidget {
  const AIChatScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('AI Chat'),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: 10, // Placeholder: Replace with actual chat messages
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(
                      'Message $index'), // Placeholder: Replace with actual chat data
                );
              },
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Row(
              children: [
                const Expanded(
                  child: TextField(
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send),
                  onPressed: () {
                    // Logic to send message (add Firebase or AI integration here)
                  },
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
