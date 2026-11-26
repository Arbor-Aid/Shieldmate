import 'dart:async';

import 'package:a2ui_core/a2ui_core.dart';
import 'package:a2ui_flutter/a2ui_flutter.dart';
import 'package:flutter/material.dart';

import '../../genui/catalog/shieldmate_catalog.dart';
import '../models/onboarding_submission.dart';
import '../services/firestore_onboarding_persistence.dart';

class OnboardingFlowScreen extends StatefulWidget {
  const OnboardingFlowScreen({
    this.persistence,
    this.onCompleted,
    super.key,
  });

  final OnboardingPersistence? persistence;
  final Future<void> Function()? onCompleted;

  @override
  State<OnboardingFlowScreen> createState() => _OnboardingFlowScreenState();
}

class _OnboardingFlowScreenState extends State<OnboardingFlowScreen> {
  static const _surfaceId = 'shieldmate-onboarding';
  static const _totalSteps = 4;
  static const _branches = [
    'Army',
    'Marine Corps',
    'Navy',
    'Air Force',
    'Space Force',
    'Coast Guard',
  ];
  static const _serviceBands = [
    'Less than 2 years',
    '2–4 years',
    '5–9 years',
    '10–19 years',
    '20+ years',
  ];
  static const _dischargeStatuses = [
    'Honorable',
    'General under honorable conditions',
    'Other than honorable',
    'Medical',
    'Still serving',
    'Prefer not to say',
  ];
  static const _supportNeeds = [
    'VA benefits',
    'Health and wellness',
    'Housing',
    'Employment',
    'Education',
    'Financial guidance',
    'Legal support',
    'Community connection',
  ];

