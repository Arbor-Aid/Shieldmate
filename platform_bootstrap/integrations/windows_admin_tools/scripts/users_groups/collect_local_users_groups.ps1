# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-LocalUser | Select-Object Name,Enabled,LastLogon | ConvertTo-Json -Depth 3
