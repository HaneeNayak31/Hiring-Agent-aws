# SOLID Architecture & Modularity Rubric

## Purpose
Evaluates modularity, layering, and adherence to object-oriented / functional design principles without running candidate code.

## CLI Architecture Inspection Commands (Run from `/workspace/repo`)
Execute the following commands in the sandbox environment to discover architectural structure:

```bash
# 1. Discover top source directories and file counts:
find . -maxdepth 3 -not -path '*/.*' -type d | sort

# 2. Identify monolithic "God files" (>300 lines of code):
find . -type f \( -name "*.py" -o -name "*.ts" -o -name "*.js" -o -name "*.go" \) ! -path "*/node_modules/*" ! -path "*/.venv/*" -exec wc -l {} + | sort -rn | head -n 15

# 3. Check for coupling / architectural layering (e.g. database imports in route handlers):
grep -rnE "(from .*models import|import.*db|sqlite3|pg|prisma|drizzle|mongoose)" src/routes/ 2>/dev/null || true

# 4. Check interface / abstract base class usage (Dependency Inversion):
grep -rnE "(class .*(Protocol|ABC)|interface |type .*Handler)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null | head -n 20
```

## Evaluation Checklist
1. **S - Single Responsibility Principle (SRP):**
   - Check if domain services handle only one concern.
   - Flag "God classes" or monolithic files that mix HTTP routing, database queries, business rules, and email/notification mechanics.
   - Verify that data serialization/parsing is separated from business operations.

2. **O - Open/Closed Principle (OCP):**
   - Verify whether new features, adapters, or backends can be introduced via interfaces, protocols, or strategy patterns without modifying core dispatcher logic.
   - Look for long chains of `if/elif/else` type checks that must be altered every time a new provider is supported.

3. **L - Liskov Substitution Principle (LSP):**
   - Ensure child classes or implementation adapters fulfill base protocol contracts.
   - Check for unexpected `NotImplementedError` or altered signature semantics in subclasses.

4. **I - Interface Segregation Principle (ISP):**
   - Ensure interfaces and protocols are minimal, cohesive, and client-focused.
   - Clients should not be forced to implement methods they never invoke.

5. **D - Dependency Inversion Principle (DIP):**
   - Check if high-level business logic depends on abstractions (Protocols, ABCs, Interfaces) rather than hardcoded concrete infrastructure classes (e.g. direct Redis clients, specific DB connections).

## Evidence Requirement
Every architectural finding MUST cite:
- Exact relative file path (e.g., `src/domain/queue.py`)
- Line numbers or function/class names (e.g., `QueueWorker:L42`)
- Concrete explanation of the pattern observed

