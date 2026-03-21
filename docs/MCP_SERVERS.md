# MCP Server Guidelines

This document collects best practices and examples for configuring and
running **Model Context Protocol (MCP) servers** in this repository.

## Common Configuration Options

- `name`: A friendly identifier (e.g. `TalkToFigma`).
- `command` / `args`: The executable and arguments used to start the server.
- `env`: Environment variables injected at runtime (use secrets where possible).
- `tools`: Tool allowlist; prefer explicit lists over `[*]` in production.
- `cwd`: Working directory for the process.
- `autostart` / `restartPolicy`: Enable automatic restarts.
- `timeout`, `memLimit`, `cpuLimit`: Resource constraints.
- `network` / `egress`: Restrict outbound network access.
- `workspaceAccess`: Filesystem access restrictions (paths, read/write).
- `healthcheck`: Endpoint or command used by supervisors to verify liveness.
- `logLevel` / `verbosity`: Control log detail.
- `maxConcurrentSessions`: Limit simultaneous requests.

## Healthcheck Examples

1. **HTTP-based** (preferred when available):

   ```bash
   npx ai-figma-mcp@latest --health=8080
   # supervisor polls http://localhost:8080/health
   ```

2. **CLI probe**:

   ```bash
   npx ai-figma-mcp@latest --ping
   ```

3. **Wrapper script**:

   ```bash
   #!/bin/bash
   npx ai-figma-mcp@latest &
   echo ready >/tmp/mcp-health
   wait
   ```

4. **Dockerfile**:

   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=5s \
     CMD curl -f http://localhost:8080/health || exit 1
   ```

## Logging Guidance

- Write logs to `stdout`/`stderr` so they are captured by the host.
- Use structured formats (JSON, key=value) when supported.
- Add `--log-level` or `--verbose` flags for adjustable verbosity.
- Rotate logs with `logrotate`, `pm2`, or container runtime drivers.
- Forward to centralized systems (ELK, Datadog, etc.) for search/alerts.
- Avoid logging secrets or sensitive data.
- Enable debug mode when troubleshooting:
  ```bash
  npx ai-figma-mcp@latest --debug --verbose
  ```

## Sample `mcp` Configuration Snippet

```json
{
  "name": "TalkToFigma",
  "command": "npx",
  "args": ["ai-figma-mcp@latest"],
  "env": { "FIGMA_TOKEN": "<secret-ref>" },
  "tools": ["files.read","http.fetch"],
  "workspaceAccess": { "paths": ["apps/web/src/components"], "mode": "read" },
  "restartPolicy": "on-failure",
  "logLevel": "info",
  "healthcheck": "/health"
}
```

> Adjust the snippet to match your orchestrator's format (JSON, YAML, etc.)

## Scripts

The root `package.json` includes helper scripts:

```bash
npm run mcp:talk-to-figma   # start the server interactively
npm run mcp:health          # placeholder for custom health probe
npm run mcp:logs            # view or pipe logs from your process manager
```

Swap the placeholder commands above with real checks appropriate for your
runtime.

## Security and Permissions

* Run with the least privileged `tools` list.
* Inject secrets via a vault or container secrets, not plain env.
* Restrict filesystem and network egress.

Refer to the separate security policy document for more details.
