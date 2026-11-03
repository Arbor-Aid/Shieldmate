import 'package:flutter/material.dart';

import 'app_error_view.dart';
import 'app_loading_indicator.dart';

class AppStateView extends StatelessWidget {
  const AppStateView({
    super.key,
    required this.child,
    this.isLoading = false,
    this.errorMessage,
    this.onRetry,
  });

  final Widget child;
  final bool isLoading;
  final String? errorMessage;
  final VoidCallback? onRetry;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        if (isLoading) const AppLoadingIndicator(),
        if (errorMessage != null) ...[
          AppErrorView(message: errorMessage!, onRetry: onRetry),
          const SizedBox(height: 16),
        ],
        if (!isLoading) child,
      ],
    );
  }
}