# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-WinEvent -LogName System -MaxEvents 50 | Select-Object Id,LevelDisplayName,TimeCreated,Message | ConvertTo-Json -Depth 4
