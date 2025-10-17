param(
    [switch]$WhatIf
)

# idempotent mover: moves frontend files into ./frontend while preserving backend folder
# Run from repository root: powershell -ExecutionPolicy Bypass -File scripts/move-frontend.ps1

Function Ensure-Dir {
    param([string]$Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

$scriptDir = $PSScriptRoot
# repo root is parent of the scripts directory
$repoRoot = Split-Path -Parent $scriptDir
Set-Location $repoRoot

$frontendRoot = Join-Path $repoRoot 'frontend'
Ensure-Dir -Path $frontendRoot

# Define top-level frontend items to move
$itemsToMove = @(
    'src',
    'public',
    'index.html',
    'vite.config.ts',
    'tsconfig.app.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'postcss.config.js',
    'tailwind.config.ts',
    'env.example',
    'package.json',
    'bun.lockb',
    'README.md'
)

Write-Host "Preparing to move frontend items into: $frontendRoot"

foreach ($item in $itemsToMove) {
    $src = Join-Path $repoRoot $item
    if (-not (Test-Path $src)) {
        Write-Host "Skipping missing: $item"
        continue
    }

    $dest = Join-Path $frontendRoot $item

    # If destination already exists, skip to keep idempotency
    if (Test-Path $dest) {
        Write-Host "Destination exists, skipping: $item"
        continue
    }

    if ($WhatIf) {
        Write-Host "Would move: $src -> $dest"
    } else {
        Write-Host "Moving: $src -> $dest"
        try {
            Move-Item -Path $src -Destination $dest -Force
        } catch {
            # Use format operator to avoid interpolation parsing issues with automatic variable $_
            Write-Error ("Failed to move {0}: {1}" -f $item, $_)
        }
    }
}

Write-Host "Move script finished. Review changes and run your tests/build."
