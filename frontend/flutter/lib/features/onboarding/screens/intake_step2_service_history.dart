import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class IntakeStep2ServiceHistory extends StatefulWidget {
  const IntakeStep2ServiceHistory({super.key});

  @override
  State<IntakeStep2ServiceHistory> createState() => _IntakeStep2ServiceHistoryState();
}

class _IntakeStep2ServiceHistoryState extends State<IntakeStep2ServiceHistory> {
  final TextEditingController _yearsController = TextEditingController();
  final TextEditingController _rankController = TextEditingController();
  final TextEditingController _statusController = TextEditingController();

  @override
  void dispose() {
    _yearsController.dispose();
    _rankController.dispose();
    _statusController.dispose();
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
              title: 'Service history',
              subtitle: 'Capture your background and service milestones.',
            ),
            AppCard(
              child: Column(
                children: [
                  TextField(
                    controller: _yearsController,
                    decoration: const InputDecoration(labelText: 'Years of service'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _rankController,
                    decoration: const InputDecoration(labelText: 'Highest rank'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _statusController,
                    decoration: const InputDecoration(labelText: 'Discharge status'),
                  ),
                ],
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
                    label: 'Continue',
                    onPressed: () => Navigator.pushNamed(context, AppRoutes.onboardingStep3),
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