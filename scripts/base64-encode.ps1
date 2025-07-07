# scripts/base64-encode.ps1
# Usage: ./scripts/base64-encode.ps1 <giatri>

param(
    [Parameter(Mandatory=$true)]
    [string]$Value
)

$bytes = [System.Text.Encoding]::UTF8.GetBytes($Value)
$encoded = [Convert]::ToBase64String($bytes)
Write-Output $encoded 