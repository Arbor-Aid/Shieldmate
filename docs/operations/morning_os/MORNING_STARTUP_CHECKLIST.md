# Morning Startup Checklist

Purpose: start each ShieldMate workday with the right tools open, the repo state understood, and the task scope confirmed before launch work begins.

This checklist is documentation-only. It does not authorize deployment, posting, scheduling, ad spend, API mutation, or launch activity.

## Daily Startup

- [ ] Confirm today's task scope with Joshua or the active Codex request.
- [ ] Open VS Code at `D:\2marines\Shieldmate`.
- [ ] Open a normal PowerShell or VS Code terminal for repo work.
- [ ] Open elevated PowerShell only when admin tasks are needed.
- [ ] Activate the local Python environment:

```powershell
cd D:\2marines\Shieldmate
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
python --version
python -m pip --version
```

- [ ] Confirm the current branch:

```powershell
git branch --show-current
```

- [ ] Confirm the local working tree:

```powershell
git status --short
```

- [ ] Confirm no accidental untracked generated files are present.
- [ ] Confirm GitHub is open to the correct repo and branch.
- [ ] Confirm Firebase Console browser tabs are open only when needed.
- [ ] Confirm Canva and Meta Business Suite scope if marketing work is active.
- [ ] Confirm Codex has the current repo path, branch, and task boundaries.
- [ ] Run MCP gateway health and protected-route checks only when ready and approved.

## thebot Windows Admin Script Verification

Morning verification item: confirm `thebot` has the Windows admin Python script available.

Script path placeholder:

```text
PATH_TBD_WINDOWS_ADMIN_PYTHON_SCRIPT
```

Checklist:

- [ ] Confirm the file exists.
- [ ] Confirm the script purpose is documented.
- [ ] Confirm the script is not committed if it contains machine-specific or private data.
- [ ] Confirm it can be run from elevated PowerShell only when needed.
- [ ] Do not invent or record the real path until Joshua confirms it.

## Before Launch Work

- [ ] Confirm the source-of-truth doc for the current workstream.
- [ ] Confirm no secrets, tokens, private emails, billing data, or credentials are being pasted into docs.
- [ ] Confirm any browser tab used for account work is the correct account.
- [ ] Confirm screenshots contain no sensitive data before saving or sharing.
- [ ] Confirm all commands are read-only unless Joshua explicitly approves an action.
