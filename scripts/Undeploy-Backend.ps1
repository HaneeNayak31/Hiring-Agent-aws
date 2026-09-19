[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "hiring-agent-aws",
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

if (-not (Get-Command sam -ErrorAction SilentlyContinue)) { throw "AWS SAM CLI is required." }

Write-Host "Deleting backend SAM stack: $StackName..." -ForegroundColor Yellow
sam delete --stack-name $StackName --region $Region --no-prompts @awsArgs
if ($LASTEXITCODE -ne 0) { throw "Backend stack deletion failed." }

Write-Host "Backend undeployed successfully." -ForegroundColor Green
