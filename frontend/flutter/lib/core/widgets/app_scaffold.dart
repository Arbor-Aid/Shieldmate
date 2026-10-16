import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AppScaffold extends StatelessWidget {
  const AppScaffold({
    super.key,
    required this.child,
    this.title,
    this.actions,
    this.isScrollable = true,
  });

  final Widget child;
  final String? title;
  final List<Widget>? actions;
  final bool isScrollable;

  @override
  Widget build(BuildContext context) {
    final content = Padding(
      padding: AppSpacing.pagePadding,
      child: isScrollable ? SingleChildScrollView(child: child) : child,
    );

    return Scaffold(
      appBar: title != null
          ? AppBar(
              title: Text(title!),
              actions: actions,
            )
          : null,
      body: SafeArea(child: content),
    );
  }
}