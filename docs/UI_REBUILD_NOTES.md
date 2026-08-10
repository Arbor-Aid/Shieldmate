# ShieldMate Flutter UI Rebuild Notes

## New screen set
- Auth: LoginScreen, RegisterScreen, ForgotPasswordScreen
- Onboarding: IntakeStep1BasicInfo, IntakeStep2ServiceHistory, IntakeStep3NeedsAssessment, OnboardingCompleteScreen
- Dashboards: ClientDashboardScreen, PartnerDashboardScreen, AdminDashboardScreen
- Profile: ProfileScreen, EditProfileScreen
- Documents: DocumentsUploadScreen, OutreachPdfUploadScreen
- System: LoadingScreen, ErrorScreen, PermissionDeniedScreen

## Folder structure
- lib/core/theme: AppTheme and spacing constants
- lib/core/routing: AppRoutes, AppNavigation, AppRouter
- lib/core/widgets: AppShell, AppScaffold, PrimaryButton, AppCard, AppSectionHeader, AppLoadingIndicator, AppErrorView, AppStateView
- lib/core/utils: breakpoints and profile helpers
- lib/features/*: role-based screens under auth, onboarding, dashboard, profile, documents, errors

## Routing rules
- Unauthenticated: only auth routes; everything else redirects to LoginScreen.
- Authenticated without profile: routes forced into onboarding flow.
- Authenticated with profile: dashboard routed by role (client, partner/org, admin).
- Profile load failures: PermissionDeniedScreen for permission-denied, ErrorScreen otherwise.
- Unknown routes: ErrorScreen with the missing route name.

## Theme rules
- Light theme only, Material 3 enabled.
- Consistent padding via AppSpacing and AppScaffold/AppShell.
- Shared card, button, and input styles in AppTheme.

## Known TODOs
- flutter_gen_ui package is not available on pub.dev in this environment, so the UI uses FlutterGen asset widgets plus custom primitives. Provide a source for flutter_gen_ui if it is required.