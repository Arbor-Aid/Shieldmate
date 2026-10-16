import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:flutter/material.dart';

class PartnerDashboardScreen extends StatelessWidget {
  const PartnerDashboardScreen({super.key, required this.role});

  final AppRole role;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    return AppShell(
      title: 'Partner Dashboard',
      destinations: destinations,
      selectedIndex: AppNavigation.indexForRoute(role, AppRoutes.partnerDashboard),
      onDestinationSelected: (index) {
        final target = AppNavigation.routeForIndex(role, index);
        if (target != AppRoutes.partnerDashboard) {
          Navigator.pushReplacementNamed(context, target);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          AppSectionHeader(
            title: 'Organization overview',
            subtitle: 'Monitor client intake, outreach, and analytics.',
          ),
          AppCard(
            child: Text('Review incoming client requests and assignments.'),
          ),
          SizedBox(height: 12),
          AppCard(
            child: Text('Upload outreach materials and partner documentation.'),
          ),
        ],
      ),
    );
  }
}