
export interface AnalyticsMetric {
  label: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface TimeSeriesData {
  date: string;
  value: number;
  count?: number;
  uploads?: number;
  [key: string]: any;
}

export interface ServiceDistribution {
  name: string;
  value: number;
  color?: string;
}

export interface ReferralSource {
  source: string;
  count: number;
}

export interface ReferralByType {
  type: string;
  count: number;
}

export interface UserActivityData {
  date: string;
  active: number;
  inactive: number;
}

export interface ActivityMetric {
  date: string;
  logins: number;
  fileUploads: number;
  resumeGens: number;
  aiPrompts: number;
}

export interface AnalyticsData {
  // Original metrics
  newSignups: AnalyticsMetric;
  totalUsers: number;
  activeUsers: number;
  completedReferrals: AnalyticsMetric;
  timeSeriesData: TimeSeriesData[];
  serviceDistribution: ServiceDistribution[];
  referralSources: ReferralSource[];
  userActivity: UserActivityData[];
  
  // Added for component compatibility
  totalDocuments: number;
  documentUploadsRate?: number;
  resumesGenerated?: number;
  resumeGenerationRate?: number;
  profileCompletions: number;
  questionnaireCompletionRate?: number;
  newUsers: number;
  totalReferrals: number;
  userEngagement: TimeSeriesData[];
  referralsByType: ReferralByType[];
  documentActivity: TimeSeriesData[];
  userGrowth?: TimeSeriesData[];
  activeSessions?: TimeSeriesData[];
  activityMetrics?: ActivityMetric[];
}

export interface AnalyticsTimeframe {
  label: string;
  value: 'day' | 'week' | 'month' | 'quarter' | 'year';
  days: number;
}
