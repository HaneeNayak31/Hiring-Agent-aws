[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$ApiBaseUrl,
    [string]$Region = "ap-south-1",
    [string]$BucketName,
    [string]$Profile
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendRoot = Join-Path $repoRoot "frontend"

if (-not (Get-Command aws -ErrorAction SilentlyContinue)) { throw "AWS CLI is required." }
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) { throw "Node.js/npm is required." }

function Save-Utf8NoBom {
    param([string]$Path, [string]$Content)
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($Path, $Content, $utf8NoBom)
}

$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

$accountId = (aws sts get-caller-identity @awsArgs --query Account --output text).Trim()
if ([string]::IsNullOrWhiteSpace($BucketName)) {
    $BucketName = "hiring-agent-frontend-$accountId-$Region"
}

# 1. Ensure S3 bucket exists
$existingBuckets = @((aws s3api list-buckets @awsArgs | ConvertFrom-Json).Buckets.Name)
if ($existingBuckets -notcontains $BucketName) {
    Write-Host "Creating S3 bucket: $BucketName in $Region..."
    if ($Region -eq "us-east-1") {
        aws s3api create-bucket --bucket $BucketName --region $Region @awsArgs | Out-Null
    } else {
        aws s3api create-bucket --bucket $BucketName --create-bucket-configuration LocationConstraint=$Region --region $Region @awsArgs | Out-Null
    }
} else {
    Write-Host "Using existing S3 bucket: $BucketName"
}

# 2. Configure public access for S3 Static Website Hosting
Write-Host "Configuring S3 public website access..."
aws s3api put-public-access-block --bucket $BucketName --public-access-block-configuration BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false --region $Region @awsArgs | Out-Null

# 3. Enable Static Website Hosting on S3
Write-Host "Enabling static website hosting on S3..."
aws s3 website "s3://$BucketName" --index-document index.html --error-document index.html @awsArgs

# 4. Apply public read bucket policy
$policy = @{
    Version = "2012-10-17"
    Statement = @(@{
        Sid = "PublicReadGetObject"
        Effect = "Allow"
        Principal = "*"
        Action = "s3:GetObject"
        Resource = "arn:aws:s3:::$BucketName/*"
    })
} | ConvertTo-Json -Depth 5

$policyFile = Join-Path $env:TEMP "$BucketName-policy.json"
Save-Utf8NoBom -Path $policyFile -Content $policy
aws s3api put-bucket-policy --bucket $BucketName --policy "file://$policyFile" --region $Region @awsArgs | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Failed to attach public bucket policy." }

# 5. Build Next.js frontend with live API URL
$env:NEXT_PUBLIC_API_BASE_URL = $ApiBaseUrl.TrimEnd('/')
Push-Location $frontendRoot
try {
    Write-Host "Building frontend bundle with NEXT_PUBLIC_API_BASE_URL=$($env:NEXT_PUBLIC_API_BASE_URL)..."
    npm.cmd run build
    if ($LASTEXITCODE -ne 0) { throw "npm run build failed" }
} finally {
    Pop-Location
}

# 6. Upload static assets to S3
Write-Host "Uploading static build to s3://$BucketName..."
aws s3 sync (Join-Path $frontendRoot "out") "s3://$BucketName" --delete --region $Region @awsArgs
if ($LASTEXITCODE -ne 0) { throw "S3 sync failed" }

aws s3 cp (Join-Path $frontendRoot "out/index.html") "s3://$BucketName/index.html" --cache-control "no-cache,no-store,must-revalidate" --content-type "text/html" --region $Region @awsArgs | Out-Null

$websiteUrl = "http://$BucketName.s3-website.$Region.amazonaws.com"

Write-Host ""
Write-Host "Frontend deployed successfully as an S3 Static Website!" -ForegroundColor Green
Write-Host "Bucket:      s3://$BucketName"
Write-Host "Website URL: $websiteUrl"
Write-Host ""
