import 'package:arbor_aid_app/core/widgets/app_error_view.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:flutter/material.dart';

class ErrorScreen extends StatelessWidget {
  const ErrorScreen({
    super.key,
    this.title = 'Something went wrong',
    this.message = 'We hit an unexpected error. Please try again.',
  });

  final String title;
  final String message;

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Error',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppSectionHeader(
            title: title,
            subtitle: 'If the issue persists, contact support.',
          ),
          AppErrorView(message: message),
        ],
      ),
    );
  }
}