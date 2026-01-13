export const mockResumeResponse = {
  status: 'success',
  resume: {
    summary: 'Seasoned infantry unit leader transitioning to logistics operations.',
    highlights: [
      'Led cross-functional teams in high-pressure environments',
      'Implemented battalion-wide readiness improvements',
      'Coordinated logistics with 98% on-time delivery'
    ]
  }
};

export const mockReferralsResponse = {
  status: 'success',
  referrals: [
    {
      id: 'ref-001',
      title: 'Veteran Career Transition Workshop',
      description: 'A 4-week coaching series for logistics and operations roles.'
    },
    {
      id: 'ref-002',
      title: 'Operations Fellowship Program',
      description: 'Paid fellowship pairing veterans with supply chain mentors.'
    }
  ]
};

export const mockAnalyticsResponse = {
  status: 'success',
  summary: {
    totalUsers: 1420,
    activeUsers: 812,
    resumesGenerated: 236
  }
};
