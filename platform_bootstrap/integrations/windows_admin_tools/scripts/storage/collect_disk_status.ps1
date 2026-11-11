# Auto-generated bootstrap collection script template.
        # Adjust as needed for local policy and least privilege.

        Get-Volume | Select-Object DriveLetter,FileSystemLabel,SizeRemaining,Size | ConvertTo-Json -Depth 3
