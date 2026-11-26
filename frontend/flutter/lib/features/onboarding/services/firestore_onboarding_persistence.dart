import '../../../core/utils/user_profile_service.dart';
import '../models/onboarding_submission.dart';

class FirestoreOnboardingPersistence implements OnboardingPersistence {
  FirestoreOnboardingPersistence({UserProfileService? profileService})
      : _profileService = profileService ?? UserProfileService();

  final UserProfileService _profileService;

  @override
  Future<void> complete(OnboardingSubmission submission) async {
    await _profileService.completeOnboarding(
      branch: submission.branch,
      yearsOfService: submission.yearsOfService,
      highestRank: submission.highestRank,
      dischargeStatus: submission.dischargeStatus,
      supportNeeds: submission.supportNeeds,
      additionalContext: submission.additionalContext,
    );
  }
}
