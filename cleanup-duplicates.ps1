# Find duplicate files by hash and prompt to delete duplicates

$root = "C:\Users\Macs Bot\.vscode\Shieldmate"
$files = Get-ChildItem -Path $root -Recurse -File
$hashTable = @{}

foreach ($file in $files) {
    $hash = Get-FileHash $file.FullName -Algorithm SHA256
    if ($hashTable.ContainsKey($hash.Hash)) {
        $hashTable[$hash.Hash] += ,$file.FullName
    } else {
        $hashTable[$hash.Hash] = @($file.FullName)
    }
}

foreach ($entry in $hashTable.GetEnumerator()) {
    if ($entry.Value.Count -gt 1) {
        Write-Host "Duplicate files found:"
        $entry.Value | ForEach-Object { Write-Host " - $_" }
        # Uncomment the next lines to automatically remove duplicates (keep the first)
        # $entry.Value[1..($entry.Value.Count-1)] | ForEach-Object {
        #     Remove-Item $_ -WhatIf
        # }
        Write-Host ""
    }
}

Write-Host "Scan complete. To delete duplicates, remove '-WhatIf' from Remove-Item and uncomment those lines."

cd "C:\Users\Macs Bot\.vscode\Shieldmate"
.\cleanup-duplicates.ps1