import 'package:arbor_aid_app/core/widgets/app_loading_indicator.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:flutter/material.dart';

class LoadingScreen extends StatelessWidget {
  const LoadingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const AppScaffold(
      title: 'Loading',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AppSectionHeader(
            title: 'Preparing your dashboard',
            subtitle: 'We are gathering your latest updates.',
          ),
          SizedBox(height: 24),
          AppLoadingIndicator(),
        ],
      ),
    );
  }
}