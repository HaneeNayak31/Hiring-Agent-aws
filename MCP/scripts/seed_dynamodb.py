"""
DynamoDB Provisioning & Seeding Script for AI-Native Hiring Platform.
Creates 'HiringAgent_Jobs' and 'HiringAgent_Applications' tables (with GSIs and Streams)
and populates the initial production job requisitions.
"""

import os
import json
from decimal import Decimal
from typing import Any, Dict
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION", "ap-south-1")
ENDPOINT_URL = os.getenv("DYNAMODB_ENDPOINT_URL")  # Optional: http://localhost:8000 for local dev
JOBS_TABLE_NAME = os.getenv("DYNAMODB_JOBS_TABLE", "HiringAgent_Jobs")
APPS_TABLE_NAME = os.getenv("DYNAMODB_APPLICATIONS_TABLE", "HiringAgent_Applications")


def get_dynamodb_resource():
    kwargs = {"region_name": AWS_REGION}
    if ENDPOINT_URL:
        kwargs["endpoint_url"] = ENDPOINT_URL
    return boto3.resource("dynamodb", **kwargs)


def get_dynamodb_client():
    kwargs = {"region_name": AWS_REGION}
    if ENDPOINT_URL:
        kwargs["endpoint_url"] = ENDPOINT_URL
    return boto3.client("dynamodb", **kwargs)


def float_to_decimal(obj: Any) -> Any:
    """Recursively convert float to Decimal for boto3 DynamoDB compatibility."""
    if isinstance(obj, float):
        return Decimal(str(obj))
    if isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [float_to_decimal(x) for x in obj]
    return obj


