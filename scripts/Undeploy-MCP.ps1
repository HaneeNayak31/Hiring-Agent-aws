[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "hiring-agent-mcp",
    [switch]$DeleteRepository,
    [string]$RepositoryName = "hiring-agent-mcp",
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { throw "AWS CLI is required." }

Write-Host "Deleting MCP App Runner stack: $StackName..." -ForegroundColor Yellow
aws cloudformation delete-stack --stack-name $StackName --region $Region @awsArgs
if ($LASTEXITCODE -ne 0) { throw "Failed to start MCP stack deletion." }

aws cloudformation wait stack-delete-complete --stack-name $StackName --region $Region @awsArgs
if ($LASTEXITCODE -ne 0) { throw "MCP stack deletion failed." }

if ($DeleteRepository) {
    Write-Host "Deleting MCP ECR repository: $RepositoryName..." -ForegroundColor Yellow
    aws ecr delete-repository --repository-name $RepositoryName --force --region $Region @awsArgs
    if ($LASTEXITCODE -ne 0) { throw "Failed to delete MCP ECR repository." }
}

Write-Host "MCP undeployed successfully." -ForegroundColor Green
