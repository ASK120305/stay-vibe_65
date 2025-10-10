# StayVibe Test Runner Script (PowerShell)
# This script runs all tests for both frontend and backend

param(
    [switch]$SkipInstall
)

# Colors for output
$Red = "`e[31m"
$Green = "`e[32m"
$Yellow = "`e[33m"
$Reset = "`e[0m"

function Write-Status {
    param($Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param($Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param($Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

Write-Host "Running StayVibe Test Suite" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Error "Please run this script from the project root directory"
    exit 1
}

if (-not $SkipInstall) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm ci
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

Write-Host ""
Write-Host "Running Frontend Tests..." -ForegroundColor Cyan
Write-Host "----------------------------" -ForegroundColor Cyan

# Frontend linting
Write-Host "Running ESLint..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend linting passed"
} else {
    Write-Error "Frontend linting failed"
    exit 1
}

# Frontend TypeScript check
Write-Host "Running TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -eq 0) {
    Write-Status "TypeScript check passed"
} else {
    Write-Error "TypeScript check failed"
    exit 1
}

# Frontend tests
Write-Host "Running frontend tests..." -ForegroundColor Yellow
npm run test:run
if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend tests passed"
} else {
    Write-Error "Frontend tests failed"
    exit 1
}

# Frontend build
Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Status "Frontend build successful"
} else {
    Write-Error "Frontend build failed"
    exit 1
}

Write-Host ""
Write-Host "Running Backend Tests..." -ForegroundColor Cyan
Write-Host "---------------------------" -ForegroundColor Cyan

# Backend linting
Write-Host "Running backend ESLint..." -ForegroundColor Yellow
Set-Location backend
npm run lint
if ($LASTEXITCODE -eq 0) {
    Write-Status "Backend linting passed"
} else {
    Write-Error "Backend linting failed"
    Set-Location ..
    exit 1
}

# Backend tests
Write-Host "Running backend tests..." -ForegroundColor Yellow
npm run test:coverage
if ($LASTEXITCODE -eq 0) {
    Write-Status "Backend tests passed"
} else {
    Write-Error "Backend tests failed"
    Set-Location ..
    exit 1
}

Set-Location ..

Write-Host ""
Write-Host "All tests passed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Status "Frontend: Linting ✅ | TypeScript ✅ | Tests ✅ | Build ✅"
Write-Status "Backend: Linting ✅ | Tests ✅ | Coverage ✅"
Write-Host ""
Write-Host "Ready for deployment!" -ForegroundColor Cyan
