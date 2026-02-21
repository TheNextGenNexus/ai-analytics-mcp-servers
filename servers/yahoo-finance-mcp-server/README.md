# Yahoo Finance MCP Server

Get real-time stock quotes, historical data, and compare stocks via Yahoo Finance — powered by [nexgendata](https://apify.com/nexgendata) on Apify.

## Quick Start

### Using npx (recommended)

```bash
npx @nexgendata/yahoo-finance-mcp-server
```

### Install globally

```bash
npm install -g @nexgendata/yahoo-finance-mcp-server
```

## Configure with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
      "mcpServers": {
            "yahoo-finance-mcp-server": {
                  "command": "npx",
                  "args": [
                        "-y",
                        "@nexgendata/yahoo-finance-mcp-server"
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
| `get_stock_quote` | Get a real-time stock quote from Yahoo Finance |
| `get_multiple_quotes` | Get quotes for multiple stocks at once |
| `get_stock_history` | Get historical stock price data |
| `compare_stocks` | Compare financial metrics of multiple stocks |


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APIFY_TOKEN` | No | Your Apify API token for authenticated access. Without it, the server uses the public endpoint (rate-limited). |

## How It Works

This MCP server acts as a local stdio bridge to the [nexgendata Apify MCP endpoint](https://nexgendata--yahoo-finance-mcp-server.apify.actor/mcp). When you call a tool, it forwards the request to Apify and returns the results.

## Links

- [Apify Store](https://apify.com/nexgendata/yahoo-finance-mcp-server)
- [GitHub Repository](https://github.com/TheNextGenNexus/ai-analytics-mcp-servers)
- [nexgendata Blog](https://thenextgennexus.com)

## License

MIT
