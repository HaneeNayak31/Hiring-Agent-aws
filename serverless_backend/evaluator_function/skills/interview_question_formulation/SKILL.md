# Interview Question Formulation Rubric

## Purpose
Translates discovered code trade-offs, architecture decisions, and potential weaknesses into fair, high-signal technical interview questions.

## Grounding & Formulation Requirements
1. **Directly Grounded in Candidate Code:**
   - Every question MUST explicitly reference a concrete line, file, or pattern authored by the candidate (e.g., *"In `src/worker.py:L89`, you catch `Exception` broadly during task processing..."*).
   - NEVER generate generic algorithmic trivia (e.g. "Explain how quicksort works").
   - Every question must explore *why* a design decision was made and what trade-offs were considered.

2. **Standard Output Template for Each Question:**
   For each question generated, format using this structure:
   - **Question:** Professional inquiry into the technical rationale or trade-off observed.
   - **Code Citation:** Exact file and line number (e.g. `src/services/order.py:L45-L60`).
   - **Focus Area:** One of: `Architecture & Modularity`, `Testing & Edge Cases`, `Production Reliability & Debugging`, `Scalability & Concurrency`, or `Security & Data Integrity`.
   - **What to Listen For:** Key engineering maturity indicators (e.g., awareness of failure modes, understanding of distributed transactions, idempotency considerations).

3. **Core Target Topics:**
   - Architecture trade-offs (abstractions vs concrete implementations, state management)
   - Failure modes & edge cases (network drops, timeout budgets, out-of-memory risks)
   - Concurrency & synchronization (race conditions, mutex/locking vs queues)
   - Test strategy (integration test boundaries, mocking third-party APIs)

