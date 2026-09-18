# Security & Code Smells Rubric

## Purpose
Identifies latent technical debt, security hazards, maintainability bottlenecks, and anti-patterns.

## CLI Security & Smells Commands (Run from `/workspace/repo`)
Execute the following commands in the sandbox environment to detect security issues:

```bash
# 1. Search for leaked secrets, private keys, and API tokens:
grep -rnE "(AIza[0-9A-Za-z-_]{35}|sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36}|BEGIN PRIVATE KEY|AWS_SECRET_ACCESS_KEY)" . ! -path "*/.git/*" ! -path "*/node_modules/*" 2>/dev/null || true

# 2. Search for broad exception swallowing:
grep -rnE "(except:\s*$|except Exception:\s*pass|catch\s*\(.*\)\s*\{\s*\})" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null || true

# 3. Detect dangerous command execution & injection risks:
grep -rnE "(os\.system|subprocess\.Popen\(.*shell=True|eval\(|exec\(|dangerouslySetInnerHTML)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null || true

# 4. Detect SQL query string interpolation (SQL Injection risks):
grep -rnE "(f\"SELECT.*FROM|f\"INSERT.*INTO|f\"UPDATE.*SET|\"SELECT.*\" \+)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null || true

# 5. Check for unresolved technical debt:
grep -rnE "(TODO:|FIXME:|HACK:|XXX:)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null | head -n 25
```

## Evaluation Checklist
1. **Secret & Credential Leakage:**
   - Detect hardcoded API keys, JWT secrets, private keys, database passwords, or auth tokens in source files, dockerfiles, or git history.
   - Verify proper use of environment variables and `.env.example` templates.

2. **Broad Exception Swallowing:**
   - Detect bare `except:` or `except Exception: pass` / empty catch blocks that suppress critical runtime faults.

3. **Input Sanitization & Injection Hazards:**
   - Check for direct string interpolation / formatted SQL queries (`f"SELECT * FROM users WHERE id = {user_id}"`) instead of parameterized queries.
   - Check for unvalidated user payloads passed to shell commands or file operations (`os.system`, `subprocess.Popen(..., shell=True)`).

4. **Maintainability Smells & Tech Debt:**
   - Functions exceeding 60 lines or high cyclomatic complexity.
   - Unresolved `TODO`, `FIXME`, or `HACK` markers indicating incomplete implementations.
   - Commented-out dead code blocks.

## Evidence Requirement
Every security and code smell finding MUST cite:
- Relative file path and exact line numbers (e.g. `src/worker.py:L89`)
- Verbatim code snippet
- Specific risk impact (e.g. "Catches unrecoverable errors identically to transient connection hiccups")

