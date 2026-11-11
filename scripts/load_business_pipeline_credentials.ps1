[CmdletBinding()]
param(
    [switch]$IncludeSecondary
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

if ($MyInvocation.InvocationName -ne '.') {
    throw 'Dot-source this helper so credentials remain in the current PowerShell process.'
}

function Set-ProcessSecretFromPrompt {
    param(
        [Parameter(Mandatory)]
        [string]$Name
    )

    $secureValue = Read-Host -Prompt "Enter $Name" -AsSecureString
    if ($secureValue.Length -eq 0) {
        throw "$Name was not supplied; no credential state was changed for that variable."
    }

    $secretPointer = [IntPtr]::Zero
    $plainValue = $null
    try {
        $secretPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureValue)
        $plainValue = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($secretPointer)
        [Environment]::SetEnvironmentVariable(
            $Name,
            $plainValue,
            [EnvironmentVariableTarget]::Process
        )
    }
    finally {
        $plainValue = $null
        if ($secretPointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($secretPointer)
        }
    }
}

Set-ProcessSecretFromPrompt -Name 'SAM_API_KEY'
Set-ProcessSecretFromPrompt -Name 'CENSUS_API_KEY'
Set-ProcessSecretFromPrompt -Name 'COMTRADE_API_KEY'

if ($IncludeSecondary) {
    Set-ProcessSecretFromPrompt -Name 'COMTRADE_SECONDARY_API_KEY'
}

[pscustomobject]@{
    SAM_API_KEY                = [bool][Environment]::GetEnvironmentVariable('SAM_API_KEY', 'Process')
    CENSUS_API_KEY             = [bool][Environment]::GetEnvironmentVariable('CENSUS_API_KEY', 'Process')
    COMTRADE_API_KEY           = [bool][Environment]::GetEnvironmentVariable('COMTRADE_API_KEY', 'Process')
    COMTRADE_SECONDARY_API_KEY = [bool][Environment]::GetEnvironmentVariable('COMTRADE_SECONDARY_API_KEY', 'Process')
}
