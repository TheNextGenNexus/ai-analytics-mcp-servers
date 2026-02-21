# Finance MCP Server

Get stock data, screen stocks, track crypto prices, and monitor exchange rates — powered by [nexgendata](https://apify.com/nexgendata) on Apify.

## Quick Start

### Using npx (recommended)

```bash
npx @nexgendata/finance-mcp-server
```

### Install globally

```bash
npm install -g @nexgendata/finance-mcp-server
```

## Configure with Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
      "mcpServers": {
            "finance-mcp-server": {
                  "command": "npx",
                  "args": [
                        "-y",
                        "@nexgendata/finance-mcp-server"
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
| `get_stock_data` | Get stock price and financial data for a ticker |
| `screen_stocks` | Screen stocks by financial criteria using Finviz |
| `get_crypto_prices` | Get current cryptocurrency prices |
| `get_exchange_rates` | Get currency exchange rates |
| `track_crypto_portfolio` | Track a cryptocurrency portfolio |


## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `APIFY_TOKEN` | No | Your Apify API token for authenticated access. Without it, the server uses the public endpoint (rate-limited). |

## How It Works

This MCP server acts as a local stdio bridge to the [nexgendata Apify MCP endpoint](https://nexgendata--finance-mcp-server.apify.actor/mcp). When you call a tool, it forwards the request to Apify and returns the results.

## Links

- [Apify Store](https://apify.com/nexgendata/finance-mcp-server)
- [GitHub Repository](https://github.com/TheNextGenNexus/ai-analytics-mcp-servers)
- [nexgendata Blog](https://thenextgennexus.com)

## License

MIT
