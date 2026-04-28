#!/usr/bin/env pwsh
# deploy.ps1 — ResQ Google Cloud Run Deployment Script
# Run this once to set up Secret Manager secrets, then use Cloud Build for future deploys
#
# Prerequisites:
#   1. gcloud CLI installed (https://cloud.google.com/sdk/docs/install)
#   2. Logged in: gcloud auth login
#   3. Project set: gcloud config set project YOUR_PROJECT_ID

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

Write-Host "=== ResQ Cloud Run Deployment ===" -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor Yellow

# Load .env.local
$envFile = Join-Path $PSScriptRoot ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Error ".env.local not found. Run from the project root."
    exit 1
}

$envVars = @{}
Get-Content $envFile | Where-Object { $_ -match "^[^#].+=." } | ForEach-Object {
    $parts = $_ -split "=", 2
    $key = $parts[0].Trim()
    $value = $parts[1].Trim().Trim('"')
    $envVars[$key] = $value
}

Write-Host "`n[1/4] Enabling required Google Cloud APIs..." -ForegroundColor Green
gcloud services enable `
    run.googleapis.com `
    cloudbuild.googleapis.com `
    secretmanager.googleapis.com `
    containerregistry.googleapis.com `
    --project=$ProjectId

# Secret keys that should go into Secret Manager (private/sensitive)
$secretKeys = @(
    "FIREBASE_ADMIN_PRIVATE_KEY",
    "FIREBASE_ADMIN_CLIENT_EMAIL",
    "GOOGLE_GEMINI_API_KEY",
    "GOOGLE_CLOUD_CLIENT_EMAIL",
    "GOOGLE_CLOUD_PRIVATE_KEY",
    "GOOGLE_CLOUD_VISION_KEY",
    "GOOGLE_CLOUD_TTS_KEY",
    "GOOGLE_CLOUD_STT_KEY",
    "GOOGLE_CLOUD_TRANSLATE_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_NUMBER",
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD"
)

Write-Host "`n[2/4] Creating/updating Secret Manager secrets..." -ForegroundColor Green
foreach ($key in $secretKeys) {
    if (-not $envVars.ContainsKey($key)) {
        Write-Warning "  SKIP: $key not found in .env.local"
        continue
    }
    $value = $envVars[$key]
    
    # Check if secret exists
    $exists = gcloud secrets describe $key --project=$ProjectId 2>$null
    if ($LASTEXITCODE -eq 0) {
        # Update existing secret
        Write-Host "  UPDATE: $key" -ForegroundColor DarkYellow
        $value | gcloud secrets versions add $key --data-file=- --project=$ProjectId
    } else {
        # Create new secret
        Write-Host "  CREATE: $key" -ForegroundColor Green
        $value | gcloud secrets create $key --data-file=- --replication-policy=automatic --project=$ProjectId
    }
}

Write-Host "`n[3/4] Granting Cloud Run + Cloud Build access to secrets..." -ForegroundColor Green
# Get project number
$projectNumber = gcloud projects describe $ProjectId --format="value(projectNumber)"
$cloudRunSA = "$projectNumber-compute@developer.gserviceaccount.com"
$cloudBuildSA = "$projectNumber@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$cloudRunSA" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$cloudBuildSA" `
    --role="roles/secretmanager.secretAccessor" `
    --quiet

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$cloudBuildSA" `
    --role="roles/run.admin" `
    --quiet

gcloud projects add-iam-policy-binding $ProjectId `
    --member="serviceAccount:$cloudBuildSA" `
    --role="roles/iam.serviceAccountUser" `
    --quiet

Write-Host "`n[4/4] Triggering Cloud Build deployment..." -ForegroundColor Green

# Build NEXT_PUBLIC_ substitutions for Cloud Build
$substitutions = "_PROJECT_ID=$ProjectId"
$nextPublicKeys = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
    "NEXT_PUBLIC_FIREBASE_APP_ID",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID",
    "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    "NEXT_PUBLIC_FIREBASE_VAPID_KEY"
)

# For NEXT_PUBLIC_ vars: bake them into the Docker image at build time
# Update NEXT_PUBLIC_APP_URL to the Cloud Run URL
$appUrl = "https://resq-$projectNumber.asia-south1.run.app"
Write-Host "  App URL will be: $appUrl" -ForegroundColor Cyan

gcloud builds submit . `
    --config=cloudbuild.yaml `
    --project=$ProjectId `
    --substitutions="_APP_URL=$appUrl"

Write-Host "`n=== Deployment Complete! ===" -ForegroundColor Cyan
Write-Host "Your app should be live at: https://resq-$projectNumber.asia-south1.run.app" -ForegroundColor Green
Write-Host "Check status: gcloud run services describe resq --region=asia-south1 --project=$ProjectId" -ForegroundColor DarkGray
