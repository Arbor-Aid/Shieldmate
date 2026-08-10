import 'package:flutter/material.dart';

import '../utils/user_profile.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/register_screen.dart';
import '../../features/dashboard/screens/admin_dashboard_screen.dart';
import '../../features/dashboard/screens/client_dashboard_screen.dart';
import '../../features/dashboard/screens/partner_dashboard_screen.dart';
import '../../features/documents/screens/documents_upload_screen.dart';
import '../../features/documents/screens/outreach_pdf_upload_screen.dart';
import '../../features/errors/screens/error_screen.dart';
import '../../features/errors/screens/loading_screen.dart';
import '../../features/errors/screens/permission_denied_screen.dart';
import '../../features/onboarding/screens/intake_step1_basic_info.dart';
import '../../features/onboarding/screens/intake_step2_service_history.dart';
import '../../features/onboarding/screens/intake_step3_needs_assessment.dart';
import '../../features/onboarding/screens/onboarding_complete_screen.dart';
import '../../features/profile/screens/edit_profile_screen.dart';
import '../../features/profile/screens/profile_screen.dart';
import 'app_navigation.dart';

class AppSessionError {
  const AppSessionError({
    required this.message,
    this.permissionDenied = false,
  });

  final String message;
  final bool permissionDenied;
}

class AppSession {
  const AppSession._({
    required this.isAuthenticated,
    required this.hasProfile,
    required this.role,
    required this.isLoading,
    this.profile,
    this.error,
  });

  final bool isAuthenticated;
  final bool hasProfile;
  final AppRole role;
  final bool isLoading;
  final UserProfile? profile;
  final AppSessionError? error;

  factory AppSession.loading() {
    return const AppSession._(
      isAuthenticated: false,
      hasProfile: false,
      role: AppRole.client,
      isLoading: true,
    );
  }

  factory AppSession.unauthenticated() {
    return const AppSession._(
      isAuthenticated: false,
      hasProfile: false,
      role: AppRole.client,
      isLoading: false,
    );
  }

  factory AppSession.authenticated({
    required AppRole role,
    required bool hasProfile,
    UserProfile? profile,
  }) {
    return AppSession._(
      isAuthenticated: true,
      hasProfile: hasProfile,
      role: role,
      isLoading: false,
      profile: profile,
    );
  }

  factory AppSession.error({required String message, bool permissionDenied = false}) {
    return AppSession._(
      isAuthenticated: false,
      hasProfile: false,
      role: AppRole.client,
      isLoading: false,
      error: AppSessionError(message: message, permissionDenied: permissionDenied),
    );
  }
}

class AppRouter {
  const AppRouter({required this.session});

  final AppSession session;

  Route<dynamic> onGenerateRoute(RouteSettings settings) {
    final name = settings.name ?? AppRoutes.root;

    if (session.isLoading) {
      return _page(const LoadingScreen());
    }

    final error = session.error;
    if (error != null) {
      if (error.permissionDenied) {
        return _page(const PermissionDeniedScreen());
      }
      return _page(ErrorScreen(message: error.message));
    }

    if (!session.isAuthenticated) {
      return _routeForUnauthenticated(name);
    }

    if (!session.hasProfile) {
      return _routeForOnboarding(name);
    }

    return _routeForAuthenticated(name);
  }

  Route<dynamic> _routeForUnauthenticated(String name) {
    switch (name) {
      case AppRoutes.register:
        return _page(const RegisterScreen());
      case AppRoutes.forgotPassword:
        return _page(const ForgotPasswordScreen());
      case AppRoutes.login:
      case AppRoutes.root:
      default:
        return _page(const LoginScreen());
    }
  }

  Route<dynamic> _routeForOnboarding(String name) {
    switch (name) {
      case AppRoutes.onboardingStep2:
        return _page(const IntakeStep2ServiceHistory());
      case AppRoutes.onboardingStep3:
        return _page(const IntakeStep3NeedsAssessment());
      case AppRoutes.onboardingComplete:
        return _page(const OnboardingCompleteScreen());
      case AppRoutes.onboardingStep1:
      default:
        return _page(const IntakeStep1BasicInfo());
    }
  }

  Route<dynamic> _routeForAuthenticated(String name) {
    switch (name) {
      case AppRoutes.root:
        return _page(_dashboardForRole(session.role));
      case AppRoutes.clientDashboard:
        return _guardRole(
          allowed: const {AppRole.client},
          child: ClientDashboardScreen(role: session.role),
        );
      case AppRoutes.partnerDashboard:
        return _guardRole(
          allowed: const {AppRole.partner},
          child: PartnerDashboardScreen(role: session.role),
        );
      case AppRoutes.adminDashboard:
        return _guardRole(
          allowed: const {AppRole.admin},
          child: AdminDashboardScreen(role: session.role),
        );
      case AppRoutes.documentsUpload:
        return _page(DocumentsUploadScreen(role: session.role));
      case AppRoutes.outreachUpload:
        return _guardRole(
          allowed: const {AppRole.partner, AppRole.admin},
          child: OutreachPdfUploadScreen(role: session.role),
        );
      case AppRoutes.profile:
        return _page(ProfileScreen(role: session.role, profile: session.profile));
      case AppRoutes.editProfile:
        return _page(EditProfileScreen(profile: session.profile));
      default:
        return _page(ErrorScreen(message: 'Unknown route: $name'));
    }
  }

  Widget _dashboardForRole(AppRole role) {
    switch (role) {
      case AppRole.admin:
        return AdminDashboardScreen(role: role);
      case AppRole.partner:
        return PartnerDashboardScreen(role: role);
      case AppRole.client:
        return ClientDashboardScreen(role: role);
    }
  }

  Route<dynamic> _guardRole({required Set<AppRole> allowed, required Widget child}) {
    if (!allowed.contains(session.role)) {
      return _page(const PermissionDeniedScreen());
    }
    return _page(child);
  }

  Route<dynamic> _page(Widget child) {
    return MaterialPageRoute(builder: (_) => child);
  }
}
