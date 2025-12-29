import { getAppCheckToken, getCurrentIdToken } from "@/lib/firebase";

type UiuxAuditPayload = {
  route: string;
  userRole: string;
  timestamp: string;
  componentList: string[];
};

type UiuxEventPayload = {
  route: string;
  eventType: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

type UiuxResponse = {
  ok: boolean;
  status: number;
  data: Record<string, unknown> | null;
};

const sendUiuxRequest = async (
  path: "/api/uiux/audit" | "/api/uiux/event",
  payload: UiuxAuditPayload | UiuxEventPayload
): Promise<UiuxResponse> => {
  let token: string | null = null;
  try {
    token = await getCurrentIdToken(false);
  } catch {
    token = null;
  }

  const appCheckToken = await getAppCheckToken();

  const response = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(appCheckToken ? { "X-Firebase-AppCheck": appCheckToken } : {}),
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  let data: Record<string, unknown> | null = null;
  try {
    data = bodyText ? (JSON.parse(bodyText) as Record<string, unknown>) : null;
  } catch {
    data = null;
  }

  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

export const submitUiuxAudit = (payload: UiuxAuditPayload) =>
  sendUiuxRequest("/api/uiux/audit", payload);

export const submitUiuxEvent = (payload: UiuxEventPayload) =>
  sendUiuxRequest("/api/uiux/event", payload);
