class OnboardingSubmission {
  const OnboardingSubmission({
    required this.branch,
    required this.yearsOfService,
    required this.highestRank,
    required this.dischargeStatus,
    required this.supportNeeds,
    this.additionalContext,
  });

  final String branch;
  final String yearsOfService;
  final String highestRank;
  final String dischargeStatus;
  final List<String> supportNeeds;
  final String? additionalContext;
}

abstract interface class OnboardingPersistence {
  Future<void> complete(OnboardingSubmission submission);
}
