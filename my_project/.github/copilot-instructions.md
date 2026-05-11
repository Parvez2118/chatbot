<!-- .github/copilot-instructions.md - guidance for AI coding agents -->
# Copilot / AI Agent Instructions

Purpose: Help an AI coding agent become productive quickly in this repository.

1) Big picture
-- This is a minimal Python demo project named `my-project` (see [pyproject.toml](../pyproject.toml#L1)).
-- Primary dependencies: `fastapi`, `uvicorn`, and multiple `langchain` packages (see [pyproject.toml](../pyproject.toml#L1)).
-- Current source is a single script: [main.py](../main.py#L1-L40). The repository appears to be an early demo / scaffolding rather than a complete service.

2) Key files to inspect first
-- [main.py](../main.py#L1-L40): entrypoint; contains broken/incomplete example usage of `langchain-core.prompts.chatPromptTemplate`. Fixes here should preserve intent: create a runnable entrypoint that prints the greeting and demonstrates a simple prompt flow.
-- [pyproject.toml](../pyproject.toml#L1-L40): lists dependencies. Do not remove or silently upgrade versions without user approval.
-- [README.md](../README.md): currently empty — update only after confirming behavior.

3) Project-specific conventions & notable issues
- Small single-module layout: changes should avoid introducing heavy restructuring unless requested.
-- `main.py` currently has syntax errors and an unfinished `initialProjectMethod()`; correct these when implementing features. Example issues: missing closing bracket/parenthesis and misplaced print statements (see [main.py](../main.py#L1-L40)).
-- Language / packages: this project uses `langchain-core` style imports (see [main.py](../main.py#L1)). Follow existing import patterns when adding code.

4) Build / run / test commands (discoverable)
- Quick run (script-style): `python main.py` — intended to print "Hello from my-project!" once `main.py` is fixed.
- If a FastAPI app is added, start with `uvicorn` (example): `uvicorn my_project.app:app --reload` — only applicable after an ASGI `app` object exists.
- Dependency install (recommended developer workflow):
  - Create & activate venv: `python -m venv .venv && source .venv/bin/activate`
  - Install dependencies: `pip install -U pip` then install packages from `pyproject.toml` via `pip install .` or add a `requirements.txt` if preferred. Confirm with the repo owner before changing dependency installation flow.

5) Guidance for making changes
- Fix bugs at the root cause (e.g., fix syntax in `main.py` rather than wrapping in try/except).
- When demonstrating LangChain prompt usage, prefer short, runnable examples that don't require external API keys (or gate them behind environment checks). If credentials are needed, read or update `.env` handling only after asking.
- Keep diffs small and focused. For doc updates, prefer adding to `README.md` rather than expanding `main.py` with long explanatory blocks.

6) Integration points & external dependencies
- External: LangChain libraries (multiple packages in `pyproject.toml`) — these may require network access or model credentials. Avoid running code that attempts to call external models without explicit permission and valid credentials.

7) Quick fixes examples (what an AI can do safely)
- Repair `main.py` syntax, making `initialProjectMethod()` a valid function and ensuring `main()` still prints the greeting.
- Add a minimal unit test file (optional) that imports `main` and asserts that `main()` returns or prints expected output.

8) When to ask the user
- Before adding or upgrading dependencies.
- Before adding API keys, external credentials, or running networked model calls.
- If you infer a larger architectural change (e.g., converting to a package layout or adding FastAPI routes).

If anything here is unclear or you want me to expand a section (run tests, create a minimal FastAPI app, or fix `main.py`), tell me which part to iterate on next.
