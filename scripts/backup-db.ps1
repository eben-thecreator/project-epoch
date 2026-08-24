# Nightly-able Postgres backup for project_epoch.
# Usage: npm run backup   (or: powershell -File scripts/backup-db.ps1 [-OutDir <path>])
param(
    [string]$OutDir = (Join-Path $PSScriptRoot ".." | Join-Path -ChildPath "backups")
)

$ErrorActionPreference = "Stop"

$envFile = Join-Path $PSScriptRoot ".." | Join-Path -ChildPath ".env"
if (-not (Test-Path -LiteralPath $envFile)) {
    Write-Error ".env not found at $envFile"
    exit 1
}

$databaseUrl = $null
Get-Content -LiteralPath $envFile | ForEach-Object {
    if ($_ -match '^\s*DATABASE_URL\s*=\s*(.+?)\s*$') {
        $databaseUrl = $Matches[1]
    }
}
if (-not $databaseUrl) {
    Write-Error "DATABASE_URL not found in .env"
    exit 1
}

$uri = [Uri]$databaseUrl
$dbName = $uri.AbsolutePath.TrimStart("/")
$stamp = Get-Date -Format "yyyyMMdd_HHmmss"
$outFile = Join-Path $OutDir "${dbName}_${stamp}.dump"

if (-not (Test-Path -LiteralPath $OutDir)) {
    New-Item -ItemType Directory -Path $OutDir -Force | Out-Null
}

$pgDump = (Get-Command pg_dump -ErrorAction SilentlyContinue).Source
if (-not $pgDump) {
    $candidates = Get-ChildItem "C:\Program Files\PostgreSQL" -Directory -ErrorAction SilentlyContinue |
        Sort-Object Name -Descending |
        ForEach-Object { Join-Path $_.FullName "bin\pg_dump.exe" }
    $pgDump = $candidates | Where-Object { Test-Path -LiteralPath $_ } | Select-Object -First 1
}
if (-not $pgDump) {
    Write-Error "pg_dump not found. Install PostgreSQL client tools or add them to PATH."
    exit 1
}

Write-Host "Backing up database '$dbName' -> $outFile"
& $pgDump --dbname=$databaseUrl --format=custom --file=$outFile

if ($LASTEXITCODE -ne 0) {
    Write-Error "pg_dump failed with exit code $LASTEXITCODE"
    exit 1
}

$sizeMb = [Math]::Round((Get-Item -LiteralPath $outFile).Length / 1MB, 2)
Write-Host "Backup complete ($sizeMb MB)."

$cutoff = (Get-Date).AddDays(-30)
Get-ChildItem -LiteralPath $OutDir -Filter "*.dump" |
    Where-Object { $_.LastWriteTime -lt $cutoff } |
    ForEach-Object {
        Write-Host "Pruning old backup: $($_.Name)"
        Remove-Item -LiteralPath $_.FullName
    }
