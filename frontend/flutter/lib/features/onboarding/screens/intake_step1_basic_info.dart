import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class IntakeStep1BasicInfo extends StatefulWidget {
  const IntakeStep1BasicInfo({super.key});

  @override
  State<IntakeStep1BasicInfo> createState() => _IntakeStep1BasicInfoState();
}

class _IntakeStep1BasicInfoState extends State<IntakeStep1BasicInfo> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _serviceController = TextEditingController();
  final TextEditingController _locationController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _serviceController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Onboarding',
      child: AppStateView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AppSectionHeader(
              title: 'Basic information',
              subtitle: 'Tell us who you are to personalize your experience.',
            ),
            AppCard(
              child: Column(
                children: [
                  TextField(
                    controller: _nameController,
                    decoration: const InputDecoration(labelText: 'Full name'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _serviceController,
                    decoration: const InputDecoration(labelText: 'Branch of service'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _locationController,
                    decoration: const InputDecoration(labelText: 'Current location'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Continue',
              onPressed: () => Navigator.pushNamed(context, AppRoutes.onboardingStep2),
            ),
          ],
        ),
      ),
    );
  }
}