[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$BackendStackName = "hiring-agent-aws",
    [string]$McpStackName = "hiring-agent-mcp",
    [ValidateSet("dev", "staging", "prod")]
    [string]$Environment = "dev",
    [string]$McpRepositoryName = "hiring-agent-mcp",
    [string]$Profile,
    [string]$FrontendBucketName
)

$ErrorActionPreference = "Stop"
$scriptRoot = $PSScriptRoot

& (Join-Path $scriptRoot "Deploy-Backend.ps1") `
    -Region $Region -StackName $BackendStackName -Environment $Environment -Profile $Profile

$backendOutputsPath = Join-Path (Split-Path -Parent $scriptRoot) "serverless_backend\deployment-outputs.json"
$backendOutputs = Get-Content $backendOutputsPath -Raw | ConvertFrom-Json
$apiBaseUrl = ($backendOutputs | Where-Object OutputKey -eq "RecruiterApiUrl").OutputValue
if ([string]::IsNullOrWhiteSpace($apiBaseUrl)) { throw "RecruiterApiUrl was not found in backend deployment outputs." }

& (Join-Path $scriptRoot "Deploy-MCP.ps1") `
    -Region $Region -StackName $McpStackName -RepositoryName $McpRepositoryName `
    -JobsTableName (($backendOutputs | Where-Object OutputKey -eq "JobsTableName").OutputValue) `
    -ApplicationsTableName (($backendOutputs | Where-Object OutputKey -eq "ApplicationsTableName").OutputValue) `
    -Profile $Profile

$frontendArgs = @{
    ApiBaseUrl = $apiBaseUrl
    Region = $Region
    Profile = $Profile
}
if ($FrontendBucketName) { $frontendArgs.FrontendBucketName = $FrontendBucketName }
& (Join-Path $scriptRoot "Deploy-Frontend.ps1") @frontendArgs

Write-Host "All platform components deployed successfully." -ForegroundColor Green
