[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "hiring-agent-aws",
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $repoRoot "serverless_backend"

if (-not (Get-Command sam -ErrorAction SilentlyContinue)) { throw "AWS SAM CLI is required." }
if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { throw "AWS CLI is required." }

$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

Push-Location $backendRoot
try {
    sam validate --lint --template-file template.yaml
    if ($LASTEXITCODE -ne 0) { throw "sam validate failed with exit code $LASTEXITCODE" }

    sam build --template-file template.yaml --cached --parallel
    if ($LASTEXITCODE -ne 0) { throw "sam build failed with exit code $LASTEXITCODE" }

    sam deploy `
        --template-file .aws-sam/build/template.yaml `
        --stack-name $StackName `
        --region $Region `
        --capabilities CAPABILITY_IAM `
        --resolve-s3 `
        --resolve-image-repos `
        --no-confirm-changeset `
        --no-fail-on-empty-changeset `
        --parameter-overrides "Environment=$Environment" `
        @awsArgs
    if ($LASTEXITCODE -ne 0) { throw "sam deploy failed with exit code $LASTEXITCODE" }
} finally {
    Pop-Location
}

$outputs = aws cloudformation describe-stacks @awsArgs --stack-name $StackName --region $Region |
    ConvertFrom-Json
$stackOutputs = @($outputs.Stacks[0].Outputs)

Write-Host ""
Write-Host "Backend deployed successfully." -ForegroundColor Green
$stackOutputs | ForEach-Object { Write-Host ("{0}: {1}" -f $_.OutputKey, $_.OutputValue) }
$stackOutputs | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $backendRoot "deployment-outputs.json") -Encoding UTF8
Write-Host "Saved outputs to serverless_backend/deployment-outputs.json"
