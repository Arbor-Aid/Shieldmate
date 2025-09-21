import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMcpClient } from '../useMcpClient';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';
import { mockResumeResponse, mockAnalyticsResponse } from '@/mocks/mcpResponses';

jest.mock('@/lib/firebase', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('@/lib/firebaseService', () => ({
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  signInWithFacebook: jest.fn(),
  signInWithGithub: jest.fn(),
  signOut: jest.fn(),
  createUserDocument: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => {}),
}));


declare global {
  // eslint-disable-next-line no-var
  var fetch: jest.Mock;
}

describe('useMcpClient', () => {
  const originalEndpoint = process.env.VITE_MCP_ENDPOINT;
  const originalNodeEnv = process.env.NODE_ENV;
  let authValue: AuthContextType;

  const createWrapper = () => {
    const queryClient = new QueryClient();
    return ({ children }: { children: React.ReactNode }) => (
      <AuthContext.Provider value={authValue}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    process.env.VITE_MCP_ENDPOINT = 'https://mcp.example.com';
    process.env.NODE_ENV = 'test';
    global.fetch = jest.fn();
    authValue = {
      currentUser: {
        uid: 'user-123',
        getIdToken: jest.fn().mockResolvedValue('fake-jwt'),
      } as unknown as AuthContextType['currentUser'],
      loading: false,
      signInWithGoogle: jest.fn(),
      signInWithApple: jest.fn(),
      signInWithFacebook: jest.fn(),
      signInWithGithub: jest.fn(),
      signOut: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
    process.env.VITE_MCP_ENDPOINT = originalEndpoint;
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('posts generateResume payload with Firebase token', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify(mockResumeResponse),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMcpClient(), { wrapper });

    let response: any;
    await act(async () => {
      response = await result.current.generateResume.mutateAsync({
        experiences: ['Platoon Leader'],
      });
    });

    expect(response).toEqual(mockResumeResponse);
    expect(global.fetch).toHaveBeenCalledWith('https://mcp.example.com/api', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        Authorization: 'Bearer fake-jwt',
        'X-User-Id': 'user-123',
      }),
    }));

    const payload = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
    expect(payload.operation).toBe('generateResume');
    expect(payload.uid).toBe('user-123');
  });

  it('returns mock analytics data when MCP request fails in development', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => JSON.stringify({ message: 'Bad gateway' }),
    });

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMcpClient({ analyticsOrgId: 'org-789' }), { wrapper });

    await waitFor(() => {
      expect(result.current.fetchAnalytics.data).toEqual(mockAnalyticsResponse);
    });

    expect(global.fetch).toHaveBeenCalledWith('https://mcp.example.com/api', expect.objectContaining({
      headers: expect.objectContaining({
        'X-Org-Id': 'org-789',
      }),
    }));
  });
});

