import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useClaimsAuth } from "@/hooks/useClaimsAuth";
import { createApprovalDraft } from "@/services/approvalService";
import type { GoogleAdsActionPayload } from "@/types/googleAds";

const actionOptions = [
  "googleAds.createCampaign",
  "googleAds.updateCampaign",
  "googleAds.addKeywords",
  "googleAds.pauseCampaign",
] as const;

type ActionType = (typeof actionOptions)[number];

export default function AdminApprovalNew() {
  const { currentUser } = useAuth();
  const { orgIds, orgAdminOrgs, isSuperAdmin, loading } = useClaimsAuth();
  const navigate = useNavigate();

  const [orgId, setOrgId] = useState("");
  const [action, setAction] = useState<ActionType>("googleAds.createCampaign");
  const [campaignName, setCampaignName] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [targetLocation, setTargetLocation] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [adGroupId, setAdGroupId] = useState("");
  const [keywords, setKeywords] = useState("");
  const [updates, setUpdates] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isAuthorized = isSuperAdmin || orgAdminOrgs.length > 0;
  const availableOrgs = useMemo(() => {
    if (isSuperAdmin && orgIds.length === 0) return [];
    return orgIds.length ? orgIds : orgAdminOrgs;
  }, [isSuperAdmin, orgIds, orgAdminOrgs]);

  const validate = () => {
    if (!orgId) return "Org ID is required.";
    if (action === "googleAds.createCampaign") {
      if (!campaignName || !dailyBudget) return "Campaign name and budget are required.";
    }
    if (action === "googleAds.updateCampaign") {
      if (!campaignId || !updates) return "Campaign ID and updates are required.";
    }
    if (action === "googleAds.addKeywords") {
      if (!campaignId || !adGroupId || !keywords) return "Campaign ID, ad group ID, and keywords are required.";
    }
    if (action === "googleAds.pauseCampaign") {
      if (!campaignId) return "Campaign ID is required.";
    }
    return null;
  };

  const buildPayload = (): GoogleAdsActionPayload => {
    switch (action) {
      case "googleAds.createCampaign":
        return {
          action,
          payload: {
            campaignName,
            dailyBudget,
            targetLocation,
          },
        };
      case "googleAds.updateCampaign":
        return {
          action,
          payload: {
            campaignId,
            updates,
          },
        };
      case "googleAds.addKeywords":
        return {
          action,
          payload: {
            campaignId,
            adGroupId,
            keywords: keywords.split(",").map((k) => k.trim()).filter(Boolean),
          },
        };
      case "googleAds.pauseCampaign":
        return {
          action,
          payload: {
            campaignId,
          },
        };
      default:
        return { action, payload: {} };
    }
  };

  const handleSave = async () => {
    setError(null);
    setStatus(null);
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    try {
      await createApprovalDraft({ orgId, payload: buildPayload() });
      setStatus("Draft saved.");
      navigate("/admin/approvals");
    } catch (err) {
      console.error(err);
      setError("Failed to save draft.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!currentUser || !isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationWithNotifications />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-2">New Approval</h1>
          <p className="text-muted-foreground">Access denied.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationWithNotifications />
      <main className="container mx-auto px-4 py-8 space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">New Approval</h1>
            <p className="text-muted-foreground">
              Draft a regulated Google Ads change request.
            </p>
          </div>
          <Link to="/admin/approvals" className="text-sm text-primary">
            Back to approvals
          </Link>
        </div>

        <div className="border rounded-lg p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Org</label>
            {availableOrgs.length ? (
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
              >
                <option value="">Select org</option>
                {availableOrgs.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full border rounded px-3 py-2 bg-background"
                value={orgId}
                onChange={(e) => setOrgId(e.target.value)}
                placeholder="org_123"
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Action</label>
            <select
              className="w-full border rounded px-3 py-2 bg-background"
              value={action}
              onChange={(e) => setAction(e.target.value as ActionType)}
            >
              {actionOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {action === "googleAds.createCampaign" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Campaign Name</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Daily Budget</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Target Location</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                />
              </div>
            </div>
          )}

          {action === "googleAds.updateCampaign" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Campaign ID</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Update Summary</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={updates}
                  onChange={(e) => setUpdates(e.target.value)}
                  placeholder="Describe the changes"
                />
              </div>
            </div>
          )}

          {action === "googleAds.addKeywords" && (
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Campaign ID</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Ad Group ID</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={adGroupId}
                  onChange={(e) => setAdGroupId(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Keywords (comma separated)</label>
                <input
                  className="w-full border rounded px-3 py-2 bg-background"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
            </div>
          )}

          {action === "googleAds.pauseCampaign" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Campaign ID</label>
              <input
                className="w-full border rounded px-3 py-2 bg-background"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          {status && <p className="text-sm text-muted-foreground">{status}</p>}

          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded bg-primary text-primary-foreground"
              onClick={handleSave}
              disabled={saving}
            >
              Save Draft
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
