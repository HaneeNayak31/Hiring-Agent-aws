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
$templatePath = Join-Path $repoRoot "serverless_backend\mcp-ecs.yaml"

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

$vpcId = (aws ec2 describe-vpcs --filters Name=is-default,Values=true Name=state,Values=available --region $Region @awsArgs --query "Vpcs[0].VpcId" --output text).Trim()
if ([string]::IsNullOrWhiteSpace($vpcId) -or $vpcId -eq "None") {
    throw "No available default VPC was found in $Region. Provide a VPC before deploying MCP."
}

$vpcCidr = (aws ec2 describe-vpcs --vpc-ids $vpcId --region $Region @awsArgs --query "Vpcs[0].CidrBlock" --output text).Trim()
$subnetText = (aws ec2 describe-subnets --filters "Name=vpc-id,Values=$vpcId" "Name=default-for-az,Values=true" "Name=state,Values=available" --region $Region @awsArgs --query "Subnets[].SubnetId" --output text).Trim()
$subnetIds = @($subnetText -split "\s+" | Where-Object { $_ -and $_ -ne "None" })
if ($subnetIds.Count -lt 2) {
    throw "At least two available default subnets are required for the NLB and API Gateway VPC Link."
}
$subnetCsv = $subnetIds -join ","

Write-Host "Deploying MCP image: $imageUri" -ForegroundColor Cyan

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$null = & aws ecr describe-repositories --repository-names $RepositoryName --region $Region @awsArgs 2>&1
$repositoryCheckExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

if ($repositoryCheckExitCode -ne 0) {
    Write-Host "Creating ECR repository: $RepositoryName"
    aws ecr create-repository --repository-name $RepositoryName --region $Region @awsArgs | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to create ECR repository: $RepositoryName" }
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

$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
$existingStatusOutput = & aws cloudformation describe-stacks --stack-name $StackName --region $Region @awsArgs --query "Stacks[0].StackStatus" --output text 2>&1
$existingStackStatus = ($existingStatusOutput | Out-String).Trim()
$stackDescribeExitCode = $LASTEXITCODE
$ErrorActionPreference = $previousErrorActionPreference

if ($stackDescribeExitCode -eq 0 -and $existingStackStatus -in @("ROLLBACK_COMPLETE", "CREATE_FAILED")) {
    Write-Host "Removing previous failed CloudFormation stack: $StackName" -ForegroundColor Yellow
    aws cloudformation delete-stack --stack-name $StackName --region $Region @awsArgs
    if ($LASTEXITCODE -ne 0) { throw "Failed to remove previous failed MCP stack." }
    aws cloudformation wait stack-delete-complete --stack-name $StackName --region $Region @awsArgs
    if ($LASTEXITCODE -ne 0) { throw "Previous failed MCP stack could not be removed." }
}

aws cloudformation deploy `
    --template-file $templatePath `
    --stack-name $StackName `
    --region $Region `
    --capabilities CAPABILITY_IAM `
    --parameter-overrides "ImageUri=$imageUri" "VpcId=$vpcId" "VpcCidr=$vpcCidr" "SubnetIds=$subnetCsv" "JobsTableName=$JobsTableName" "ApplicationsTableName=$ApplicationsTableName" `
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
