import { useCallback, useMemo } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import {
  mockAnalyticsResponse,
  mockReferralsResponse,
  mockResumeResponse,
} from '@/mocks/mcpResponses';

interface McpClientOptions {
  analyticsOrgId?: string | null;
}

interface McpRequestParams {
  operation: string;
  payload: Record<string, unknown>;
  uid?: string;
  orgId?: string;
  token?: string;
}

const normalizeBaseUrl = (value: string) => {
  const trimmed = value.trim().replace(/\/$/, '');
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return `https://${trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`}`;
};

const readImportMetaEnv = (key: string): string => {
  try {
    const meta = Function('return import.meta')() as { env?: Record<string, string> };
    return meta.env?.[key] ?? '';
  } catch (_) {
    return '';
  }
};

const readEndpoint = () => {
  const metaEndpoint = readImportMetaEnv('VITE_MCP_ENDPOINT');
  if (metaEndpoint) {
    return normalizeBaseUrl(metaEndpoint);
  }

  if (typeof process !== 'undefined' && process.env?.VITE_MCP_ENDPOINT) {
    return normalizeBaseUrl(process.env.VITE_MCP_ENDPOINT as string);
  }

  return '';
};

const isDevelopment = () => {
  if (typeof process !== 'undefined' && process.env?.NODE_ENV) {
    return process.env.NODE_ENV !== 'production';
  }

  const mode = readImportMetaEnv('MODE');
  return mode ? mode !== 'production' : true;
};

export function useMcpClient(options: McpClientOptions = {}) {
  const { currentUser } = useAuth();

  const endpoint = useMemo(() => readEndpoint(), []);

  const callMcp = useCallback(
    async ({ operation, payload, uid, orgId, token }: McpRequestParams) => {
      if (!endpoint) {
        throw new Error('MCP endpoint is not configured.');
      }

      const effectiveUid = uid ?? currentUser?.uid;
      if (!effectiveUid) {
        throw new Error('User must be authenticated to call MCP operations.');
      }

      const effectiveToken = token ?? (await currentUser?.getIdToken?.());
      if (!effectiveToken) {
        throw new Error('Unable to resolve Firebase ID token.');
      }

      const body = JSON.stringify({
        operation,
        ...payload,
      });

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${effectiveToken}`,
          'X-User-Id': effectiveUid,
          ...(orgId ? { 'X-Org-Id': orgId } : {}),
        },
        body,
      });

      const text = await response.text();
      let parsed: unknown = {};
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch (error) {
          if (isDevelopment()) {
            console.debug('Failed to parse MCP response as JSON:', error);
          }
          parsed = { raw: text };
        }
      }

      if (!response.ok) {
        if (isDevelopment()) {
          console.debug(`MCP operation ${operation} failed with status ${response.status}`, parsed);
        }
        const message = (parsed as { message?: string })?.message ?? `MCP request ${operation} failed.`;
        throw new Error(message);
      }

      return parsed as Record<string, unknown>;
    },
    [currentUser, endpoint],
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
