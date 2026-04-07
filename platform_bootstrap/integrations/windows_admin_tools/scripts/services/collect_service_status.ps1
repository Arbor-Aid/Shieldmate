# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-Service | Select-Object Name,Status,StartType | ConvertTo-Json -Depth 3