def create_jobs_table(client, table_name: str):
    """Creates the Jobs table with GSI on status & posted_at."""
    try:
        print(f"[DynamoDB] Creating table: {table_name}...")
        client.create_table(
            TableName=table_name,
            KeySchema=[
                {"AttributeName": "job_id", "KeyType": "HASH"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "job_id", "AttributeType": "S"},
                {"AttributeName": "status", "AttributeType": "S"},
                {"AttributeName": "posted_at", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "status-posted_at-index",
                    "KeySchema": [
                        {"AttributeName": "status", "KeyType": "HASH"},
                        {"AttributeName": "posted_at", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
            BillingMode="PAY_PER_REQUEST",
        )
        print(f"[DynamoDB] Waiting for table {table_name} to become ACTIVE...")
        waiter = client.get_waiter("table_exists")
        waiter.wait(TableName=table_name)
        print(f"[DynamoDB] Table {table_name} created successfully.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"[DynamoDB] Table {table_name} already exists. Skipping creation.")
        else:
            raise


def create_applications_table(client, table_name: str):
    """Creates the Applications table with GSI on job_id & submitted_at and DynamoDB Streams enabled."""
    try:
        print(f"[DynamoDB] Creating table: {table_name}...")
        client.create_table(
            TableName=table_name,
            KeySchema=[
                {"AttributeName": "application_id", "KeyType": "HASH"}
            ],
            AttributeDefinitions=[
                {"AttributeName": "application_id", "AttributeType": "S"},
                {"AttributeName": "job_id", "AttributeType": "S"},
                {"AttributeName": "submitted_at", "AttributeType": "S"},
            ],
            GlobalSecondaryIndexes=[
                {
                    "IndexName": "job_id-submitted_at-index",
                    "KeySchema": [
                        {"AttributeName": "job_id", "KeyType": "HASH"},
                        {"AttributeName": "submitted_at", "KeyType": "RANGE"},
                    ],
                    "Projection": {"ProjectionType": "ALL"},
                }
            ],
            StreamSpecification={
                "StreamEnabled": True,
                "StreamViewType": "NEW_IMAGE",
            },
            BillingMode="PAY_PER_REQUEST",
        )
        print(f"[DynamoDB] Waiting for table {table_name} to become ACTIVE...")
        waiter = client.get_waiter("table_exists")
        waiter.wait(TableName=table_name)
        print(f"[DynamoDB] Table {table_name} created successfully with Streams enabled.")
    except ClientError as e:
        if e.response["Error"]["Code"] == "ResourceInUseException":
            print(f"[DynamoDB] Table {table_name} already exists. Skipping creation.")
        else:
            raise


# Initial Production Requisition Seed
INITIAL_JOBS = [
    {
        "job_id": "job-backend-01",
        "id": "job-backend-01",
        "title": "Junior Cloud Engineer (Platform & Distributed Systems)",
        "department": "Core Infrastructure",
        "location": "San Francisco, CA (or Remote US)",
        "workplace_type": "remote",
        "employment_type": "full-time",
        "experience_level": "Junior",
        "min_years_experience": 0,
        "compensation": {
            "min": 16000,
            "max": 19500,
            "currency": "USD",
            "period": "yearly",
        },
        "primary_skills": ["AWS", "Python", "FastAPI", "PostgreSQL", "Docker", "Distributed Systems"],
        "status": "active",
        "posted_at": "2026-09-15T09:00:00Z",
        "overview": (
            "Join our Core Infrastructure team to architect resilient, high-throughput backend services. "
            "You will scale distributed event streams, design resilient data models, and optimize our low-latency APIs."
        ),
        "full_description_markdown": (
            "## About The Role\n"
            "We are seeking an experienced Backend Engineer to lead the architectural evolution of our event-driven systems. "
            "You will work closely with AI infrastructure engineers, designing APIs handling millions of requests per day.\n\n"
            "## What You'll Do\n"
            "- Design, develop, and maintain high-concurrency microservices in Python (AsyncIO, FastAPI) and Go.\n"
            "- Optimize PostgreSQL queries, index strategies, and partitioning for heavy data pipelines.\n"
            "- Implement observability pipelines with OpenTelemetry and Prometheus.\n"
            "- Write clean, thoroughly tested code with robust unit and integration test suites.\n\n"
            "## Minimum Qualifications\n"
            "- Deep proficiency in modern Python (AsyncIO, Pydantic, FastAPI) or Go.\n"
            "- Solid knowledge of relational databases (PostgreSQL) and caching layers (Redis).\n"
        ),
        "responsibilities": [
            "Design, build, and maintain mission-critical backend APIs and asynchronous pipelines.",
            "Architect database schemas and perform query optimization on PostgreSQL.",
            "Champion automated testing, code quality, and CI/CD best practices.",
            "Participate in on-call rotations and lead incident post-mortems.",
        ],
        "required_skills": ["Python", "FastAPI", "PostgreSQL", "AsyncIO", "Docker", "Git"],
        "preferred_skills": ["Redis", "Kafka", "Kubernetes", "OpenTelemetry", "Go"],
        "benefits": [
            "Competitive base salary + significant equity package",
            "Comprehensive health, dental, and vision insurance (100% premium covered)",
            "Flexible remote work environment & $1,500 home office stipend",
            "Unlimited PTO and paid parental leave",
        ],
        "submission_requirements": {
            "mandatory_fields": [
                "fullName",
                "email",
                "skills",
                "experience",
                "projects",
                "repositoryUrl",
            ],
            "optional_fields": [
                "education.college",
                "education.degree",
                "education.cgpa",
                "education.tenth_result",
                "education.twelfth_result",
                "profiles.linkedin",
                "profiles.leetcode",
                "profiles.codeforces",
                "profiles.codechef",
                "profiles.portfolio",
                "phone",
                "location",
                "summary",
                "certifications",
                "coverNote",
            ],
            "min_projects": 1,
            "requires_code_repository": True,
            "required_profiles": ["github"],
            "optional_profiles": ["linkedin", "leetcode", "codeforces", "codechef", "portfolio"],
            "custom_questions": [
                {
                    "id": "q_backend_perf",
                    "question": "Briefly explain a production performance bottleneck you diagnosed and resolved.",
                    "required": True,
                }
            ],
        },
    }
]


def seed_jobs(resource, table_name: str):
    """Populates the jobs table with initial seed data."""
    table = resource.Table(table_name)
    print(f"[DynamoDB] Seeding jobs into {table_name}...")
    for job in INITIAL_JOBS:
        item = float_to_decimal(job)
        table.put_item(Item=item)
        print(f"  -> Seeded role: {job['title']} (ID: {job['job_id']})")
    print("[DynamoDB] Seeding completed successfully.")


def setup_all():
    client = get_dynamodb_client()
    resource = get_dynamodb_resource()

    print(f"=== Initializing DynamoDB (Region: {AWS_REGION}) ===")
    create_jobs_table(client, JOBS_TABLE_NAME)
    create_applications_table(client, APPS_TABLE_NAME)
    seed_jobs(resource, JOBS_TABLE_NAME)
    print("=== DynamoDB Setup Complete ===")


if __name__ == "__main__":
    setup_all()
