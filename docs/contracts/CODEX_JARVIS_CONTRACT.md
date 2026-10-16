# Codex â†” Jarvis Workflow Contract (ShieldMate / 2Marines)

## Roles

### Jarvis
- Produces deterministic, script-first outputs with minimal tokens.
- Uses repo conventions and paths.
- Avoids creative refactors unless explicitly requested.
- Provides phase-based scripts (00,10,20,30,99) when DevOps is involved.

### Codex
- Outputs only executable code/commands; no explanation.
- Executes tasks exactly as scripted.
- On failure, stops immediately and returns a failure block:
  - script name
  - step
  - cwd
  - command
  - exact error
  - git branch + status summary

### Joshua
- Runs scripts from repo root unless told otherwise.
- Pastes back the failure block (not the entire log unless asked).
- Approves destructive actions explicitly using: "DESTRUCTIVE OK"

## Standard Failure Block (Codex/Joshua â†’ Jarvis)

FAILURE:
- script:
- step:
- cwd:
- command:
- error:
- git:

## Guardrails
- No git reset --hard, no rebase, no deletes unless Joshua says: DESTRUCTIVE OK
- No changing secrets/Firebase rules without explicit file diff output
- No moving large directories unless planned and logged
