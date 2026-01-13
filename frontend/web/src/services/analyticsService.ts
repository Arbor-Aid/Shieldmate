import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore";
import { db, trackEvent } from "@/lib/firebase";
import { AnalyticsData, ServiceDistribution, ReferralSource, UserActivityData, TimeSeriesData, ReferralByType, ActivityMetric } from "@/types/analytics";

export async function getOrganizationAnalytics(organizationId: string): Promise<AnalyticsData> {
  try {
    // Track analytics view
    trackEvent("organization_analytics_viewed", { organizationId });
    
    // This would typically fetch real data from Firebase Analytics
    // For now, we'll return mock data
    
    // Get total users and new signups
    const totalUsers = await getTotalUsers(organizationId);
    const newSignups = await getNewSignups(organizationId);
    const activeUsers = await getActiveUsers(organizationId);
    const completedReferrals = await getCompletedReferrals(organizationId);
    
    // Get time series data for user growth
    const timeSeriesData = await getUserGrowthData(organizationId);
    
    // Get service distribution
    const serviceDistribution = await getServiceDistribution(organizationId);
    
    // Get referral sources
    const referralSources = await getReferralSources(organizationId);
    
    // Get user activity data
    const userActivity = generateUserActivityData(30);
    
    // Get mock data for user engagement
    const userEngagement = generateUserEngagementData(14);
    
    // Get mock data for referrals by type
    const referralsByType = await getReferralsByType(organizationId);
    
    // Get mock data for document activity
    const documentActivity = generateDocumentActivityData(30);
    
    return {
      newSignups,
      totalUsers: totalUsers.value,
      activeUsers: activeUsers.value,
      completedReferrals,
      timeSeriesData,
      serviceDistribution,
      referralSources,
      userActivity,
      userEngagement,
      referralsByType,
      documentActivity,
      totalDocuments: 145,
      totalReferrals: 87,
      profileCompletions: 35,
      newUsers: newSignups.value,
      userGrowth: timeSeriesData,
      activeSessions: generateSessionData(7),
      activityMetrics: generateActivityMetrics(30),
      documentUploadsRate: 12,
      resumesGenerated: 68,
      resumeGenerationRate: 25,
      questionnaireCompletionRate: 78
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return getMockAnalyticsData();
  }
}

// Mock data for analytics dashboard
function getMockAnalyticsData(): AnalyticsData {
  const userEngagement = generateUserEngagementData(14);
  const documentActivity = generateDocumentActivityData(30);
  const referralsByType = getMockReferralsByType();
  const timeSeriesData = generateTimeSeriesData(30);
  
  return {
    newSignups: {
      label: "New Signups (This Week)",
      value: 24,
      change: 12,
      trend: "up" as const
    },
    totalUsers: 267,
    activeUsers: 183,
    completedReferrals: {
      label: "Completed Referrals",
      value: 42,
      change: 28,
      trend: "up" as const
    },
    timeSeriesData,
    serviceDistribution: [
      { name: "Housing", value: 35, color: "#3b82f6" },
      { name: "Employment", value: 45, color: "#10b981" },
      { name: "Healthcare", value: 20, color: "#f97316" },
      { name: "Benefits", value: 15, color: "#8b5cf6" },
      { name: "Legal", value: 10, color: "#ec4899" }
    ],
    referralSources: [
      { source: "Direct", count: 52 },
      { source: "VA", count: 28 },
      { source: "Partner Orgs", count: 35 },
      { source: "Community Events", count: 19 },
      { source: "Other", count: 8 }
    ],
    userActivity: generateUserActivityData(30),
    userEngagement,
    documentActivity,
    referralsByType,
    totalDocuments: 145,
    totalReferrals: 87,
    profileCompletions: 35,
    newUsers: 24,
    userGrowth: timeSeriesData,
    activeSessions: generateSessionData(7),
    activityMetrics: generateActivityMetrics(30),
    documentUploadsRate: 12,
    resumesGenerated: 68,
    resumeGenerationRate: 25,
    questionnaireCompletionRate: 78
  };
}

// Helper function to generate time series data for charts
function generateTimeSeriesData(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  let cumulativeUsers = 220; // Starting value
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    // Add some random growth with a slight upward trend
    const newUsers = Math.floor(Math.random() * 5) + 1;
    cumulativeUsers += newUsers;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: cumulativeUsers,
      newUsers: newUsers,
      count: cumulativeUsers
    });
  }
  
  return data;
}

// Helper function to generate user engagement data
function generateUserEngagementData(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const count = Math.floor(Math.random() * 20) + 150;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: count,
      count: count
    });
  }
  
  return data;
}

// Helper function to generate document activity data
function generateDocumentActivityData(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const uploads = Math.floor(Math.random() * 10) + 2;
    
    data.push({
      date: date.toISOString().split('T')[0],
      value: uploads,
      uploads: uploads
    });
  }
  
  return data;
}

// Helper function to generate user activity data
function generateUserActivityData(days: number): UserActivityData[] {
  const data: UserActivityData[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    const active = Math.floor(Math.random() * 30) + 150;
    const inactive = Math.floor(Math.random() * 20) + 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      active,
      inactive
    });
  }
  
  return data;
}

// Helper function to generate session data
function generateSessionData(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  for (let i = 0; i < days; i++) {
    const count = Math.floor(Math.random() * 50) + 100;
    
    data.push({
      date: daysOfWeek[i % 7],
      day: daysOfWeek[i % 7],
      value: count,
      count: count
    });
  }
  
  return data;
}

