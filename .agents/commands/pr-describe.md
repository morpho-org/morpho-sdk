# pr-describe

Generate a PR description for the current branch.

## Usage

```
/pr-describe
```

## Instructions

You are helping the user generate a PR description. Derive all information from the current changes - do not ask the user any questions.

### Step 1: Check Current Branch, Determine Base, and Analyze Changes

First, check what branch the user is on and determine the base branch:

```bash
git rev-parse --abbrev-ref HEAD
gh pr view --json number,title,url,baseRefName 2>/dev/null || echo "No PR exists"
```

Determine the base branch to diff against:

- If a PR already exists, use `baseRefName` from the PR view output.
- If no PR exists, fall back to the repo's default branch: `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`

Then diff against the resolved base branch:

```bash
git diff <base-branch> --stat
git diff <base-branch>
```

Analyze the changes to understand:

- What type of change this is (feat, fix, or chore)
- What the change does (for the PR title and description)
- How critical the change is (low, medium, high, or critical)

### Step 2: Generate PR Content

Derive all PR content from the changes:

- **Title**: Use conventional commits format: `<type>: <short description>`
  - Examples: `feat: add dark mode toggle`, `fix: resolve login redirect issue`, `chore: update dependencies`
- **Label**: `criticality:<level>` - derive from the scope and risk of the changes:
  - `low`: Minor changes, cosmetic updates, documentation
  - `medium`: Standard feature work, non-critical bug fixes
  - `high`: Changes affecting core functionality, security-related
  - `critical`: Breaking changes, critical security fixes

**PR Body** - Generate content based on the actual changes:

```markdown
## Motivation

[Explain WHY this change is needed based on the code changes]

## Solution

[Describe WHAT was changed and HOW it addresses the motivation]
```

### Step 3: Output and Offer to Update

Present the description in a format that's easy to copy, then offer to update the PR:

If a PR exists:

- Use `gh pr edit <number> --title "<title>" --body "<body>"` to update it

If no PR exists:

- Offer to create one with `gh pr create`

### Step 4: Confirm Success

After the PR is updated/created, output:

1. The PR URL (clickable)
2. A summary of what was done:
   - Branch name
   - PR title
   - Criticality label

### Important Notes

- Do NOT ask the user any questions - derive everything from the changes
- Check if a PR exists before deciding whether to create or update
- Always use the PR's actual base branch for diffs (may not be `main`)
