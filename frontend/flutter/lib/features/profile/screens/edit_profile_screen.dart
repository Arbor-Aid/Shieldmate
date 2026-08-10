import 'package:arbor_aid_app/core/utils/user_profile.dart';
import 'package:arbor_aid_app/core/utils/user_profile_service.dart';
import 'package:arbor_aid_app/core/widgets/app_card.dart';
import 'package:arbor_aid_app/core/widgets/app_scaffold.dart';
import 'package:arbor_aid_app/core/widgets/app_section_header.dart';
import 'package:arbor_aid_app/core/widgets/app_state_view.dart';
import 'package:arbor_aid_app/core/widgets/primary_button.dart';
import 'package:flutter/material.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key, this.profile});

  final UserProfile? profile;

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final UserProfileService _profileService = UserProfileService();
  late final TextEditingController _nameController;
  late final TextEditingController _emailController;
  late final TextEditingController _orgController;
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.profile?.displayName ?? '');
    _emailController = TextEditingController(text: widget.profile?.email ?? '');
    _orgController = TextEditingController(text: widget.profile?.orgId ?? '');
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _orgController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      await _profileService.updateProfile(
        displayName: _nameController.text.trim(),
        email: _emailController.text.trim(),
        orgId: _orgController.text.trim().isEmpty ? null : _orgController.text.trim(),
      );
      if (mounted) {
        Navigator.pop(context);
      }
    } catch (error) {
      setState(() => _errorMessage = 'Unable to save profile.');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      title: 'Edit profile',
      child: AppStateView(
        isLoading: _isLoading,
        errorMessage: _errorMessage,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const AppSectionHeader(
              title: 'Profile details',
              subtitle: 'Update your account information.',
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
                    controller: _emailController,
                    decoration: const InputDecoration(labelText: 'Email address'),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _orgController,
                    decoration: const InputDecoration(labelText: 'Organization ID (optional)'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            PrimaryButton(
              label: 'Save changes',
              onPressed: _saveProfile,
              isLoading: _isLoading,
            ),
          ],
        ),
      ),
    );
  }
}