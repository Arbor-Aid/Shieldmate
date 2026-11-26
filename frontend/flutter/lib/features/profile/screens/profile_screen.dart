import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.role, this.profile});

  final AppRole role;
  final UserProfile? profile;

  @override
  Widget build(BuildContext context) {
    final destinations = AppNavigation.itemsForRole(role);
    final user = FirebaseAuth.instance.currentUser;
    final displayName = profile?.displayName ?? user?.displayName ?? 'ShieldMate user';
    final email = profile?.email ?? user?.email ?? 'No email on file';

    return AppShell(
      title: 'Profile',
      destinations: destinations,
      selectedIndex: AppNavigation.indexForRoute(role, AppRoutes.profile),
      onDestinationSelected: (index) {
        final target = AppNavigation.routeForIndex(role, index);
        if (target != AppRoutes.profile) {
          Navigator.pushReplacementNamed(context, target);
        }
      },
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const AppSectionHeader(
            title: 'Your profile',
            subtitle: 'Keep your contact details current.',
          ),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Name: $displayName'),
                const SizedBox(height: 8),
                Text('Email: $email'),
                const SizedBox(height: 8),
                Text('Role: ${profile?.rawRole ?? role.name}'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          PrimaryButton(
            label: 'Edit profile',
            onPressed: () => Navigator.pushNamed(context, AppRoutes.editProfile),
          ),
        ],
      ),
    );
  }
}