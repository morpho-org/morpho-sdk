# release

Prepare and open a release PR that, once merged to `main`, triggers npm publish via CI.

## Usage

```
/release
```

## Instructions

You are helping the user prepare a release. The workflow analyzes changes since the last published version, bumps the version in `package.json`, and opens a PR on a `chore/release-v<version>` branch. Merging the PR to `main` triggers CI to publish on npm.

### Step 1: Validate Working Tree

```bash
git status --porcelain
```

If output is non-empty, warn the user and ask whether to proceed or abort.

### Step 2: Identify the Last Release

```bash
git tag --sort=-version:refname | head -1
```

Store as `$LAST_TAG`. Read the current version from `package.json` → `version` field.

### Step 3: Collect Commits Since Last Release

```bash
git log $LAST_TAG..HEAD --oneline --no-merges
```

If there are zero commits, inform the user there is nothing to release and stop.

### Step 4: Analyze and Categorize Changes

Read each commit message. Classify using conventional commit prefixes:

| Prefix | Category | Bump |
|--------|----------|------|
| `feat` | Feature | minor |
| `fix` | Bug fix | patch |
| `perf` | Performance | patch |
| `refactor` | Refactor | patch |
| `docs` | Documentation | — (skip) |
| `chore` | Chore | — (skip) |
| `test` | Test | — (skip) |
| `BREAKING CHANGE` or `!` after type | Breaking | major |

Rules for determining the bump:

- If ANY commit is a breaking change → `major`
- Else if ANY commit is `feat` → `minor`
- Else → `patch`
- If only `docs`/`chore`/`test` commits exist, ask the user if they still want to release (default: no).

Also read the diff for each non-trivial commit to write an accurate summary:

```bash
git diff $LAST_TAG..HEAD --stat
```

### Step 5: Present the Release Plan

Before proceeding, present the user with:

1. **Commits included** — list of commits grouped by category
2. **Proposed bump** — patch / minor / major
3. **New version** — computed from current version + bump
4. **Changelog summary** — the description that will go in the PR body

Ask the user to confirm or adjust (e.g., override bump level, edit summary).

### Step 6: Bump Version in package.json

Use `npm version <bump> --no-git-tag-version` to update `package.json` (and `package-lock.json` if present) without creating a git tag or commit:

```bash
npm version <patch|minor|major> --no-git-tag-version
```

Verify the version was updated correctly by reading `package.json`.

### Step 7: Run Validation

```bash
pnpm lint && pnpm build
```

Both must pass. Fix any issues before continuing.

### Step 8: Create Release Branch and PR

```bash
git checkout -b chore/release-v<new-version>
git add package.json
git commit -m "chore(release): v<new-version>"
git push -u origin chore/release-v<new-version>
```

Then create the PR:

```bash
gh pr create --base main --title "chore(release): v<new-version>" --body "$(cat <<'EOF'
## Release v<new-version>

### Changes since v<old-version>

#### Features
- ...

#### Bug Fixes
- ...

#### Other
- ...

### Bump
`<bump>` — <old-version> → <new-version>
EOF
)"
```

### Step 9: Final Output

Return to the user:

- Link to the created PR
- Summary of what was included
- Reminder: merging this PR to `main` will trigger CI → git tag → npm publish

### Important Notes

- Never force-push or push directly to `main`.
- The release workflow in CI handles creating the git tag and publishing to npm when the release PR is merged.
- Always run `pnpm lint && pnpm build` before committing.
