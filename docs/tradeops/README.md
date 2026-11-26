# TradeOps + Trade Finance (LC) + Treasury + Investing (Mode B)

## Workflows (placeholder-safe)
### Import/Export (TradeOps)
1) /shipment/triage -> identify missing docs + nextAction
2) /shipment/docs/generate -> templates (storagePath placeholders)
3) /shipment/screening/denied-party -> STUB (TODO provider)
4) /shipment/audit/packet -> audit packet record (TODO: assemble Storage docs)

### Letter of Credit (LC)
- /lc/parse -> normalize terms
- /lc/create-checklist -> requirements (supports usance/deferred)
- /lc/doc-validate -> discrepancy detection (placeholder)
- /lc/presentment-pack -> approval-gated (Joshua/Luis/admin)
- /lc/status -> TODO aggregate events

### Treasury allocation + Investing Mode B
- /profit/classify -> default split investing/ops/reserve (configurable per org)
- /risk/check -> validates proposed order vs policy; AI can recommend but cannot execute without checks + approvals
- /risk/kill-switch -> pause/resume trading (approval-gated)
- /risk/drawdown/check -> enforce stop (placeholder)
- /report/monthly -> TODO aggregate

## Gating rules
- Every POST endpoint requires Firebase ID token.
- orgId in payload must match token custom claim orgId.
- Approvals require approver role (Joshua/Luis/admin).
- Record retention default: 5 years (retentionUntil).

## Day 1 assumptions / TODO integrations
- Customs broker used day 1.
- TODO: Denied party screening provider
- TODO: ACE/AES workflows
- TODO: Market data feeds + analytics
- TODO: Broker connector for execution
