# ai-analytics-mcp-servers

MCP servers for financial analytics, stock data, GitHub analytics, and live sports scores — powered by [nexgendata](https://apify.com/nexgendata) on Apify.

## MCP Servers


### [Finance MCP Server](./servers/finance-mcp-server/)

Get stock data, screen stocks, track crypto prices, and monitor exchange rates

**Tools:** `get_stock_data`, `screen_stocks`, `get_crypto_prices`, `get_exchange_rates`, `track_crypto_portfolio`

**Install:** `npx @nexgendata/finance-mcp-server`

### [Yahoo Finance MCP Server](./servers/yahoo-finance-mcp-server/)

Get real-time stock quotes, historical data, and compare stocks via Yahoo Finance

**Tools:** `get_stock_quote`, `get_multiple_quotes`, `get_stock_history`, `compare_stocks`

**Install:** `npx @nexgendata/yahoo-finance-mcp-server`

### [GitHub Analytics MCP Server](./servers/github-analytics-mcp-server/)

Get GitHub repository stats, search repos, analyze languages, and compare projects

**Tools:** `get_repo_stats`, `search_repos`, `get_repo_languages`, `compare_repos`

**Install:** `npx @nexgendata/github-analytics-mcp-server`

### [Sports Scores MCP Server](./servers/sports-scores-mcp-server/)

Get live NBA, NFL, and NHL scores and game data

**Tools:** `get_nba_scores`, `get_nfl_scores`, `get_nhl_scores`, `get_all_scores`

**Install:** `npx @nexgendata/sports-scores-mcp-server`


## Quick Start

Each server can be installed independently:

```bash
# Pick the server you need
npx @nexgendata/<server-name>
```

Then add it to your Claude Desktop or Cline configuration.

## About nexgendata

nexgendata provides 64 data tools on the [Apify platform](https://apify.com/nexgendata), including 15 MCP servers for AI agent integration. Our tools cover social media, business data, web intelligence, finance, e-commerce, and more.

- **Blog:** [thenextgennexus.com](https://thenextgennexus.com)
- **Apify Store:** [apify.com/nexgendata](https://apify.com/nexgendata)
- **RapidAPI:** [rapidapi.com/rubymoonshot](https://rapidapi.com/user/rubymoonshot)

## License

MIT
