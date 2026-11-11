import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class IntakeStep3NeedsAssessment extends StatefulWidget {
  const IntakeStep3NeedsAssessment({super.key});

  @override
  State<IntakeStep3NeedsAssessment> createState() => _IntakeStep3NeedsAssessmentState();
}

class _IntakeStep3NeedsAssessmentState extends State<IntakeStep3NeedsAssessment> {
  final TextEditingController _needsController = TextEditingController();

  @override
  void dispose() {
    _needsController.dispose();
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
              title: 'Needs assessment',
              subtitle: 'Share the support you are looking for right now.',
            ),
            AppCard(
              child: TextField(
                controller: _needsController,
                maxLines: 6,
                decoration: const InputDecoration(
                  labelText: 'What support do you need most?',
                ),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Back'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: PrimaryButton(
                    label: 'Finish onboarding',
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.onboardingComplete),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}