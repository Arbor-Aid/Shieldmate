import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:flutter/material.dart';

class AdminDashboardScreen extends StatelessWidget {
  const AdminDashboardScreen({super.key, required this.role});

  final AppRole role;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    return AppShell(
      title: 'Admin Dashboard',
      destinations: destinations,
      selectedIndex: AppNavigation.indexForRoute(role, AppRoutes.adminDashboard),
      onDestinationSelected: (index) {
        final target = AppNavigation.routeForIndex(role, index);
        if (target != AppRoutes.adminDashboard) {
          Navigator.pushReplacementNamed(context, target);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          AppSectionHeader(
            title: 'System controls',
            subtitle: 'Track compliance, org health, and audit coverage.',
          ),
          AppCard(
            child: Text('Review RBAC changes, audit activity, and MCP health.'),
          ),
          SizedBox(height: 12),
          AppCard(
            child: Text('Monitor onboarding completion and partner engagement.'),
          ),
        ],
      ),
    );
  }
}