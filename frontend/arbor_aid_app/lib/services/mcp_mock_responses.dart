const Map<String, dynamic> mockResumeResponse = {
  'status': 'success',
  'resume': {
    'summary':
        'Seasoned infantry unit leader transitioning to logistics operations with team leadership expertise.',
    'highlights': [
      'Led cross-functional teams in high-pressure environments',
      'Implemented training programs adopted across battalions',
      'Coordinated multi-unit logistics with 98% on-time delivery'
    ]
  }
};

const Map<String, dynamic> mockReferralsResponse = {
  'status': 'success',
  'referrals': [
    {
      'id': 'ref-001',
      'title': 'Veteran Career Transition Workshop',
      'description': 'A 4-week coaching series focused on logistics and operations roles.'
    },
    {
      'id': 'ref-002',
      'title': 'Logistics Operations Fellowship',
      'description': 'Paid fellowship connecting veterans with supply chain mentors.'
    }
  ]
};

const Map<String, dynamic> mockAnalyticsResponse = {
  'status': 'success',
  'summary': {'totalUsers': 1420, 'activeUsers': 812, 'resumesGenerated': 236}
};
