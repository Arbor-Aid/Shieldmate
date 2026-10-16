import 'package:arbor_aid_app/core/widgets/app_error_view.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:flutter/material.dart';

class PermissionDeniedScreen extends StatelessWidget {
  const PermissionDeniedScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'Access denied',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppSectionHeader(
            title: 'Permission denied',
            subtitle: 'Your account does not have access to this screen.',
          ),
          AppErrorView(message: 'Contact your org admin if you need access.'),
        ],
      ),
    );
  }
}