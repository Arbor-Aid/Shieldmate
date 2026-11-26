import 'package:flutter/material.dart';

class AppLoadingIndicator extends StatelessWidget {
  const AppLoadingIndicator({super.key, this.message});

  final String? message;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Center(child: CircularProgressIndicator()),
        if (message != null) ...[
          const SizedBox(height: 12),
          Text(message!, style: Theme.of(context).textTheme.bodyMedium),
        ],
      ],
    );
  }
}