  late final OnboardingPersistence _persistence =
      widget.persistence ?? FirestoreOnboardingPersistence();
  late final MessageProcessor<ComponentImplementation> _processor;
  SurfaceModel<ComponentImplementation>? _surface;
  int _stepIndex = 0;
  String? _validationError;
  String? _submitError;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _processor = MessageProcessor<ComponentImplementation>(
      catalogs: [shieldMateCatalog()],
      defaultVersion: A2uiProtocolVersion.v1_0,
      validationConfig: ValidationConfig.strict,
    );
    _processor.model.onSurfaceCreated.subscribe((surface) {
      if (!mounted) return;
      setState(() => _surface = surface);
    });
    _processor.model.onAction.subscribe((action) {
      switch (action.name) {
        case 'continue':
          unawaited(_continue());
        case 'back':
          _back();
        case 'complete':
          unawaited(_complete());
      }
    });
    _createSurface();
  }

  @override
  void dispose() {
    _processor.dispose();
    super.dispose();
  }

  void _createSurface() {
    _processor.processMessages([
      {
        'version': '1.0',
        'createSurface': {
          'surfaceId': _surfaceId,
          'catalogId': shieldMateCatalogId,
          'dataModel': {
            'branch': '',
            'yearsOfService': '',
            'highestRank': '',
            'dischargeStatus': '',
            'supportNeeds': <String>[],
            'additionalContext': '',
          },
          'components': _componentsForStep(),
        },
      },
    ]);
  }

  void _renderStep() {
    final currentData = _surface?.dataModel.get('/');
    final dataModel = currentData is Map
        ? Map<String, Object?>.from(currentData)
        : <String, Object?>{};
    _processor.processMessages([
      {
        'version': '1.0',
        'deleteSurface': {'surfaceId': _surfaceId},
      },
      {
        'version': '1.0',
        'createSurface': {
          'surfaceId': _surfaceId,
          'catalogId': shieldMateCatalogId,
          'dataModel': dataModel,
          'components': _componentsForStep(),
        },
      },
    ]);
  }

  Future<void> _continue() async {
    final error = _validateStep();
    if (error != null) {
      setState(() => _validationError = error);
      _renderStep();
      return;
    }
    setState(() {
      _validationError = null;
      _stepIndex++;
    });
    _renderStep();
  }

  void _back() {
    if (_stepIndex == 0) return;
    setState(() {
      _validationError = null;
      _submitError = null;
      _stepIndex--;
    });
    _renderStep();
  }

  Future<void> _complete() async {
    if (_submitting) return;
    setState(() {
      _submitting = true;
      _submitError = null;
    });
    try {
      final context = _value<String>('/additionalContext').trim();
      await _persistence.complete(
        OnboardingSubmission(
          branch: _value('/branch'),
          yearsOfService: _value('/yearsOfService'),
          highestRank: _value('/highestRank'),
          dischargeStatus: _value('/dischargeStatus'),
          supportNeeds: _stringList('/supportNeeds'),
          additionalContext: context.isEmpty ? null : context,
        ),
      );
      await widget.onCompleted?.call();
    } catch (_) {
      if (mounted) {
        setState(() {
          _submitting = false;
          _submitError = 'We could not save your information. Try again.';
        });
      }
    }
  }

  String? _validateStep() {
    switch (_stepIndex) {
      case 0:
        if (_value<String>('/branch').isEmpty ||
            _value<String>('/yearsOfService').isEmpty) {
          return 'Choose your branch and length of service.';
        }
      case 1:
        if (_value<String>('/highestRank').isEmpty ||
            _value<String>('/dischargeStatus').isEmpty) {
          return 'Choose your highest rank and service status.';
        }
      case 2:
        if (_stringList('/supportNeeds').isEmpty) {
          return 'Choose at least one area where ShieldMate can help.';
        }
    }
    return null;
  }

  T _value<T>(String path) {
    final value = _surface?.dataModel.get(path);
    if (value is T) return value;
    if (T == String) return '' as T;
    throw StateError('Unexpected onboarding value at $path');
  }

  List<String> _stringList(String path) =>
      (_surface?.dataModel.get(path) as List<Object?>? ?? const [])
          .whereType<String>()
          .toList(growable: false);

  List<Map<String, Object?>> _componentsForStep() {
    final common = <Map<String, Object?>>[
      {
        'id': 'root',
        'component': 'ShieldMatePanel',
        'children': _childIdsForStep(),
      },
      {
        'id': 'progress',
        'component': 'ShieldMateProgress',
        'step': _stepIndex + 1,
        'total': _totalSteps,
        'label': 'Getting to know you',
      },
    ];
    return [...common, ..._stepComponents()];
  }

  List<String> _childIdsForStep() => switch (_stepIndex) {
        0 => ['progress', 'header', 'branch', 'years', 'continue'],
        1 => ['progress', 'header', 'rank', 'status', 'back', 'continue'],
        2 => ['progress', 'header', 'needs', 'context', 'back', 'continue'],
        _ => ['progress', 'header', 'summary', 'back', 'complete'],
      };

  List<Map<String, Object?>> _stepComponents() => switch (_stepIndex) {
        0 => [
            _header(
              'Your service',
              'A few details help ShieldMate personalize benefits and resources.',
            ),
            _select('branch', 'Branch of service', _branches, '/branch'),
            _select(
              'years',
              'Length of service',
              _serviceBands,
              '/yearsOfService',
            ),
            _action('continue', 'Continue', 'continue'),
          ],
        1 => [
            _header(
              'Your service history',
              'Choose the options that best match your record.',
            ),
            _select(
              'rank',
              'Highest rank',
              _ranksFor(_value<String>('/branch')),
              '/highestRank',
            ),
            _select(
              'status',
              'Current or discharge status',
              _dischargeStatuses,
              '/dischargeStatus',
            ),
            _action('back', 'Back', 'back'),
            _action('continue', 'Continue', 'continue'),
          ],
        2 => [
            _header(
              'What would help most?',
              'Select every area you want to work on. You can change these later.',
            ),
            {
              'id': 'needs',
              'component': 'ShieldMateMultiSelect',
              'label': 'Support needs',
              'options': _supportNeeds,
              'value': _bind('/supportNeeds'),
              'errorText': _validationError ?? '',
            },
            {
              'id': 'context',
              'component': 'ShieldMateTextInput',
              'label': 'Anything else you want us to know? (optional)',
              'hint': 'Share only what feels useful right now.',
              'value': _bind('/additionalContext'),
              'maxLines': 4,
            },
            _action('back', 'Back', 'back'),
            _action('continue', 'Review', 'continue'),
          ],
        _ => [
            _header(
              'Review your starting point',
              'Nothing is submitted until you choose Complete onboarding.',
            ),
            {
              'id': 'summary',
              'component': 'ShieldMateInfoCard',
              'title': 'Your ShieldMate plan',
              'body': _summary(),
            },
            _action('back', 'Back', 'back'),
            _action('complete', 'Complete onboarding', 'complete'),
          ],
      };

  Map<String, Object?> _header(String title, String description) => {
        'id': 'header',
        'component': 'ShieldMateSectionHeader',
        'title': title,
        'description': description,
      };

  Map<String, Object?> _select(
    String id,
    String label,
    List<String> options,
    String path,
  ) =>
      {
        'id': id,
        'component': 'ShieldMateSelect',
        'label': label,
        'options': options,
        'value': _bind(path),
        'errorText': _validationError ?? '',
      };

  Map<String, Object?> _action(String id, String label, String event) => {
        'id': id,
        'component': 'ShieldMatePrimaryAction',
        'label': label,
        'action': {
          'event': {'name': event},
        },
      };

  Map<String, Object?> _bind(String path) => {'@path': path};

  String _summary() {
    final needs = _stringList('/supportNeeds').join(', ');
    return '${_value<String>('/branch')} • ${_value<String>('/yearsOfService')}\n'
        '${_value<String>('/highestRank')} • ${_value<String>('/dischargeStatus')}\n'
        'Focus areas: $needs';
  }

  List<String> _ranksFor(String branch) {
    if (branch == 'Navy' || branch == 'Coast Guard') {
      return const [
        'E-1–E-4',
        'E-5–E-6',
        'Chief Petty Officer',
        'Warrant Officer',
        'O-1–O-3',
        'O-4–O-6',
        'Flag Officer',
        'Prefer not to say',
      ];
    }
    return const [
      'E-1–E-4',
      'E-5–E-6',
      'E-7–E-9',
      'Warrant Officer',
      'O-1–O-3',
      'O-4–O-6',
      'General Officer',
      'Prefer not to say',
    ];
  }

  @override
  Widget build(BuildContext context) {
    final surface = _surface;
    return Scaffold(
      appBar: AppBar(title: const Text('Welcome to ShieldMate')),
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 720),
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 32),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  if (surface == null)
                    const Center(child: CircularProgressIndicator())
                  else
                    IgnorePointer(
                      ignoring: _submitting,
                      child: A2uiSurface(
                        key: ObjectKey(surface),
                        surface: surface,
                      ),
                    ),
                  if (_submitting) ...[
                    const SizedBox(height: 16),
                    const LinearProgressIndicator(),
                    const SizedBox(height: 8),
                    const Text('Saving your profile…',
                        textAlign: TextAlign.center),
                  ],
                  if (_submitError != null) ...[
                    const SizedBox(height: 16),
                    Semantics(
                      liveRegion: true,
                      child: Text(
                        _submitError!,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.error),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
