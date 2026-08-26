param(
    [switch]$Elevated
)

$ErrorActionPreference = "Stop"

$ManifestUrl = "https://soroushneyestani.github.io/Braille-Hub/install/manifest.xml"
$ExpectedProductionBase = "https://soroushneyestani.github.io/Braille-Hub/"
$ExpectedAddinId = "33ec7928-1204-5bb3-88e6-d778413e9234"

$CatalogRoot = Join-Path $env:LOCALAPPDATA "Braille-Hub"
$CatalogDirectory = Join-Path $CatalogRoot "OfficeAddinCatalog"
$ManifestPath = Join-Path $CatalogDirectory "manifest.xml"

$ShareName = "PersianToBrailleAddin"
$CatalogGuid = "{4F7294C2-8D04-4C1C-97A5-86D9E59D9C31}"
$TrustedCatalogsRoot = "HKCU:\Software\Microsoft\Office\16.0\WEF\TrustedCatalogs"
$TrustedCatalogKey = Join-Path $TrustedCatalogsRoot $CatalogGuid

function Test-IsAdministrator {
    $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($identity)
    return $principal.IsInRole(
        [Security.Principal.WindowsBuiltInRole]::Administrator
    )
}

function Stop-WithError {
    param([string]$Message)

    Write-Host ""
    Write-Host "ERROR: $Message" -ForegroundColor Red
    Write-Host ""
    exit 1
}

if ($env:OS -ne "Windows_NT") {
    Stop-WithError "This preview installer supports Windows only."
}

if (-not (Test-IsAdministrator)) {
    Write-Host "Administrator permission is required to create the local SMB share."
    Write-Host "Windows will now show a UAC prompt."

    try {
        $arguments = @(
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            ('"{0}"' -f $PSCommandPath),
            "-Elevated"
        )

        $process = Start-Process `
            -FilePath "powershell.exe" `
            -ArgumentList $arguments `
            -Verb RunAs `
            -Wait `
            -PassThru

        exit $process.ExitCode
    }
    catch {
        Stop-WithError "Elevation was cancelled or failed."
    }
}

Write-Host ""
Write-Host "Braille Hub Windows Desktop Preview Setup"
Write-Host "------------------------------------------------"
Write-Host "Classification: Windows sideload/testing preview"
Write-Host "Marketplace publication: NO"
Write-Host ""

$runningOffice = @(
    Get-Process -Name "WINWORD" -ErrorAction SilentlyContinue
    Get-Process -Name "EXCEL" -ErrorAction SilentlyContinue
    Get-Process -Name "POWERPNT" -ErrorAction SilentlyContinue
) | Where-Object { $_ -ne $null }

if ($runningOffice.Count -gt 0) {
    Write-Host "One or more Office applications are currently running."
    Write-Host "Save your work and close Word, Excel, and PowerPoint."
    [void](Read-Host "Press ENTER after Office is closed")

    $stillRunning = @(
        Get-Process -Name "WINWORD" -ErrorAction SilentlyContinue
        Get-Process -Name "EXCEL" -ErrorAction SilentlyContinue
        Get-Process -Name "POWERPNT" -ErrorAction SilentlyContinue
    ) | Where-Object { $_ -ne $null }

    if ($stillRunning.Count -gt 0) {
        Stop-WithError "Office applications are still running."
    }
}

Write-Host "[1/6] Preparing local catalog directory..."
New-Item -ItemType Directory -Path $CatalogDirectory -Force | Out-Null

Write-Host "[2/6] Downloading production manifest..."
$ProgressPreference = "SilentlyContinue"
Invoke-WebRequest `
    -UseBasicParsing `
    -Uri $ManifestUrl `
    -OutFile $ManifestPath

$manifest = Get-Content -LiteralPath $ManifestPath -Raw

$ForbiddenDevHost = "local" + "host"

if ($manifest -match $ForbiddenDevHost) {
    Stop-WithError "Downloaded manifest contains a local development host."
}

if (-not $manifest.Contains($ExpectedProductionBase)) {
    Stop-WithError "Downloaded manifest does not reference the production site."
}

if (-not $manifest.Contains($ExpectedAddinId)) {
    Stop-WithError "Downloaded manifest has an unexpected add-in ID."
}

Write-Host "[3/6] Creating local Windows network-share catalog..."
$existingShare = Get-SmbShare -Name $ShareName -ErrorAction SilentlyContinue

if ($existingShare) {
    $existingPath = [IO.Path]::GetFullPath($existingShare.Path)
    $targetPath = [IO.Path]::GetFullPath($CatalogDirectory)

    if ($existingPath -ne $targetPath) {
        Remove-SmbShare -Name $ShareName -Force
        $existingShare = $null
    }
}

if (-not $existingShare) {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().Name

    New-SmbShare `
        -Name $ShareName `
        -Path $CatalogDirectory `
        -FullAccess $currentIdentity | Out-Null
}

$CatalogUrl = "\\$env:COMPUTERNAME\$ShareName"

if (-not (Test-Path -LiteralPath $CatalogUrl)) {
    Stop-WithError "The local network-share catalog could not be opened."
}

Write-Host "[4/6] Registering the trusted Office add-in catalog..."
New-Item -Path $TrustedCatalogsRoot -Force | Out-Null
New-Item -Path $TrustedCatalogKey -Force | Out-Null

New-ItemProperty `
    -Path $TrustedCatalogKey `
    -Name "Id" `
    -Value $CatalogGuid `
    -PropertyType String `
    -Force | Out-Null

New-ItemProperty `
    -Path $TrustedCatalogKey `
    -Name "Url" `
    -Value $CatalogUrl `
    -PropertyType String `
    -Force | Out-Null

New-ItemProperty `
    -Path $TrustedCatalogKey `
    -Name "Flags" `
    -Value 1 `
    -PropertyType DWord `
    -Force | Out-Null

Write-Host "[5/6] Verifying catalog registration..."
$registeredUrl = (
    Get-ItemProperty -Path $TrustedCatalogKey -Name "Url"
).Url

$registeredFlags = (
    Get-ItemProperty -Path $TrustedCatalogKey -Name "Flags"
).Flags

if ($registeredUrl -ne $CatalogUrl) {
    Stop-WithError "Trusted catalog URL verification failed."
}

if ($registeredFlags -ne 1) {
    Stop-WithError "Trusted catalog Show-in-Menu flag verification failed."
}

Write-Host "[6/6] Setup complete."
Write-Host ""
Write-Host "Catalog:"
Write-Host "  $CatalogUrl"
Write-Host ""
Write-Host "Final Office step:"
Write-Host "  1. Open Word, Excel, or PowerPoint."
Write-Host "  2. Choose Home > Add-ins."
Write-Host "  3. Choose Get Add-ins or Advanced."
Write-Host "  4. Open SHARED FOLDER."
Write-Host "  5. Select Braille Hub."
Write-Host "  6. Choose Add."
Write-Host ""
Write-Host "This remains a Windows sideload/testing preview."
Write-Host "It is not Microsoft Marketplace publication."
Write-Host ""

try {
    Start-Process "winword.exe" | Out-Null
    Write-Host "Word was opened for the final add-in step."
}
catch {
    Write-Host "Open Word, Excel, or PowerPoint manually to finish."
}

exit 0
