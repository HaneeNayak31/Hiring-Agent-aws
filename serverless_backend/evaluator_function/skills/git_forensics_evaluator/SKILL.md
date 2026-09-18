# Git Forensics & Commit Cadence Rubric

## Purpose
Evaluates git commit history to determine genuine, iterative development progression versus monolithic copy-paste code drops.

## CLI Forensics Commands (Run from `/workspace/repo`)
Execute the following commands in the sandbox environment to gather raw evidence:

```bash
# 1. Authorship breakdown and commit distribution:
git shortlog -sn --all --no-merges

# 2. Inspect commit cadence, dates, and messages:
git log --format="%h | %ad | %an | %s" --date=short -n 35

# 3. Check first initial commit(s) for bulk dump (>1000 lines dropped at once):
git log --reverse --stat -n 3

# 4. Check for Conventional Commit adherence (feat, fix, refactor, test, docs):
git log --oneline | grep -E "^[a-f0-9]+ (feat|fix|refactor|test|chore|docs|ci):" | wc -l

# 5. Check branch and merge patterns:
git log --graph --oneline --decorate -n 20
```

## Evaluation Checklist
1. **Commit Cadence & Timeline:**
   - Are commits distributed organically across realistic time spans (days/weeks)?
   - Flag "single commit" dumps where entire codebases appear in 1 or 2 initial commits without evolutionary history.

2. **Commit Atomicity & Conventions:**
   - Are commits atomic and focused on single changes?
   - Look for Conventional Commit formatting (e.g. `feat:`, `fix:`, `refactor:`, `test:`).
   - Flag uninformative commit messages such as `fix`, `update`, `wip`, `final`.

3. **Authorship & Consistency:**
   - Check git author email and username consistency across history.
   - Verify that commit history aligns with the candidate's reported identity.

## Evidence Requirement
Every git forensic finding MUST cite:
- Sample commit hashes (short SHA) and timestamps
- Commit message excerpts and conventional commit percentage
- Total commit count and active contribution date span

