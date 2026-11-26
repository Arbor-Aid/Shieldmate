import 'package:flutter/material.dart';

import 'primary_button.dart';

class AppErrorView extends StatelessWidget {
  const AppErrorView({
    super.key,
    required this.message,
    this.onRetry,
  });

  final String message;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          message,
          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.red.shade700,
                fontWeight: FontWeight.w600,
              ),
        ),
        if (onRetry != null) ...[
          const SizedBox(height: 12),
          PrimaryButton(label: 'Retry', onPressed: onRetry),
        ],
      ],
    );
  }
}