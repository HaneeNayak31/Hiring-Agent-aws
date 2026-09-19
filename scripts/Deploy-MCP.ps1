[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "hiring-agent-mcp",
    [string]$RepositoryName = "hiring-agent-mcp",
    [string]$ImageTag = "",
    [string]$JobsTableName = "HiringAgent_Jobs",
    [string]$ApplicationsTableName = "HiringAgent_Applications",
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$mcpRoot = Join-Path $repoRoot "MCP"
$templatePath = Join-Path $repoRoot "serverless_backend\mcp-app-runner.yaml"

foreach ($command in @("aws", "docker")) {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        throw "$command is required."
    }
}

if ([string]::IsNullOrWhiteSpace($ImageTag)) {
    $ImageTag = Get-Date -Format "yyyyMMdd-HHmmss"
}

$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

$accountId = (aws sts get-caller-identity @awsArgs --query Account --output text).Trim()
$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"
$repositoryUri = "$registry/$RepositoryName"
$imageUri = "$repositoryUri`:$ImageTag"

Write-Host "Deploying MCP image: $imageUri" -ForegroundColor Cyan

$null = aws ecr describe-repositories --repository-names $RepositoryName --region $Region @awsArgs 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Creating ECR repository: $RepositoryName"
    aws ecr create-repository --repository-name $RepositoryName --region $Region @awsArgs | Out-Null
}

aws ecr get-login-password --region $Region @awsArgs |
    docker login --username AWS --password-stdin $registry
if ($LASTEXITCODE -ne 0) { throw "ECR login failed." }

Push-Location $mcpRoot
try {
    docker build -t "$RepositoryName`:$ImageTag" .
    if ($LASTEXITCODE -ne 0) { throw "MCP Docker build failed." }

    docker tag "$RepositoryName`:$ImageTag" $imageUri
    docker push $imageUri
    if ($LASTEXITCODE -ne 0) { throw "MCP Docker push failed." }
} finally {
    Pop-Location
}

aws cloudformation deploy `
    --template-file $templatePath `
    --stack-name $StackName `
    --region $Region `
    --capabilities CAPABILITY_NAMED_IAM `
    --parameter-overrides "ImageUri=$imageUri" "JobsTableName=$JobsTableName" "ApplicationsTableName=$ApplicationsTableName" `
    --no-fail-on-empty-changeset `
    @awsArgs
if ($LASTEXITCODE -ne 0) { throw "MCP CloudFormation deployment failed." }

$outputs = aws cloudformation describe-stacks @awsArgs --stack-name $StackName --region $Region |
    ConvertFrom-Json
$stackOutputs = @($outputs.Stacks[0].Outputs)
$stackOutputs | ConvertTo-Json -Depth 5 | Set-Content -Path (Join-Path $mcpRoot "deployment-outputs.json") -Encoding UTF8

Write-Host ""
Write-Host "MCP deployed successfully." -ForegroundColor Green
$stackOutputs | ForEach-Object { Write-Host ("{0}: {1}" -f $_.OutputKey, $_.OutputValue) }
