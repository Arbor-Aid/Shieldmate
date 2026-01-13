import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class OutreachPdfUploadScreen extends StatelessWidget {
  const OutreachPdfUploadScreen({super.key, required this.role});

  final AppRole role;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    return AppShell(
      title: 'Outreach uploads',
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
            title: 'Organization materials',
            subtitle: 'Upload outreach PDFs for partner distribution.',
          ),
          const AppCard(
            child: Text('Only organization staff can upload outreach materials.'),
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'Upload outreach PDF',
            onPressed: () {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Outreach upload flow coming soon.')),
              );
            },
          ),
        ],
      ),
    );
  }
}