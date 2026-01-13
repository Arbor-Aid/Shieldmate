import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { createMcpClient } from '@/services/mcpClient';
import {
  mockAnalyticsResponse,
  mockReferralsResponse,
  mockResumeResponse,
} from '@/mocks/mcpResponses';

interface McpClientOptions {
  analyticsOrgId?: string | null;
  orgId?: string | null;
}

const isDevelopment = () => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== 'production';
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.MODE) {
    return (import.meta as any).env.MODE !== 'production';
  }
  return true;
};

export function useMcpClient(options: McpClientOptions = {}) {
  const { currentUser, getIdToken } = useAuth();
  const defaultOrgId = options.orgId ?? null;

  const client = useMemo(
    () =>
      createMcpClient({
        getIdToken,
        getUid: () => currentUser?.uid,
      }),
    [getIdToken, currentUser?.uid],
  );

  const callMcp = useCallback(
    (params: { operation: string; payload?: Record<string, unknown>; orgId?: string | null }) =>
      client.request({ ...params, orgId: params.orgId ?? defaultOrgId ?? undefined }),
    [client, defaultOrgId],
  );

  const generateResume = useMutation({
    mutationKey: ['mcp', 'resume', currentUser?.uid],
    mutationFn: async (payload: Record<string, unknown>) => {
      try {
        return await callMcp({
          operation: 'generateResume',
          payload: { uid: currentUser?.uid, payload },
        });
      } catch (error) {
        if (isDevelopment()) {
          console.debug('Using mock resume response due to MCP error:', error);
          return mockResumeResponse;
        }
        throw error;
      }
    },
  });

  const getReferrals = useMutation({
    mutationKey: ['mcp', 'referrals', currentUser?.uid],
    mutationFn: async (answers: Record<string, unknown>) => {
      try {
        return await callMcp({
          operation: 'getReferrals',
          payload: { uid: currentUser?.uid, answers },
        });
      } catch (error) {
        if (isDevelopment()) {
          console.debug('Using mock referral response due to MCP error:', error);
          return mockReferralsResponse;
        }
        throw error;
      }
    },
  });

  const fetchAnalytics = useQuery({
    queryKey: ['mcp', 'analytics', options.analyticsOrgId, currentUser?.uid],
    enabled: Boolean(currentUser?.uid && options.analyticsOrgId),
    queryFn: async () => {
      try {
        return await callMcp({
          operation: 'fetchAnalytics',
          payload: { orgId: options.analyticsOrgId },
          orgId: options.analyticsOrgId ?? undefined,
        });
      } catch (error) {
        if (isDevelopment()) {
          console.debug('Using mock analytics response due to MCP error:', error);
          return mockAnalyticsResponse;
        }
        throw error;
      }
    },
  });

  return {
    generateResume,
    getReferrals,
    fetchAnalytics,
  };
}
