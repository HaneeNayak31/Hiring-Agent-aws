import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent / "evaluator_function"))

from prompts import create_input


def test_coordinator_prompt_includes_all_repositories_and_neutral_output_contract():
    prompt = create_input(
        repo_url="https://github.com/example/project-a.git",
        repositories=[
            {"repository_id": "project-a", "repository_url": "https://github.com/example/project-a.git"},
            {"repository_id": "project-b", "repository_url": "https://github.com/example/project-b.git"},
            {"repository_id": "project-c", "repository_url": "https://github.com/example/project-c.git"},
        ],
        job_context={"title": "Backend Engineer", "required_skills": ["Python", "AWS"]},
        instructions="Focus on API design and failure handling.",
    )

    assert "project-a" in prompt
    assert "project-b" in prompt
    assert "project-c" in prompt
    assert "hiring recommendations" in prompt
    assert "candidate scores" in prompt
    assert "/workspace/repos/<repository_id>" in prompt
