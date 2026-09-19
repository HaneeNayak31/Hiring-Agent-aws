[CmdletBinding()]
param(
    [string]$Region = "ap-south-1",
    [string]$StackName = "hiring-agent-aws",
    [string]$FrontendBucketName = "hiring-agent-frontend-178707646433-ap-south-1",
    [string]$AssessmentsBucketName = "hiring-agent-assessments-178707646433-ap-south-1",
    [string]$Profile
)

$ErrorActionPreference = "Continue"
$awsArgs = @()
if ($Profile) { $awsArgs += @("--profile", $Profile) }

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Undeploying AI Hiring Platform (AWS)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Delete Frontend S3 Bucket and all hosted files
Write-Host "`n[1/3] Deleting Frontend S3 Website Bucket: $FrontendBucketName..." -ForegroundColor Yellow
aws s3 rb "s3://$FrontendBucketName" --force --region $Region @awsArgs

# 2. Empty Assessments S3 Bucket (CloudFormation cannot delete non-empty S3 buckets)
Write-Host "`n[2/3] Emptying Assessments S3 Bucket: $AssessmentsBucketName..." -ForegroundColor Yellow
aws s3 rm "s3://$AssessmentsBucketName" --recursive --region $Region @awsArgs

# 3. Delete CloudFormation / SAM Stack (DynamoDB, Lambdas, API Gateway, Secrets)
Write-Host "`n[3/3] Deleting SAM Backend Stack: $StackName..." -ForegroundColor Yellow
sam delete --stack-name $StackName --region $Region --no-prompts @awsArgs

Write-Host "`n========================================" -ForegroundColor Green
Write-Host " All frontend and backend resources removed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
