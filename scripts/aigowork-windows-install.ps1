# Run in an elevated PowerShell window on Windows 11 22H2 or newer.
$ErrorActionPreference = 'Stop'
$packagePath = Join-Path $PSScriptRoot 'AiGoWork-0.21.7-win-x64.msix'
$certificatePath = Join-Path $PSScriptRoot 'AiGoWork.cer'
Write-Host 'This installs the AiGoWork signing certificate into LocalMachine TrustedPeople.'
Write-Host 'Only continue if you trust the source of this installation package.'
$confirmation = Read-Host 'Type YES to trust the certificate and install AiGoWork'
if ($confirmation -cne 'YES') { exit 0 }
Import-Certificate -FilePath $certificatePath -CertStoreLocation 'Cert:\LocalMachine\TrustedPeople' | Out-Null
Add-AppxPackage -Path $packagePath
Write-Host 'AiGoWork installation completed.'
