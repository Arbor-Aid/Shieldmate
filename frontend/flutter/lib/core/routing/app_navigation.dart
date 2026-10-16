import 'package:flutter/material.dart';

import '../utils/user_profile.dart';

class AppRoutes {
  static const String root = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';

  static const String onboardingStep1 = '/onboarding/step-1';
  static const String onboardingStep2 = '/onboarding/step-2';
  static const String onboardingStep3 = '/onboarding/step-3';
  static const String onboardingComplete = '/onboarding/complete';

  static const String clientDashboard = '/app/client';
  static const String partnerDashboard = '/app/partner';
  static const String adminDashboard = '/app/admin';

  static const String documentsUpload = '/app/documents';
  static const String outreachUpload = '/app/documents/outreach';
  static const String profile = '/app/profile';
  static const String editProfile = '/app/profile/edit';

  static const String error = '/error';
  static const String permissionDenied = '/permission-denied';

  static const Set<String> authRoutes = {
    login,
    register,
    forgotPassword,
  };

  static const Set<String> onboardingRoutes = {
    onboardingStep1,
    onboardingStep2,
    onboardingStep3,
    onboardingComplete,
  };
}

class AppNavItem {
  const AppNavItem({
    required this.label,
    required this.icon,
    required this.route,
  });

  final String label;
  final IconData icon;
  final String route;
}

class AppNavigation {
  static List<AppNavItem> itemsForRole(AppRole role) {
    switch (role) {
      case AppRole.admin:
        return const [
          AppNavItem(
            label: 'Dashboard',
            icon: Icons.admin_panel_settings_outlined,
            route: AppRoutes.adminDashboard,
          ),
          AppNavItem(
            label: 'Documents',
            icon: Icons.folder_open_outlined,
            route: AppRoutes.documentsUpload,
          ),
          AppNavItem(
            label: 'Profile',
            icon: Icons.person_outline,
            route: AppRoutes.profile,
          ),
        ];
      case AppRole.partner:
        return const [
          AppNavItem(
            label: 'Dashboard',
            icon: Icons.business_outlined,
            route: AppRoutes.partnerDashboard,
          ),
          AppNavItem(
            label: 'Documents',
            icon: Icons.folder_open_outlined,
            route: AppRoutes.documentsUpload,
          ),
          AppNavItem(
            label: 'Profile',
            icon: Icons.person_outline,
            route: AppRoutes.profile,
          ),
        ];
      case AppRole.client:
        return const [
          AppNavItem(
            label: 'Dashboard',
            icon: Icons.home_outlined,
            route: AppRoutes.clientDashboard,
          ),
          AppNavItem(
            label: 'Documents',
            icon: Icons.folder_open_outlined,
            route: AppRoutes.documentsUpload,
          ),
          AppNavItem(
            label: 'Profile',
            icon: Icons.person_outline,
            route: AppRoutes.profile,
          ),
        ];
    }
  }

  static int indexForRoute(AppRole role, String route) {
    final items = itemsForRole(role);
    final index = items.indexWhere((item) => item.route == route);
    return index >= 0 ? index : 0;
  }

  static String routeForIndex(AppRole role, int index) {
    final items = itemsForRole(role);
    if (index < 0 || index >= items.length) {
      return items.first.route;
    }
    return items[index].route;
  }
}
