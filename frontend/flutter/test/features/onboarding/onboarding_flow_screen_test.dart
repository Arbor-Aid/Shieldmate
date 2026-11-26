import 'package:arbor_aid_app/core/theme/app_theme.dart';
import 'package:arbor_aid_app/features/onboarding/models/onboarding_submission.dart';
import 'package:arbor_aid_app/features/onboarding/screens/onboarding_flow_screen.dart';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

class _FakePersistence implements OnboardingPersistence {
  OnboardingSubmission? submission;

  @override
  Future<void> complete(OnboardingSubmission submission) async {
    this.submission = submission;
  }
}

void main() {
  Future<void> tapText(WidgetTester tester, String text) async {
    final finder = find.text(text);
    await tester.ensureVisible(finder.last);
    await tester.tap(finder.last);
    await tester.pumpAndSettle();
  }

  testWidgets('validates controlled choices before advancing', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        home: OnboardingFlowScreen(persistence: _FakePersistence()),
      ),
    );
    await tester.pumpAndSettle();

    await tapText(tester, 'Continue');

    expect(
      find.text('Choose your branch and length of service.'),
      findsNWidgets(2),
    );
    expect(find.text('Your service'), findsOneWidget);
  });

  testWidgets('preserves A2UI data through Back and completes once', (
    tester,
  ) async {
    final persistence = _FakePersistence();
    var refreshes = 0;
    await tester.binding.setSurfaceSize(const Size(1000, 900));
    addTearDown(() => tester.binding.setSurfaceSize(null));

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        darkTheme: AppTheme.dark(),
        home: OnboardingFlowScreen(
          persistence: persistence,
          onCompleted: () async => refreshes++,
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tapText(tester, 'Army');
    await tapText(tester, '5–9 years');
    await tapText(tester, 'Continue');

    expect(find.text('Your service history'), findsOneWidget);
    await tapText(tester, 'E-5–E-6');
    await tapText(tester, 'Honorable');
    await tapText(tester, 'Back');

    final armyChip = tester.widget<ChoiceChip>(
      find.ancestor(
        of: find.text('Army'),
        matching: find.byType(ChoiceChip),
      ),
    );
    expect(armyChip.selected, isTrue);

    await tapText(tester, 'Continue');
    final rankChip = tester.widget<ChoiceChip>(
      find.ancestor(
        of: find.text('E-5–E-6'),
        matching: find.byType(ChoiceChip),
      ),
    );
    expect(rankChip.selected, isTrue);

    await tapText(tester, 'Continue');
    await tapText(tester, 'VA benefits');
    await tapText(tester, 'Housing');
    await tapText(tester, 'Review');

    expect(find.textContaining('Focus areas: VA benefits, Housing'),
        findsOneWidget);
    final complete = find.text('Complete onboarding');
    await tester.ensureVisible(complete);
    await tester.tap(complete);
    await tester.pump();

    expect(refreshes, 1);
    expect(persistence.submission, isNotNull);
    expect(persistence.submission!.branch, 'Army');
    expect(persistence.submission!.highestRank, 'E-5–E-6');
    expect(persistence.submission!.supportNeeds, ['VA benefits', 'Housing']);
  });
}
