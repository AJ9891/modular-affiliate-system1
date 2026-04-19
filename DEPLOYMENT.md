# Deployment (Guarded)

This repository is locked to a single Vercel target:

- Team scope: `aj9891s-projects`
- Org ID: `team_S1WvHxaHSkDlH8DJ0HOT61Ab`
- Project name: `modular-affiliate-system1`
- Project ID: `prj_j1izlrAzNKk3KX5NJlRDjQ8R84SJ`

## Canonical commands

1. Validate local Vercel link context:

   ```bash
   npm run deploy:check
   ```

2. Deploy preview:

   ```bash
   npm run deploy:preview
   ```

3. Deploy production:

   ```bash
   npm run deploy
   ```

## How the guard works

`scripts/vercel-safe-deploy.sh` reads `.vercel/project.json` and exits with an error if any of these differ from expected values:

- `orgId`
- `projectId`
- `projectName`

If they do not match, deploy is blocked and it prints the exact `vercel link` command to fix the link.

## If link check fails

Run:

```bash
vercel link --yes --scope "aj9891s-projects" --project "modular-affiliate-system1"
```

Then rerun:

```bash
npm run deploy:check
```
