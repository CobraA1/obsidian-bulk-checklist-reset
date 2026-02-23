$ErrorActionPreference = "Stop"

$vaultPath = "P:\WPDATA\Work Notes"
$pluginId = "obsidian-checklist-reset"
$pluginDir = Join-Path $vaultPath ".obsidian\plugins\$pluginId"

if (-not (Test-Path $vaultPath)) {
  throw "Vault path not found: $vaultPath"
}

if (-not (Test-Path "main.js")) {
  throw "Build output missing: main.js. Run 'npm run build' first."
}

if (-not (Test-Path "manifest.json")) {
  throw "Required file missing: manifest.json"
}

New-Item -ItemType Directory -Path $pluginDir -Force | Out-Null

Copy-Item "main.js" (Join-Path $pluginDir "main.js") -Force
Copy-Item "manifest.json" (Join-Path $pluginDir "manifest.json") -Force

if (Test-Path "styles.css") {
  Copy-Item "styles.css" (Join-Path $pluginDir "styles.css") -Force
}

Write-Host "Synced plugin files to: $pluginDir"
