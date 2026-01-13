import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import NavigationWithNotifications from "@/components/NavigationWithNotifications";
import { useAuth } from "@/hooks/useAuth";
import { useClaimsAuth } from "@/hooks/useClaimsAuth";
import {
  approveApproval,
  fetchApprovals,
  recordExecutionAttempt,
  rejectApproval,
  requestGatewayExecution,
  submitApproval,
} from "@/services/approvalService";
import type { ApprovalDoc } from "@/services/approvalService";

const statusOptions = ["DRAFT", "PENDING", "APPROVED", "REJECTED", "EXECUTED"];
const typeOptions = ["GOOGLE_ADS_CHANGE"];

const formatDate = (value?: unknown) => {
  if (!value) return "—";
  const ts = value as { toDate?: () => Date };
  const date = ts?.toDate ? ts.toDate() : new Date(value as string);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

export default function AdminApprovals() {
  const { currentUser } = useAuth();
  const { claims, orgIds, orgAdminOrgs, isSuperAdmin, loading } = useClaimsAuth();
  const [selectedOrg, setSelectedOrg] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("GOOGLE_ADS_CHANGE");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [approvals, setApprovals] = useState<ApprovalDoc[]>([]);
  const [selected, setSelected] = useState<ApprovalDoc | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isAuthorized = isSuperAdmin || orgAdminOrgs.length > 0;

  const availableOrgs = useMemo(() => {
    if (isSuperAdmin && orgIds.length === 0) return [];
    return orgIds.length ? orgIds : orgAdminOrgs;
  }, [isSuperAdmin, orgIds, orgAdminOrgs]);

  useEffect(() => {
    if (!selectedOrg && availableOrgs.length) {
      setSelectedOrg(availableOrgs[0]);
    }
  }, [availableOrgs, selectedOrg]);

  const loadApprovals = async () => {
    if (!selectedOrg) return;
    setError(null);
    try {
      const items = await fetchApprovals({
        orgId: selectedOrg,
        status: (statusFilter || undefined) as any,
        type: (typeFilter || undefined) as any,
      });
      setApprovals(items);
    } catch (err) {
      console.error(err);
      setError("Failed to load approvals.");
    }
  };

  useEffect(() => {
    if (!selectedOrg) return;
    loadApprovals();
  }, [selectedOrg, statusFilter, typeFilter]);

  const filteredApprovals = useMemo(() => {
    if (!fromDate && !toDate) return approvals;
    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null;
    return approvals.filter((item) => {
      const raw = item.createdAt?.toDate ? item.createdAt.toDate() : null;
      if (!raw) return false;
      if (from && raw < from) return false;
      if (to && raw > to) return false;
      return true;
    });
  }, [approvals, fromDate, toDate]);

  const canAdminSelected =
    isSuperAdmin || (selectedOrg && orgAdminOrgs.includes(selectedOrg));

  const handleSubmit = async (approval: ApprovalDoc) => {
    setBusy(true);
    try {
      await submitApproval(approval.id, approval.orgId);
      await loadApprovals();
    } catch (err) {
      console.error(err);
      setError("Failed to submit approval.");
    } finally {
      setBusy(false);
    }
  };

  const handleApprove = async (approval: ApprovalDoc) => {
    setBusy(true);
    try {
      await approveApproval(approval.id, approval.orgId);
      await loadApprovals();
    } catch (err) {
      console.error(err);
      setError("Failed to approve request.");
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async (approval: ApprovalDoc) => {
    setBusy(true);
    try {
      await rejectApproval(approval.id, approval.orgId);
      await loadApprovals();
    } catch (err) {
      console.error(err);
      setError("Failed to reject request.");
    } finally {
      setBusy(false);
    }
  };

  const handleExecute = async (approval: ApprovalDoc) => {
    setBusy(true);
    setError(null);
    try {
      const response = await requestGatewayExecution({
        toolId: "mcp-google-ads",
        orgId: approval.orgId,
        input: {
          approvalId: approval.id,
          action: approval.payload.action,
          payload: approval.payload.payload,
        },
        meta: { regulated: true },
      });

      const message =
        response.data?.message ||
        response.data?.error ||
        response.raw ||
        "";
      const needsDeploy =
        response.status === 404 ||
        response.status === 502 ||
        (typeof message === "string" && message.includes("not implemented"));

      await recordExecutionAttempt({
        approvalId: approval.id,
        orgId: approval.orgId,
        success: response.ok,
        execution: {
          toolId: "mcp-google-ads",
          resultStatus: response.ok ? "REQUESTED" : "FAILED",
          errorMessage: response.ok ? undefined : message,
        },
      });

      if (!response.ok) {
        setError(
          needsDeploy
            ? "Execution service not deployed yet."
            : "Execution request failed."
        );
      }
      await loadApprovals();
    } catch (err) {
      console.error(err);
      setError("Execution request failed.");
    } finally {
      setBusy(false);
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
          <h1 className="text-2xl font-bold mb-2">Approvals</h1>
          <p className="text-muted-foreground">Access denied.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationWithNotifications />
      <main className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Approvals</h1>
            <p className="text-muted-foreground">
              Claims-only access. Re-login after role changes to refresh claims.
            </p>
          </div>
          <Link
            to="/admin/approvals/new"
            className="px-4 py-2 rounded bg-primary text-primary-foreground"
          >
            New Approval
          </Link>
        </div>

        <div className="border rounded-lg p-4 text-sm text-muted-foreground">
          <div>Claims (token):</div>
          <div>super_admin: {isSuperAdmin ? "yes" : "no"}</div>
          <div>org_admin orgs: {orgAdminOrgs.length ? orgAdminOrgs.join(", ") : "none"}</div>
        </div>

        <div className="grid gap-4 md:grid-cols-4 border rounded-lg p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Org</label>
            {availableOrgs.length ? (
              <select
                className="w-full border rounded px-3 py-2 bg-background"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
              >
                {availableOrgs.map((orgId) => (
                  <option key={orgId} value={orgId}>
                    {orgId}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="w-full border rounded px-3 py-2 bg-background"
                value={selectedOrg}
                onChange={(e) => setSelectedOrg(e.target.value)}
                placeholder="org_123"
              />
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              className="w-full border rounded px-3 py-2 bg-background"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <select
              className="w-full border rounded px-3 py-2 bg-background"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {typeOptions.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full border rounded px-2 py-2 bg-background"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
              <input
                type="date"
                className="w-full border rounded px-2 py-2 bg-background"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-destructive">{error}</div>}

        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-5 gap-2 px-4 py-2 text-sm font-medium bg-muted">
            <span>Created</span>
            <span>Action</span>
            <span>Status</span>
            <span>Requested By</span>
            <span>Org</span>
          </div>
          {filteredApprovals.length === 0 && (
            <div className="px-4 py-6 text-sm text-muted-foreground">
              No approvals found.
            </div>
          )}
          {filteredApprovals.map((item) => (
            <button
              key={item.id}
              className="grid grid-cols-5 gap-2 px-4 py-3 text-left border-t hover:bg-muted/50"
              onClick={() => setSelected(item)}
            >
              <span className="text-sm">{formatDate(item.createdAt)}</span>
              <span className="text-sm">{item.payload?.action ?? "—"}</span>
              <span className="text-sm">{item.status}</span>
              <span className="text-sm">{item.requestedBy}</span>
              <span className="text-sm">{item.orgId}</span>
            </button>
          ))}
        </div>

        {selected && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Approval Detail</h2>
              <span className="text-xs text-muted-foreground">{selected.id}</span>
            </div>
            <div className="grid gap-2 text-sm">
              <div>
                <span className="font-medium">Status:</span> {selected.status}
              </div>
              <div>
                <span className="font-medium">Action:</span>{" "}
                {selected.payload?.action ?? "—"}
              </div>
              <div>
                <span className="font-medium">Requested By:</span>{" "}
                {selected.requestedBy}
              </div>
              <div>
                <span className="font-medium">Approved By:</span>{" "}
                {selected.approvedBy ?? "—"}
              </div>
              <div>
                <span className="font-medium">Org:</span> {selected.orgId}
              </div>
              <div>
                <span className="font-medium">Created:</span>{" "}
                {formatDate(selected.createdAt)}
              </div>
            </div>
            <div className="bg-muted p-3 rounded text-xs overflow-auto">
              <pre>{JSON.stringify(selected.payload, null, 2)}</pre>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.status === "DRAFT" &&
                (selected.requestedBy === currentUser?.uid || canAdminSelected) && (
                <button
                  disabled={busy}
                  onClick={() => handleSubmit(selected)}
                  className="px-3 py-2 rounded bg-primary text-primary-foreground"
                >
                  Submit
                </button>
              )}
              {selected.status === "PENDING" && canAdminSelected && (
                <>
                  <button
                    disabled={busy}
                    onClick={() => handleApprove(selected)}
                    className="px-3 py-2 rounded bg-primary text-primary-foreground"
                  >
                    Approve
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => handleReject(selected)}
                    className="px-3 py-2 rounded border"
                  >
                    Reject
                  </button>
                </>
              )}
              {selected.status === "APPROVED" && canAdminSelected && (
                <button
                  disabled={busy}
                  onClick={() => handleExecute(selected)}
                  className="px-3 py-2 rounded bg-primary text-primary-foreground"
                >
                  Execute
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
