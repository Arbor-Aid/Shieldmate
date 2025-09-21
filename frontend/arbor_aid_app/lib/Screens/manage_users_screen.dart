// lib/manage_users_screen.dart
import 'package:flutter/material.dart';

class ManageUsersScreen extends StatelessWidget {
  const ManageUsersScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Users'),
      ),
      body: ListView.builder(
        itemCount: 10, // Placeholder: Replace with actual user count
        itemBuilder: (context, index) {
          return ListTile(
            title: Text(
                'User $index'), // Placeholder: Replace with actual user data
            trailing: IconButton(
              icon: const Icon(Icons.delete),
              onPressed: () {
                // Delete user logic (Firebase will go here)
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Deleted User $index')),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
