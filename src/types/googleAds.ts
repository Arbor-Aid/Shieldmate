export type GoogleAdsMutatingAction =
  | 'googleAds.createCampaign'
  | 'googleAds.updateCampaign'
  | 'googleAds.addKeywords'
  | 'googleAds.pauseCampaign';

export type GoogleAdsReadOnlyAction =
  | 'googleAds.policyCheck'
  | 'googleAds.metrics';

export type GoogleAdsAction = GoogleAdsMutatingAction | GoogleAdsReadOnlyAction;

export type GoogleAdsExecuteInput =
  | {
      action: GoogleAdsMutatingAction;
      approvalId: string;
      payload: Record<string, unknown>;
    }
  | {
      action: GoogleAdsReadOnlyAction;
      payload: Record<string, unknown>;
    };
