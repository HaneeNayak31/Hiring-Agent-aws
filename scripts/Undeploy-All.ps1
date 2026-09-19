[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$BackendStackName = "hiring-agent-aws",
    [string]$McpStackName = "hiring-agent-mcp",
    [string]$FrontendBucketName = "hiring-agent-frontend-178707646433-ap-south-1",
    [string]$AssessmentsBucketName = "hiring-agent-assessments-178707646433-ap-south-1",
    [string]$McpRepositoryName = "hiring-agent-mcp",
    [switch]$DeleteMcpRepository,
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot
$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

& (Join-Path $scriptRoot "Undeploy-MCP.ps1") `
    -Region $Region -StackName $McpStackName -RepositoryName $McpRepositoryName `
    -DeleteRepository:$DeleteMcpRepository -Profile $Profile

Write-Host "Deleting frontend bucket: $FrontendBucketName..." -ForegroundColor Yellow
aws s3 rb "s3://$FrontendBucketName" --force --region $Region @awsArgs
if ($LASTEXITCODE -ne 0) { throw "Frontend bucket deletion failed." }

Write-Host "Emptying assessments bucket: $AssessmentsBucketName..." -ForegroundColor Yellow
aws s3 rm "s3://$AssessmentsBucketName" --recursive --region $Region @awsArgs
if ($LASTEXITCODE -ne 0) { throw "Assessments bucket cleanup failed." }

& (Join-Path $scriptRoot "Undeploy-Backend.ps1") `
    -Region $Region -StackName $BackendStackName -Profile $Profile

Write-Host "All platform components undeployed successfully." -ForegroundColor Green
