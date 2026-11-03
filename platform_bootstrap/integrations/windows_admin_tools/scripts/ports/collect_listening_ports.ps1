# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-NetTCPConnection -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess | ConvertTo-Json -Depth 3
