import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:arbor_aid_app/core/routing/app_navigation.dart';
import 'package:arbor_aid_app/core/routing/app_router.dart';
import 'package:arbor_aid_app/core/theme/app_theme.dart';
import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/widgets/app_shell.dart';

void main() {
  testWidgets('App router builds a shell-backed route', (tester) async {
    final session = AppSession.authenticated(
      role: AppRole.client,
      hasProfile: true,
    );

    await tester.pumpWidget(
      MaterialApp(
        theme: AppTheme.light(),
        onGenerateRoute: AppRouter(session: session).onGenerateRoute,
        initialRoute: AppRoutes.clientDashboard,
      ),
    );

    await tester.pump();

    expect(find.byType(AppShell), findsOneWidget);
    expect(tester.takeException(), isNull);
  });
}
