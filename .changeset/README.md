# Changesets

This project uses [Changesets](https://github.com/changesets/changesets) to manage versioning and changelogs.

## Adding a changeset

When you make changes that should be released, you need to add a changeset. To do this, run:

```bash
pnpm changeset
```

This will prompt you to:

1. Select which packages should be released
2. Choose the type of version bump (major, minor, or patch)
3. Write a summary of the changes

The changeset will be created in the `.changeset` directory.

## Releasing

When you're ready to release:

1. **Version packages**: This creates a version PR that updates package versions and changelogs

   ```bash
   pnpm version
   ```

2. **Publish**: After merging the version PR, publish to npm
   ```bash
   pnpm release
   ```

The CI workflow will automatically:

- Create version PRs when changesets are present
- Publish packages when version PRs are merged
