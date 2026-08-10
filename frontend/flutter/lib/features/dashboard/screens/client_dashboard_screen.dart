import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:flutter/material.dart';

class ClientDashboardScreen extends StatelessWidget {
  const ClientDashboardScreen({super.key, required this.role});

  final AppRole role;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    return AppShell(
      title: 'Client Dashboard',
      destinations: destinations,
      selectedIndex: AppNavigation.indexForRoute(role, AppRoutes.clientDashboard),
      onDestinationSelected: (index) {
        final target = AppNavigation.routeForIndex(role, index);
        if (target != AppRoutes.clientDashboard) {
          Navigator.pushReplacementNamed(context, target);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: const [
          AppSectionHeader(
            title: 'Your next steps',
            subtitle: 'Track your onboarding tasks and support requests.',
          ),
          AppCard(
            child: Text('Complete your profile and upload required documents.'),
          ),
          SizedBox(height: 12),
          AppCard(
            child: Text('Check your latest referrals and messages.'),
          ),
        ],
      ),
    );
  }
}