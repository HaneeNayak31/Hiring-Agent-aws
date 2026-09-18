# AI-Native Hiring Platform (AWS SAM Architecture)

An evidence-first hiring platform connecting candidate AI agents (Claude, Codex, Cursor) via **Model Context Protocol (MCP)** to an automated **Docker sandbox evaluation agent**, orchestrating reports and execution traces through **AWS SAM (DynamoDB, S3, Lambda)** and a Next.js **Recruiter Flight Recorder UI**.

---

## Repository Structure

```text
Hiring-Agent-aws/
│
├── frontend/                                # Next.js 13 Recruiter & Candidate Portal
│   ├── app/                                 # Routes (recruiter candidates, brief, opportunities)
│   ├── components/                          # UI components (evidence graphs, drawer)
│   ├── data/                                # Mock data & types
│   ├── package.json
│   └── tailwind.config.js
│
├── serverless_backend/                      # AWS Serverless Application Model (SAM)
│   ├── template.yaml                        # Infrastructure as Code (DynamoDB, S3, Lambdas)
│   ├── samconfig.toml                       # SAM deployment settings
│   ├── evaluator_function/                  # Candidate Evaluator (triggered by DynamoDB Stream)
│   │   ├── handler.py                       # Lambda entrypoint
│   │   ├── agent.py                         # OpenAI Agents API session factory
│   │   ├── trace_collector.py               # Lossless trace recorder
│   │   ├── s3_storage.py                    # S3 uploader for reports and trace.json
│   │   ├── prompts/                         # Prompts and system instructions
│   │   └── requirements.txt
│   │
│   └── api_function/                        # Recruiter REST API (FastAPI + Mangum)
│       ├── app.py                           # /api/reports/{id}, /api/traces/{id}
│       └── requirements.txt
│
├── MCP/                                     # Standalone Applicant MCP Server
│   ├── server.py                            # FastMCP server with tools & prompts
│   ├── db.py                                # DynamoDB adapter (Jobs & Applications)
│   ├── models/                              # Pydantic models (passport, job, application)
│   ├── scripts/                             # seed_dynamodb.py
│   ├── tests/                               # Unit & integration tests
│   └── requirements.txt
└── package.json                             # Monorepo scripts (dev, build, mcp, sam)
```

---

## Quick Start & Developer Guide

### 1. Run the Frontend (Next.js)
```bash
cd frontend
npm run dev
# Or from root:
npm run dev
```
Accessible at: `http://localhost:3000`

---

### 2. Run the Applicant MCP Server
Candidate AI agents connect to this MCP server to discover jobs and apply:
```bash
cd MCP
pip install -r requirements.txt
python server.py
# Or from root:
npm run mcp
```

---

### 3. Deploy the Serverless Backend (AWS SAM)
Once AWS SAM CLI is installed:
```bash
# Build functions & dependencies
sam build

# Deploy to your AWS Account
sam deploy --guided
```

This provisions:
- **`HiringAgent_Jobs`** DynamoDB table (with GSI `status-posted_at-index`).
- **`HiringAgent_Applications`** DynamoDB table (with GSI `job_id-submitted_at-index` and **DynamoDB Streams**).
- **`hiring-agent-assessments-...`** S3 bucket for markdown reports and lossless `trace.json` execution logs.
- **`CandidateEvaluatorFunction`** Lambda listening to DynamoDB Streams to run the evaluation agent.
- **`RecruiterApiFunction`** HTTP API for the Recruiter UI.

---

### 4. Seed DynamoDB Tables (Initial Roles)
```bash
python MCP/scripts/seed_dynamodb.py
# Or from root:
npm run seed:dynamodb
```

---

## Architectural Workflow

1. **Candidate Applies via MCP**:
   * Candidate AI invokes `submit_application` on `MCP/server.py`.
   * MCP server writes candidate passport to `HiringAgent_Applications` in DynamoDB.
2. **DynamoDB Stream Fires**:
   * The `INSERT` stream event triggers `serverless_backend/evaluator_function/handler.py`.
   * Status updates to `EVALUATING`.
3. **Sandbox Agent Evaluates Repo**:
   * Clones repo, runs unit tests, static linting, and architecture analysis.
   * `TraceCollector` captures 100% of raw events (reasoning tokens, tool calls, stdout/stderr).
4. **Artifacts Uploaded to S3**:
   * `candidate_intelligence_report.md` $\rightarrow$ S3.
   * `trace.json` (dual-layer flight recorder) $\rightarrow$ S3.
   * DynamoDB status updates to `EVALUATED`.
5. **Recruiter Reviews Candidate**:
   * Recruiter views Candidate Detail page.
   * Inspects AI report, reads actual terminal logs, and audits the AI reasoning timeline.
