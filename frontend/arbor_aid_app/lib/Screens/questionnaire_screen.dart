import 'package:flutter/material.dart';

import '../services/referral_service.dart';

typedef JsonMap = Map<String, dynamic>;

class QuestionnaireScreen extends StatefulWidget {
  const QuestionnaireScreen({super.key});

  @override
  State<QuestionnaireScreen> createState() => _QuestionnaireScreenState();
}

class _QuestionnaireScreenState extends State<QuestionnaireScreen> {
  final _formKey = GlobalKey<FormState>();
  final ReferralService _referralService = ReferralService();

  final TextEditingController _dutyStationController = TextEditingController();
  final TextEditingController _roleController = TextEditingController();
  final TextEditingController _householdNotesController = TextEditingController();
  final TextEditingController _availabilityController = TextEditingController();

  int _currentStep = 0;
  bool _needsHousing = true;
  bool _needsEmployment = false;
  bool _needsMentalHealth = false;

  bool _submitting = false;
  Future<JsonMap>? _referralFuture;
  String? _referralError;

  void _continue() {
    if (_currentStep < 3) {
      setState(() => _currentStep += 1);
      return;
    }

    if (_formKey.currentState?.validate() ?? false) {
      _submitAssessment();
    }
  }

  void _cancel() {
    if (_currentStep > 0) {
      setState(() => _currentStep -= 1);
    } else {
      Navigator.pop(context);
    }
  }

  void _submitAssessment() {
    if (_submitting) {
      return;
    }

    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    final answers = <String, dynamic>{
      'dutyStation': _dutyStationController.text.trim(),
      'currentRole': _roleController.text.trim(),
      'needs': {
        'housing': _needsHousing,
        'employment': _needsEmployment,
        'mentalHealth': _needsMentalHealth,
      },
      'familyNotes': _householdNotesController.text.trim(),
      'availability': _availabilityController.text.trim(),
    };

    final future = _referralService.getReferrals(answers);

    setState(() {
      _submitting = true;
      _referralError = null;
      _referralFuture = future;
    });

    future.then((response) {
      if (!mounted) {
        return;
      }
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Assessment submitted successfully.')),
      );
      setState(() {
        _submitting = false;
      });
    }).catchError((error) {
      if (!mounted) {
        return;
      }
      setState(() {
        _submitting = false;
        _referralError = error is Exception ? error.toString() : 'Service temporarily unavailable';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Service temporarily unavailable')),
      );
    });
  }

  @override
  void dispose() {
    _dutyStationController.dispose();
    _roleController.dispose();
    _householdNotesController.dispose();
    _availabilityController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support Needs Assessment'),
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stepper(
                currentStep: _currentStep,
                onStepContinue: _continue,
                onStepCancel: _cancel,
                controlsBuilder: (context, details) {
                  return Row(
                    children: [
                      ElevatedButton(
                        onPressed: _submitting ? null : details.onStepContinue,
                        child: _currentStep == 3 ? const Text('Submit') : const Text('Next'),
                      ),
                      const SizedBox(width: 8),
                      TextButton(
                        onPressed: details.onStepCancel,
                        child: Text(_currentStep == 0 ? 'Cancel' : 'Back'),
                      ),
                    ],
                  );
                },
                steps: _buildSteps(),
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerRight,
                child: ElevatedButton.icon(
                  onPressed: _submitting ? null : _submitAssessment,
                  icon: _submitting
                      ? const SizedBox(
                          height: 16,
                          width: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Icon(Icons.send),
                  label: const Text('Submit Assessment'),
                ),
              ),
              const SizedBox(height: 16),
              if (_referralError != null)
                Text(
                  _referralError!,
                  style: const TextStyle(color: Colors.redAccent),
                ),
              _buildReferralSection(),
            ],
          ),
        ),
      ),
    );
  }

  List<Step> _buildSteps() {
    return [
      Step(
        title: const Text('Service Background'),
        isActive: _currentStep >= 0,
        content: Column(
          children: [
            TextFormField(
              controller: _dutyStationController,
              decoration: const InputDecoration(labelText: 'Current duty station'),
              validator: (value) =>
                  (value == null || value.isEmpty) ? 'Please enter your station' : null,
            ),
            TextFormField(
              controller: _roleController,
              decoration: const InputDecoration(labelText: 'Current role'),
            ),
          ],
        ),
      ),
      Step(
        title: const Text('Immediate Needs'),
        isActive: _currentStep >= 1,
        content: Column(
          children: [
            CheckboxListTile(
              value: _needsHousing,
              onChanged: (value) => setState(() => _needsHousing = value ?? false),
              title: const Text('Housing assistance'),
            ),
            CheckboxListTile(
              value: _needsEmployment,
              onChanged: (value) => setState(() => _needsEmployment = value ?? false),
              title: const Text('Employment transition support'),
            ),
            CheckboxListTile(
              value: _needsMentalHealth,
              onChanged: (value) => setState(() => _needsMentalHealth = value ?? false),
              title: const Text('Mental health support'),
            ),
          ],
        ),
      ),
      Step(
        title: const Text('Family & Community'),
        isActive: _currentStep >= 2,
        content: TextFormField(
          controller: _householdNotesController,
          decoration: const InputDecoration(labelText: 'Household considerations'),
          maxLines: 3,
        ),
      ),
      Step(
        title: const Text('Availability'),
        isActive: _currentStep >= 3,
        content: TextFormField(
          controller: _availabilityController,
          decoration: const InputDecoration(labelText: 'Preferred contact window'),
          validator: (value) =>
              (value == null || value.isEmpty) ? 'Let us know when to reach out' : null,
        ),
      ),
    ];
  }

  Widget _buildReferralSection() {
    final future = _referralFuture;
    if (future == null) {
      return const SizedBox.shrink();
    }

    return FutureBuilder<JsonMap>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Center(child: CircularProgressIndicator());
        }
        if (snapshot.hasError) {
          return const SizedBox.shrink();
        }
        final referrals = _parseReferrals(snapshot.data);
        if (referrals.isEmpty) {
          return const SizedBox.shrink();
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Referral Results',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ...referrals.map(
              (item) => Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: ListTile(
                  leading: const Icon(Icons.support_agent),
                  title: Text(item.title),
                  subtitle: Text(item.description),
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  List<_ReferralItem> _parseReferrals(JsonMap? response) {
    if (response == null) {
      return const [];
    }
    final data = response['referrals'] ?? response['data'];
    if (data is List) {
      return data
          .whereType<Map<String, dynamic>>()
          .map(
            (entry) => _ReferralItem(
              title: entry['title']?.toString() ?? 'Referral',
              description: entry['description']?.toString() ?? 'No description provided.',
            ),
          )
          .toList();
    }
    return const [];
  }
}

class _ReferralItem {
  const _ReferralItem({required this.title, required this.description});
  final String title;
  final String description;
}
