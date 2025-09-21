import 'dart:convert';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';

import '../services/mcp_mock_responses.dart';
import '../services/mcp_service.dart' show McpServiceException;
import '../services/resume_builder_service.dart';
import '../services/session_manager.dart';
import '../widgets/header_bar.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key, this.embedded = false});

  final bool embedded;

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ResumeBuilderService _resumeService = ResumeBuilderService();
  final ImagePicker _imagePicker = ImagePicker();
  final SessionManager _sessionManager = SessionManager();

  Uint8List? _profilePhoto;
  bool _uploadingPhoto = false;

  final List<_RecordEntry> _serviceRecord = const [
    _RecordEntry('Branch', 'United States Marine Corps'),
    _RecordEntry('Rank', 'Staff Sergeant (E-6)'),
    _RecordEntry('Service Years', '2012 - Present'),
    _RecordEntry('MOS', '0369 - Infantry Unit Leader'),
  ];

  final List<_SupportContact> _supportTeam = const [
    _SupportContact('Transition Specialist', 'GySgt. Walker', Icons.support_agent),
    _SupportContact('Behavioral Health', 'Dr. Chen', Icons.volunteer_activism),
    _SupportContact('Career Coach', 'Ms. Ramirez', Icons.work_outline),
  ];

  final List<String> _objectives = const [
    'Transition to logistics operations role within 12 months',
    'Complete PMP certification in progress',
    'Schedule quarterly wellness check-ins',
  ];

  Map<String, dynamic>? _resumePreview;
  bool _loadingResume = false;
  String? _resumeError;

  Future<void> _handleGenerateResume() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      setState(() {
        _resumeError = 'You must be signed in to generate a resume.';
        _resumePreview = null;
      });
      _showSnackBar('Sign in to generate a resume.');
      return;
    }

    setState(() {
      _loadingResume = true;
      _resumeError = null;
    });

    final contextPayload = {
      'serviceRecord':
          _serviceRecord.map((entry) => {'label': entry.label, 'value': entry.value}).toList(),
      'objectives': _objectives,
    };

    try {
      final response = await _resumeService.buildResume(contextPayload);
      if (!mounted) {
        return;
      }
      setState(() {
        _resumePreview = response;
        _resumeError = null;
      });
      _showSnackBar('Resume generated for ${user.displayName ?? user.email ?? user.uid}.');
    } on McpServiceException catch (error) {
      if (!mounted) {
        return;
      }
      if (kDebugMode) {
        debugPrint('Resume MCP error: ${error.message}');
      }
      setState(() {
        _resumeError = error.message;
        _resumePreview = mockResumeResponse;
      });
      _showSnackBar('Service temporarily unavailable');
    } catch (error, stackTrace) {
      if (!mounted) {
        return;
      }
      if (kDebugMode) {
        debugPrint('Unexpected resume generation error: $error');
        debugPrint(stackTrace.toString());
      }
      setState(() {
        _resumeError = 'Something went wrong while generating your resume.';
        _resumePreview = null;
      });
      _showSnackBar('Service temporarily unavailable');
    } finally {
      if (mounted) {
        setState(() => _loadingResume = false);
      }
    }
  }

  Future<void> _pickProfilePhoto() async {
    if (_uploadingPhoto) {
      return;
    }
    try {
      setState(() => _uploadingPhoto = true);
      final selection = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1024,
        imageQuality: 82,
      );
      if (selection == null) {
        setState(() => _uploadingPhoto = false);
        return;
      }
      final bytes = await selection.readAsBytes();
      if (!mounted) {
        return;
      }
      setState(() {
        _profilePhoto = bytes;
        _uploadingPhoto = false;
      });
      _showSnackBar('Profile photo updated (local preview).');
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() => _uploadingPhoto = false);
      _showSnackBar('Unable to update profile photo right now.');
    }
  }

  Future<void> _exportResumeAsPdf() async {
    if (_resumePreview == null) {
      _showSnackBar('Generate a resume first.');
      return;
    }
    _showSnackBar('PDF export coming soon.');
  }

  Widget _buildProfileAvatar(User? user) {
    final bytes = _profilePhoto;
    if (bytes != null) {
      return CircleAvatar(
        radius: 44,
        backgroundImage: MemoryImage(bytes),
      );
    }

    final displayName = user?.displayName ?? user?.email ?? 'Marine';
    final fallbackUrl = Uri(
      scheme: 'https',
      host: 'ui-avatars.com',
      path: 'api/',
      queryParameters: <String, String>{
        'background': '0D47A1',
        'color': 'fff',
        'name': displayName,
      },
    ).toString();
    final photoUrl = user?.photoURL;
    final imageUrl = (photoUrl != null && photoUrl.isNotEmpty) ? photoUrl : fallbackUrl;

    return CachedNetworkImage(
      imageUrl: imageUrl,
      imageBuilder: (context, provider) => CircleAvatar(
        radius: 44,
        backgroundImage: provider,
      ),
      placeholder: (context, url) => CircleAvatar(
        radius: 44,
        backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
        child: const CircularProgressIndicator(strokeWidth: 2),
      ),
      errorWidget: (context, url, error) => CircleAvatar(
        radius: 44,
        backgroundColor: Theme.of(context).colorScheme.primary.withValues(alpha: 0.12),
        child: const Icon(Icons.person_outline, size: 32),
      ),
    );
  }

  void _showSnackBar(String message) {
    if (!mounted) {
      return;
    }
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
  }

  @override
  Widget build(BuildContext context) {
    final user = FirebaseAuth.instance.currentUser;
    final content = SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    _buildProfileAvatar(user),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            user?.displayName ?? user?.email ?? 'Shieldmate Marine',
                            style: Theme.of(context)
                                .textTheme
                                .titleMedium
                                ?.copyWith(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          FutureBuilder<String?>(
                            future: _sessionManager.readIdToken(),
                            builder: (context, snapshot) {
                              final stored = snapshot.data;
                              final hasToken = (stored ?? '').isNotEmpty;
                              return Text(
                                hasToken ? 'Secure session cached' : 'No cached token yet',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .onSurface
                                          .withValues(alpha: 0.7),
                                    ),
                              );
                            },
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 16),
                    FilledButton.icon(
                      onPressed: _uploadingPhoto ? null : _pickProfilePhoto,
                      icon: _uploadingPhoto
                          ? const SizedBox(
                              width: 16,
                              height: 16,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            )
                          : const Icon(Icons.upload),
                      label: Text(_uploadingPhoto ? 'Uploading?' : 'Upload Photo'),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Service Snapshot',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ..._serviceRecord.map(
                      (entry) => Padding(
                        padding: const EdgeInsets.symmetric(vertical: 4),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(entry.label, style: const TextStyle(fontWeight: FontWeight.bold)),
                            Text(entry.value),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Support Network',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    ..._supportTeam.map(
                      (contact) => Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          leading: CircleAvatar(child: Icon(contact.icon)),
                          title: Text(contact.role),
                          subtitle: Text(contact.name),
                          trailing: IconButton(
                            icon: const Icon(Icons.message),
                            onPressed: () {},
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'AI Resume Assistant',
                          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        ElevatedButton(
                          onPressed: _loadingResume ? null : _handleGenerateResume,
                          child: _loadingResume
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Generate Resume'),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'Tap generate to request a tailored resume draft from the Shieldmate MCP.',
                    ),
                    const SizedBox(height: 12),
                    if (_resumeError != null)
                      Text(
                        _resumeError!,
                        style: const TextStyle(color: Colors.redAccent),
                      ),
                    if (_resumePreview != null) ...[
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(top: 12),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Theme.of(context)
                              .colorScheme
                              .surfaceContainerHighest
                              .withValues(alpha: 0.3),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: SelectableText(
                          const JsonEncoder.withIndent('  ').convert(_resumePreview),
                          style: const TextStyle(fontFamily: 'Courier', fontSize: 12),
                        ),
                      ),
                      const SizedBox(height: 12),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton.icon(
                          onPressed: _exportResumeAsPdf,
                          icon: const Icon(Icons.picture_as_pdf),
                          label: const Text('Export PDF'),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Personal Objectives',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    ..._objectives.map(
                      (objective) => Text('- $objective'),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );

    if (widget.embedded) {
      return content;
    }

    return Scaffold(
      appBar: HeaderBar(
        title: 'Profile',
        actions: [
          IconButton(
            icon: const Icon(Icons.edit),
            onPressed: () {},
          ),
        ],
      ),
      body: content,
    );
  }
}

class _RecordEntry {
  const _RecordEntry(this.label, this.value);
  final String label;
  final String value;
}

class _SupportContact {
  const _SupportContact(this.role, this.name, this.icon);
  final String role;
  final String name;
  final IconData icon;
}
