// lib/business_locator_screen.dart
import 'package:flutter/material.dart';

class BusinessLocatorScreen extends StatelessWidget {
  const BusinessLocatorScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Business Locator'),
      ),
      body: Center(
        child: Text(
          'Map to locate businesses or partners will go here.',
          style: Theme.of(context).textTheme.headlineSmall,
        ),
      ),
    );
  }
}
