# GitHub Analytics MCP Server

Get GitHub repository stats, search repos, analyze languages, and compare projects — powered by [nexgendata](https://apify.com/nexgendata) on Apify.

## Quick Start

### Using npx (recommended)

```bash
npx @nexgendata/github-analytics-mcp-server
```

### Install globally

```bash
npm install -g @nexgendata/github-analytics-mcp-server
```

## Configure with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
      "mcpServers": {
            "github-analytics-mcp-server": {
                  "command": "npx",
                  "args": [
                        "-y",
                        "@nexgendata/github-analytics-mcp-server"
                  ],
                  "env": {
                        "APIFY_TOKEN": "your-apify-token-optional"
                  }
            }
      }
}
```

## Configure with Cline

Add the same configuration to your Cline MCP settings.

## Available Tools

| Tool | Description |
|------|-------------|
| `get_repo_stats` | Get detailed statistics for a GitHub repository |
| `search_repos` | Search GitHub repositories |
| `get_repo_languages` | Get language breakdown for a repository |
| `compare_repos` | Compare statistics of multiple repositories |


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APIFY_TOKEN` | No | Your Apify API token for authenticated access. Without it, the server uses the public endpoint (rate-limited). |

## How It Works

This MCP server acts as a local stdio bridge to the [nexgendata Apify MCP endpoint](https://nexgendata--github-mcp-server.apify.actor/mcp). When you call a tool, it forwards the request to Apify and returns the results.

## Links

- [Apify Store](https://apify.com/nexgendata/github-mcp-server)
- [GitHub Repository](https://github.com/TheNextGenNexus/ai-analytics-mcp-servers)
- [nexgendata Blog](https://thenextgennexus.com)

## License

MIT
