"""
Serverless REST API for Recruiter Dashboard.
Exposes endpoints to fetch candidate evaluation reports, flight recorder traces,
and applicant listings from Amazon DynamoDB and S3.
Wrapped with Mangum for AWS Lambda & API Gateway / HttpApi deployment.
"""

import os
import json
from typing import Optional, List, Dict, Any
import boto3
from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from mangum import Mangum

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
JOBS_TABLE_NAME = os.getenv("DYNAMODB_JOBS_TABLE", "HiringAgent_Jobs")
APPS_TABLE_NAME = os.getenv("DYNAMODB_APPLICATIONS_TABLE", "HiringAgent_Applications")
S3_BUCKET = os.getenv("S3_ASSESSMENT_BUCKET", "hiring-agent-assessments")

app = FastAPI(title="Recruiter Serverless API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

s3_client = boto3.client("s3", region_name=AWS_REGION)
dynamodb = boto3.resource("dynamodb", region_name=AWS_REGION)


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "Serverless_Recruiter_API"}


@app.get("/api/jobs/{job_id}/applications")
def list_job_applications(job_id: str):
    """Fetches all candidate applications for a specific job."""
    table = dynamodb.Table(APPS_TABLE_NAME)
    try:
        response = table.query(
            IndexName="job_id-submitted_at-index",
            KeyConditionExpression=boto3.dynamodb.conditions.Key("job_id").eq(job_id)
        )
        return {"applications": response.get("Items", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DynamoDB query failed: {str(e)}")


@app.get("/api/applications/{application_id}")
def get_application(application_id: str):
    """Fetches full application metadata from DynamoDB."""
    table = dynamodb.Table(APPS_TABLE_NAME)
    try:
        response = table.get_item(Key={"application_id": application_id})
        item = response.get("Item")
        if not item:
            raise HTTPException(status_code=404, detail="Application not found")
        return item
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/reports/{application_id}")
def get_candidate_report(application_id: str):
    """Retrieves markdown intelligence report from S3."""
    s3_key = f"applications/{application_id}/candidate_intelligence_report.md"
    try:
        obj = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
        report_text = obj["Body"].read().decode("utf-8")
        return Response(content=report_text, media_type="text/markdown")
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise HTTPException(status_code=404, detail="Report not ready yet")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/traces/{application_id}")
def get_execution_trace(application_id: str):
    """Retrieves the full flight recorder trace JSON from S3."""
    s3_key = f"applications/{application_id}/trace.json"
    try:
        obj = s3_client.get_object(Bucket=S3_BUCKET, Key=s3_key)
        trace_json = json.loads(obj["Body"].read().decode("utf-8"))
        return JSONResponse(content=trace_json)
    except ClientError as e:
        if e.response["Error"]["Code"] == "NoSuchKey":
            raise HTTPException(status_code=404, detail="Trace not found")
        raise HTTPException(status_code=500, detail=str(e))


# Mangum handler for AWS Lambda / API Gateway
handler = Mangum(app)