// Helper function to generate activity metrics
function generateActivityMetrics(days: number): ActivityMetric[] {
  const data: ActivityMetric[] = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      logins: Math.floor(Math.random() * 30) + 70,
      fileUploads: Math.floor(Math.random() * 15) + 5,
      resumeGens: Math.floor(Math.random() * 10) + 2,
      aiPrompts: Math.floor(Math.random() * 20) + 10
    });
  }
  
  return data;
}

// Function to get referrals by type
async function getReferralsByType(organizationId: string): Promise<ReferralByType[]> {
  try {
    // This would normally fetch real referral type data from Firestore
    // For now, we'll return mock data
    return getMockReferralsByType();
  } catch (error) {
    console.error("Error getting referrals by type:", error);
    return getMockReferralsByType();
  }
}

function getMockReferralsByType(): ReferralByType[] {
  return [
    { type: "Housing", count: 35 },
    { type: "Employment", count: 45 },
    { type: "Healthcare", count: 20 },
    { type: "Benefits", count: 15 },
    { type: "Legal", count: 10 }
  ];
}

// The following functions would normally fetch real data from Firestore
// For now, they return mock data

async function getTotalUsers(organizationId: string) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("organizationId", "==", organizationId));
    const snapshot = await getDocs(q);
    
    return {
      label: "Total Users",
      value: snapshot.size || 267, // Fallback to mock data
      change: 8,
      trend: "up" as const
    };
  } catch (error) {
    console.error("Error getting total users:", error);
    return {
      label: "Total Users",
      value: 267,
      change: 8,
      trend: "up" as const
    };
  }
}

async function getNewSignups(organizationId: string) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const usersRef = collection(db, "users");
    const q = query(
      usersRef, 
      where("organizationId", "==", organizationId),
      where("createdAt", ">=", Timestamp.fromDate(oneWeekAgo))
    );
    const snapshot = await getDocs(q);
    
    return {
      label: "New Signups (This Week)",
      value: snapshot.size || 24, // Fallback to mock data
      change: 12,
      trend: "up" as const
    };
  } catch (error) {
    console.error("Error getting new signups:", error);
    return {
      label: "New Signups (This Week)",
      value: 24,
      change: 12,
      trend: "up" as const
    };
  }
}

async function getActiveUsers(organizationId: string) {
  try {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    
    const usersRef = collection(db, "users");
    const q = query(
      usersRef, 
      where("organizationId", "==", organizationId),
      where("lastActive", ">=", Timestamp.fromDate(twoWeeksAgo))
    );
    const snapshot = await getDocs(q);
    
    return {
      label: "Active Users",
      value: snapshot.size || 183, // Fallback to mock data
      change: -5,
      trend: "down" as const
    };
  } catch (error) {
    console.error("Error getting active users:", error);
    return {
      label: "Active Users",
      value: 183,
      change: -5,
      trend: "down" as const
    };
  }
}

async function getCompletedReferrals(organizationId: string) {
  try {
    const referralsRef = collection(db, "referrals");
    const q = query(
      referralsRef, 
      where("organizationId", "==", organizationId),
      where("status", "==", "completed")
    );
    const snapshot = await getDocs(q);
    
    return {
      label: "Completed Referrals",
      value: snapshot.size || 42, // Fallback to mock data
      change: 28,
      trend: "up" as const
    };
  } catch (error) {
    console.error("Error getting completed referrals:", error);
    return {
      label: "Completed Referrals",
      value: 42,
      change: 28,
      trend: "up" as const
    };
  }
}

async function getUserGrowthData(organizationId: string): Promise<TimeSeriesData[]> {
  // In a real app, we would query Firestore to get historical user data
  // For now, return mock data
  return generateTimeSeriesData(30);
}

async function getServiceDistribution(organizationId: string): Promise<ServiceDistribution[]> {
  try {
    // This would normally fetch real service distribution data from Firestore
    // For now, we'll return mock data
    return [
      { name: "Housing", value: 35, color: "#3b82f6" },
      { name: "Employment", value: 45, color: "#10b981" },
      { name: "Healthcare", value: 20, color: "#f97316" },
      { name: "Benefits", value: 15, color: "#8b5cf6" },
      { name: "Legal", value: 10, color: "#ec4899" }
    ];
  } catch (error) {
    console.error("Error getting service distribution:", error);
    return [
      { name: "Housing", value: 35, color: "#3b82f6" },
      { name: "Employment", value: 45, color: "#10b981" },
      { name: "Healthcare", value: 20, color: "#f97316" },
      { name: "Benefits", value: 15, color: "#8b5cf6" },
      { name: "Legal", value: 10, color: "#ec4899" }
    ];
  }
}

async function getReferralSources(organizationId: string): Promise<ReferralSource[]> {
  try {
    // This would normally fetch real referral source data from Firestore
    // For now, we'll return mock data
    return [
      { source: "Direct", count: 52 },
      { source: "VA", count: 28 },
      { source: "Partner Orgs", count: 35 },
      { source: "Community Events", count: 19 },
      { source: "Other", count: 8 }
    ];
  } catch (error) {
    console.error("Error getting referral sources:", error);
    return [
      { source: "Direct", count: 52 },
      { source: "VA", count: 28 },
      { source: "Partner Orgs", count: 35 },
      { source: "Community Events", count: 19 },
      { source: "Other", count: 8 }
    ];
  }
}

export function getAnalyticsData(): Promise<AnalyticsData> {
  // This is a general analytics function that could be used for non-organization-specific analytics
  return Promise.resolve(getMockAnalyticsData());
}

export function getAdminAnalytics(): Promise<AnalyticsData> {
  // This would be used for site-wide admin analytics
  return Promise.resolve(getMockAnalyticsData());
}
