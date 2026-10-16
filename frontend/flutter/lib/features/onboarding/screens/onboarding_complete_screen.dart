import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/utils/user_profile_service.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class OnboardingCompleteScreen extends StatefulWidget {
  const OnboardingCompleteScreen({super.key});

  @override
  State<OnboardingCompleteScreen> createState() => _OnboardingCompleteScreenState();
}

class _OnboardingCompleteScreenState extends State<OnboardingCompleteScreen> {
  final UserProfileService _profileService = UserProfileService();
  bool _isLoading = false;
  String? _errorMessage;

  Future<void> _finishOnboarding() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await _profileService.ensureProfile();
      if (mounted) {
        Navigator.pushNamedAndRemoveUntil(context, AppRoutes.root, (route) => false);
      }
    } catch (error) {
      setState(() => _errorMessage = 'Unable to complete onboarding.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Onboarding complete',
      child: AppStateView(
        isLoading: _isLoading,
        errorMessage: _errorMessage,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AppSectionHeader(
              title: 'You are all set',
              subtitle: 'ShieldMate is ready with your personalized dashboard.',
            ),
            const AppCard(
              child: Text(
                'You can now access your role-based dashboard, documents, and support workflows.',
              ),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Go to dashboard',
              onPressed: _finishOnboarding,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }
}