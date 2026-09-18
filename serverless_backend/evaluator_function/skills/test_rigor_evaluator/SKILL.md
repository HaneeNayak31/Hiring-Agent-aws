# Test Suite Rigor Evaluator Rubric

## Purpose
Evaluates the quality, coverage, depth, and reliability of candidate test suites without executing them.

## CLI Test Inspection Commands (Run from `/workspace/repo`)
Execute the following commands in the sandbox environment to inspect tests:

```bash
# 1. Discover all test files across the repository:
find . -type f \( -name "*test*" -o -name "*spec*" \) ! -path "*/node_modules/*" ! -path "*/.venv/*" ! -path "*/.git/*"

# 2. Count total test cases:
grep -rnE "(def test_|it\(|test\(|func Test)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null | wc -l

# 3. Measure assertion density:
grep -rnE "(assert |expect\(|assertEquals|assertThat)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null | wc -l

# 4. Detect superficial / trivial assertions (e.g. assert True):
grep -rnE "(assert True|assert response is not None|expect\(true\)\.toBe\(true\)|assert 1 == 1)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null || true

# 5. Inspect mocking and stubbing patterns:
grep -rnE "(unittest.mock|jest.mock|sinon|gomock|vi.mock)" . ! -path "*/node_modules/*" ! -path "*/.venv/*" 2>/dev/null | head -n 20
```

## Evaluation Checklist
1. **Assertion Density & Signal:**
   - Are assertions testing real business invariants, state changes, error messages, and payload schemas?
   - Flag tests with trivial, superficial assertions (e.g. `assert response is not None` or `assert True`).

2. **Test Pattern & Structure:**
   - Adherence to Arrange-Act-Assert (AAA) or Given-When-Then test formatting.
   - Clarity and readability of test names describing expected behavior under specific scenarios.

3. **Edge Cases & Failure Modes:**
   - Are boundary conditions, network timeouts, invalid inputs, dropped connections, and exception paths actively verified?
   - Look for tests that simulate malformed inputs or expired tokens.

4. **Mocking Strategy & Fidelity:**
   - Are external boundaries (databases, HTTP clients, message brokers) mocked cleanly?
   - Avoid over-mocking internal units that test only mock interactions rather than real behavior.

## Evidence Requirement
Every test suite finding MUST cite:
- Exact test file paths and test function names (e.g. `tests/test_worker.py::test_retry_exponential_backoff`)
- Sample assertion statements or missing edge cases
- Total test count and distribution

