# ShieldMate project instructions

Repository authority, execution gates, human approvals, privacy restrictions, and system-of-record rules documented in this repository take precedence over tool-specific guidance below. Do not treat configuration, a send attempt, or an MCP response as execution, receipt, or acceptance.

<!-- AWS_AGENT_TOOLKIT_RULES_START source=https://raw.githubusercontent.com/aws/agent-toolkit-for-aws/refs/heads/main/rules/aws-starter-rules.md etag=8813b5ed8b33fe589c994887580ffb84f86c516872926fdfedeb410d204d03bd -->

# AWS Guidance for the new AWS experience

This user has signed up for the new AWS experience. This experience lets you sign into AWS using a social provider and requires the following additional context.

Where this guidance conflicts with the project's own instructions, the project's instructions take precedence.

## Context

### Terminology

- Say "project" instead of "account" — a project contains an AWS account and settings for sharing with other collaborators.
- Say "team member" instead of "IAM user" — users are invited by email, not created or federated in IAM.
- Say "AWS Settings" when referring to management tasks at [settings.aws.com](https://settings.aws.com/) (project management, billing, team members, spend limits). Users view their actual AWS resources in the AWS Management Console.
- Say "selected Region" when referring to the user's Region — not "home Region".
- The user has a managed IAM experience. This includes managed service control policies (SCPs) and resource control policies (RCPs). Service-to-service policies are still required. See [SCPs and RCPs for projects](https://docs.aws.amazon.com/accounts/latest/reference/scps-and-rcps-for-projects.html).

### Constraints

- The selected project Region is `us-east-2`. Create Regional application resources only in that Region.
- The Agent Toolkit installer and catalog verification use `us-east-1` as required by its setup guide; that exception does not authorize application workloads there.
- AWS WAF and CloudWatch Logs resources may be created in `us-east-1` only when global resources require them. Inventory must check both Regions for such resources.
- Confirm the selected Region in AWS Settings > View all projects > Overview > Additional Info > Region. If it cannot be confirmed there, check the named profile in `~/.aws/config`.
- Do not create Lambda, API Gateway, or other Regional application resources outside `us-east-2`.
- Do not use Lambda@Edge, CloudFormation StackSets, cross-Region actions or replication, multi-Region KMS keys, or Route 53 cross-Region routing.
- CloudFront is global and its control-plane actions are allowed in `us-east-1`; its Regional origins must remain in `us-east-2`.
- IAM permissions for human access are managed by AWS. Do not assign roles to team members unless absolutely necessary.
- If resources that previously worked suddenly return `Access Denied`, ask whether a spend limit is configured and direct the project owner to AWS Settings > Billing.
- Before provisioning, confirm whether the project is on the free or paid plan and whether a spend limit is active. Project owners manage spend limits in AWS Settings; budgets are managed in AWS Billing and Cost Management.
- After successful resource creation, ask whether the user wants to keep or clean up resources to control cost.
- If a service is unavailable, run `aws freetier get-account-plan-state`, then check the official supported-services list for that plan and the unsupported-services list. Advanced features may be required.
- For AWS implementation work, use the installed Agent Toolkit documentation search and retrieve the matching current skill before relying on general knowledge.
- Do not deploy live Shopify automation or application resources during the AWS connector setup phase.

### Help level

- `help_level: HIGH`
- Explain each step and why before executing it, suggest better alternatives when applicable, flag security and cost practices, and preserve the user's final choice.

<!-- AWS_AGENT_TOOLKIT_RULES_END -->
