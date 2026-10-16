# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-ScheduledTask | Select-Object TaskName,TaskPath,State | ConvertTo-Json -Depth 4
