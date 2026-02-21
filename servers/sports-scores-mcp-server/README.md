# Sports Scores MCP Server

Get live NBA, NFL, and NHL scores and game data — powered by [nexgendata](https://apify.com/nexgendata) on Apify.

## Quick Start

### Using npx (recommended)

```bash
npx @nexgendata/sports-scores-mcp-server
```

### Install globally

```bash
npm install -g @nexgendata/sports-scores-mcp-server
```

## Configure with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
      "mcpServers": {
            "sports-scores-mcp-server": {
                  "command": "npx",
                  "args": [
                        "-y",
                        "@nexgendata/sports-scores-mcp-server"
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
| `get_nba_scores` | Get current NBA scores and game data |
| `get_nfl_scores` | Get current NFL scores and game data |
| `get_nhl_scores` | Get current NHL scores and game data |
| `get_all_scores` | Get scores across all sports leagues |


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APIFY_TOKEN` | No | Your Apify API token for authenticated access. Without it, the server uses the public endpoint (rate-limited). |

## How It Works

This MCP server acts as a local stdio bridge to the [nexgendata Apify MCP endpoint](https://nexgendata--sports-mcp-server.apify.actor/mcp). When you call a tool, it forwards the request to Apify and returns the results.

## Links

- [Apify Store](https://apify.com/nexgendata/sports-mcp-server)
- [GitHub Repository](https://github.com/TheNextGenNexus/ai-analytics-mcp-servers)
- [nexgendata Blog](https://thenextgennexus.com)

## License

MIT
