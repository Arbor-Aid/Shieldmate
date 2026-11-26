# Language Roles

Purpose: define which programming or scripting language should be used for each kind of ShieldMate work.

## Decisions

PowerShell:

- Windows and admin startup tasks.
- Local filesystem checks.
- Environment activation.
- Read-only repo status checks.
- Elevated tasks only when admin access is truly needed.

Python:

- Local automation.
- CSV and spreadsheet validation.
- File tools.
- Safe report generation.
- API check scripts after approval.
- Data cleanup and transformation.

TypeScript:

- Frontend and web app work.
- MCP client logic.
- Browser-facing application behavior.
- Shared web utility code.

C#:

- Only if Windows-native tooling, enterprise desktop tooling, or a .NET integration becomes necessary.
- Do not introduce C# just for routine scripting.

## Practical Rule

Choose the language that matches the ownership boundary:

- Windows shell and admin flow: PowerShell.
- Local data automation: Python.
- Web and app code: TypeScript.
- Windows-native enterprise app work: C# only when justified.

## Guardrails

- Do not use scripts to bypass human approval.
- Do not place secrets in source files.
- Do not commit machine-specific admin scripts if they contain private paths or local-only data.
- Prefer read-only validation commands until Joshua approves a change.
