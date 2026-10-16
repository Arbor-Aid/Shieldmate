import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class DocumentsUploadScreen extends StatelessWidget {
  const DocumentsUploadScreen({super.key, required this.role});

  final AppRole role;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    final canAccessOutreach = role != AppRole.client;

    return AppShell(
      title: 'Documents',
      destinations: destinations,
      selectedIndex: AppNavigation.indexForRoute(role, AppRoutes.documentsUpload),
      onDestinationSelected: (index) {
        final target = AppNavigation.routeForIndex(role, index);
        if (target != AppRoutes.documentsUpload) {
          Navigator.pushReplacementNamed(context, target);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const AppSectionHeader(
            title: 'Upload documents',
            subtitle: 'Share files to keep your case up to date.',
          ),
          const AppCard(
            child: Text('Accepted formats: PDF, JPG, PNG. Keep files under 20MB.'),
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'Upload document',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Upload flow coming from storage service.')),
              );
            },
          ),
          if (canAccessOutreach) ...[
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pushNamed(context, AppRoutes.outreachUpload),
              child: const Text('Go to outreach uploads'),
            ),
          ],
        ],
      ),
    );
  }
}