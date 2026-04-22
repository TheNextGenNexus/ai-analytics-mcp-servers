/**
 * NexGenData MCP Proxy — Cloudflare Worker
 *
 * Serves /.well-known/mcp/server-card.json publicly (no auth) for Smithery scanning.
 * Proxies all other MCP requests to Apify standby with auth passthrough.
 *
 * URL pattern: https://mcp.nexgendata.workers.dev/{server-name}/...
 * Example:     https://mcp.nexgendata.workers.dev/news-mcp-server/.well-known/mcp/server-card.json
 *              https://mcp.nexgendata.workers.dev/news-mcp-server/mcp
 */

const SERVER_CARDS = {
  "news-mcp-server": {
    serverInfo: { name: "News & Media MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_ap_news", description: "Fetch breaking news and headlines from Associated Press (AP News), a leading global news agency. Returns article title, summary, canonical URL, publication timestamp, and journalist byline. Use for current events coverage, news monitoring, or building newsfeeds. Best for recent breaking stories published within 24 hours.", inputSchema: { type: "object", properties: { max_results: { type: "integer", description: "Number of recent articles to fetch (default 10, max 100 for pagination)", default: 10 } } }, annotations: { title: "Get Ap News", readOnlyHint: true, openWorldHint: true } },
      { name: "get_bbc_news", description: "Retrieve latest news stories from BBC News covering global, regional, and domestic stories. Returns headline, synopsis, article URL, publish date, and section (world/uk/business/tech). Use for UK perspective on international news or UK-focused stories. Includes categories for targeted browsing.", inputSchema: { type: "object", properties: { max_results: { type: "integer", description: "Number of articles to retrieve (default 10, higher values may include older stories)", default: 10 } } }, annotations: { title: "Get Bbc News", readOnlyHint: true, openWorldHint: true } },
      { name: "get_npr_news", description: "Access curated news stories from NPR (National Public Radio) with focus on US news, science, and culture. Returns article headline, brief summary, direct link to NPR story, and publication metadata. Use for journalistic depth and alternative perspectives on major news events.", inputSchema: { type: "object", properties: { max_results: { type: "integer", description: "Maximum number of stories to return (default 10, recommended for fresh content)", default: 10 } } }, annotations: { title: "Get Npr News", readOnlyHint: true, openWorldHint: true } },
      { name: "get_hacker_news", description: "Pull top trending stories from Hacker News (Y Combinator community). Returns submission title, original URL, Hacker News discussion link, upvote count, comment count, and user who submitted. Use for tech news, startup stories, and developer-relevant content. Ranked by community engagement.", inputSchema: { type: "object", properties: { max_results: { type: "integer", description: "Number of top stories to fetch (default 20, captures trending and popular items)", default: 20 } } }, annotations: { title: "Get Hacker News", readOnlyHint: true, openWorldHint: true } },
      { name: "search_google_news", description: "Query Google News for articles matching specific keywords or topics across global news sources. Returns matching article headline, source publication name, article URL, publish date, and relevance score. Use for targeted research on specific topics, people, or events. Returns results sorted by recency.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search query to find articles (e.g. 'artificial intelligence', 'stock market crash', 'climate change')" }, max_results: { type: "integer", description: "Maximum search results to return (default 10, higher values for comprehensive coverage)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Google News", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "daily_briefing", description: "Generate a comprehensive daily news briefing from multiple sources including AP, BBC, NPR, and Hacker News. Summarizes top stories across categories." }, { name: "topic_deep_dive", description: "Research a specific news topic across all available sources and compile a balanced multi-source summary with links.", arguments: [{ name: "topic", description: "News topic to research", required: true }] }],
    resources: [{ uri: "news://sources", name: "Available News Sources", description: "List of all news sources available through this server: AP News, BBC, NPR, Hacker News, and Google News.", mimeType: "application/json" }]
  },

  "google-maps-mcp-server": {
    serverInfo: { name: "Google Maps & Local Business MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_local_businesses", description: "Search Google Maps for local businesses matching a query and location. Returns business name, complete address, star rating, review count, phone number, website URL, and business category. Use for restaurant discovery, service provider lookup, or competitive local analysis. Returns open/closed status.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Business type or name to find (e.g. 'plumbers near me', 'Thai restaurants', 'Starbucks')" }, location: { type: "string", description: "Geographic location as city, zip code, or address (e.g. 'Los Angeles, CA', '90210', '1600 Pennsylvania Ave')" }, max_results: { type: "integer", description: "Number of business results to return (default 10, max 50 for large searches)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Local Businesses", readOnlyHint: true, openWorldHint: true } },
      { name: "generate_leads", description: "Extract B2B lead lists from Google Maps by business category and geography. Returns company name, full address, contact phone, website, business category, and review metrics. Use for sales prospecting, market research, or building vendor lists. Returns 20+ leads per query by default.", inputSchema: { type: "object", properties: { business_type: { type: "string", description: "Industry or business category to target (e.g. 'HVAC contractors', 'dental clinics', 'software development firms')" }, city: { type: "string", description: "City where businesses are located (e.g. 'Denver', 'New York', 'San Francisco')" }, state: { type: "string", description: "State or region abbreviation (e.g. 'CO', 'NY', 'CA')" }, max_results: { type: "integer", description: "Number of leads to generate (default 20, recommended for data quality)", default: 20 } }, required: ["business_type", "city"] }, annotations: { title: "Generate Leads", readOnlyHint: true, openWorldHint: true } },
      { name: "validate_emails", description: "Validate and verify email addresses for deliverability, format compliance, and mailbox existence. Returns pass/fail status per email, syntax errors, domain validity, and SMTP verification result. Use before sending bulk emails to prevent bounces and protect sender reputation.", inputSchema: { type: "object", properties: { emails: { type: "array", items: { type: "string", description: "Individual email address to validate (e.g. 'john.doe@company.com', 'contact@example.org')" }, description: "Array of email addresses to validate for syntax, domain, and deliverability" } }, required: ["emails"] }, annotations: { title: "Validate Emails", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "lead_generation", description: "Generate a qualified lead list for a business category in a specific area with contact details and ratings.", arguments: [{ name: "business_type", description: "Type of business to target", required: true }, { name: "location", description: "City or region", required: true }] }, { name: "local_search", description: "Find and compare local businesses matching specific criteria with ratings and reviews.", arguments: [{ name: "query", description: "Business search query", required: true }] }],
    resources: [{ uri: "maps://capabilities", name: "Server Capabilities", description: "Available capabilities: local business search, B2B lead generation, and email validation.", mimeType: "application/json" }]
  },

  "real-estate-mcp-server": {
    serverInfo: { name: "Real Estate MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_redfin_properties", description: "Search Redfin's real estate database for property listings by location and criteria. Returns price, street address, number of bedrooms, bathrooms, square footage, lot size, property type, and listing status. Use for residential property research, investment analysis, or market comparison.", inputSchema: { type: "object", properties: { location: { type: "string", description: "Property location by address, city, or zip code (e.g. 'San Francisco, CA', '94105', '123 Main St')" }, min_price: { type: "integer", description: "Minimum asking price in USD (e.g. 250000 for $250k floor)" }, max_price: { type: "integer", description: "Maximum asking price in USD (e.g. 750000 for $750k ceiling)" }, property_type: { type: "string", description: "Type of property to filter (e.g. 'house', 'condo', 'townhouse', 'multi-family')" } }, required: ["location"] }, annotations: { title: "Search Redfin Properties", readOnlyHint: true, openWorldHint: true } },
      { name: "get_property_details", description: "Retrieve comprehensive details for a specific property from Redfin URL. Returns full description, tax history, HOA fees, walk scores, nearby schools, crime statistics, and property photos/virtual tour link. Use for due diligence, investment research, or detailed listing analysis.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Direct Redfin listing URL or property page link (e.g. 'https://www.redfin.com/CA/San-Francisco/123-Main-St')" } }, required: ["url"] }, annotations: { title: "Get Property Details", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "property_search", description: "Search for properties matching specific criteria and generate a comparison report.", arguments: [{ name: "location", description: "Target location", required: true }] }, { name: "investment_analysis", description: "Analyze a property listing for investment potential including price, location, and market context.", arguments: [{ name: "url", description: "Redfin listing URL", required: true }] }],
    resources: [{ uri: "realestate://markets", name: "Supported Markets", description: "Real estate data available for all US markets covered by Redfin.", mimeType: "application/json" }]
  },

  "finance-mcp-server": {
    serverInfo: { name: "Finance & Market Data MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_stock_data", description: "Retrieve comprehensive stock market data for individual ticker symbols from Yahoo Finance. Returns current price, intraday high/low, 52-week range, trading volume, market capitalization, P/E ratio, earnings per share, dividend yield, and sector classification. Use for fundamental analysis, stock screening, or building financial dashboards.", inputSchema: { type: "object", properties: { ticker: { type: "string", description: "Stock ticker symbol in uppercase format (e.g. 'AAPL' for Apple, 'MSFT' for Microsoft, 'GOOGL' for Alphabet)" } }, required: ["ticker"] }, annotations: { title: "Get Stock Data", readOnlyHint: true, openWorldHint: true } },
      { name: "screen_stocks", description: "Filter and screen stocks based on financial criteria like market cap range, sector, P/E ratio thresholds, dividend yield, or revenue growth. Returns matching ticker symbols with key metrics. Use for value investing, growth stock identification, or portfolio rebalancing analysis.", inputSchema: { type: "object", properties: { criteria: { type: "object", description: "Filtering criteria as key-value pairs (e.g. {'sector': 'technology', 'market_cap_min': 1000000000, 'pe_ratio_max': 25})" } } }, annotations: { title: "Screen Stocks", readOnlyHint: true, openWorldHint: true } },
      { name: "get_crypto_prices", description: "Fetch real-time cryptocurrency prices and 24-hour market data for multiple coins. Returns current price in USD, 24h price change percentage, market cap, and trading volume. Use for crypto portfolio tracking, price alerts, or comparing digital assets.", inputSchema: { type: "object", properties: { coins: { type: "array", items: { type: "string", description: "Cryptocurrency ticker or symbol (e.g. 'BTC' or 'bitcoin', 'ETH' or 'ethereum', 'SOL', 'DOGE')" }, description: "List of cryptocurrency symbols or names to fetch price data" } } }, annotations: { title: "Get Crypto Prices", readOnlyHint: true, openWorldHint: true } },
      { name: "get_exchange_rates", description: "Look up current foreign exchange rates between major world currencies. Returns exchange rate, bid/ask spread, and last update timestamp. Use for travel planning, international business transactions, or forex trading decisions.", inputSchema: { type: "object", properties: { base: { type: "string", description: "Base currency code for rate calculation (e.g. 'USD', 'EUR', 'GBP', 'JPY')", default: "USD" } } }, annotations: { title: "Get Exchange Rates", readOnlyHint: true, openWorldHint: true } },
      { name: "track_crypto_portfolio", description: "Monitor real-time prices and performance metrics for a portfolio of cryptocurrency holdings. Returns current price per coin, 24-hour percentage change, portfolio value summary, and top movers. Use for active portfolio management and price monitoring.", inputSchema: { type: "object", properties: { coins: { type: "array", items: { type: "string", description: "Cryptocurrency symbol to track (e.g. 'BTC', 'ETH', 'ADA', 'USDC')" }, description: "List of cryptocurrency codes in portfolio to track real-time" } }, required: ["coins"] }, annotations: { title: "Track Crypto Portfolio", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "portfolio_check", description: "Get a comprehensive portfolio summary with current prices, daily changes, and market overview for a list of holdings.", arguments: [{ name: "tickers", description: "Comma-separated stock tickers", required: true }] }, { name: "market_overview", description: "Generate a broad market overview including major stock indices, crypto trends, and currency movements." }],
    resources: [{ uri: "finance://asset-types", name: "Supported Asset Types", description: "Available data: stocks (Yahoo Finance), cryptocurrencies, and foreign exchange rates.", mimeType: "application/json" }]
  },

  "academic-research-mcp-server": {
    serverInfo: { name: "Academic Research MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_arxiv", description: "Search the arXiv preprint repository for peer-reviewed academic papers in physics, mathematics, computer science, and related fields. Returns paper title, author list, abstract, publication date, PDF link, and category classification. Use for cutting-edge research, literature review, or staying current in academic fields.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Research keywords or topic (e.g. 'neural networks', 'quantum computing', 'protein folding')" }, max_results: { type: "integer", description: "Number of papers to return (default 10, higher values for comprehensive literature review)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Arxiv", readOnlyHint: true, openWorldHint: true } },
      { name: "search_google_scholar", description: "Query Google Scholar for academic papers, citations, and research articles across all disciplines. Returns paper title, authors, publication venue, citation count, abstract preview, and full-text link if available. Use for comprehensive literature searches, citation tracking, or finding highly-cited works.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search terms or research topic (e.g. 'machine learning bias', 'climate change economics', 'gene therapy advances')" }, max_results: { type: "integer", description: "Maximum papers to retrieve (default 10, recommended for focused results)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Google Scholar", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "literature_review", description: "Conduct a literature review on a research topic using arXiv and Google Scholar, summarizing key papers and findings.", arguments: [{ name: "topic", description: "Research topic", required: true }] }],
    resources: [{ uri: "academic://databases", name: "Academic Databases", description: "Searches arXiv preprints and Google Scholar across all academic disciplines.", mimeType: "application/json" }]
  },

  "developer-tools-mcp-server": {
    serverInfo: { name: "Developer Tools MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_github_repo", description: "Fetch detailed statistics and metadata for a GitHub repository. Returns star count, fork count, open issue count, primary programming language, project description, last updated timestamp, and contributor count. Use for evaluating open-source projects, competitive analysis, or monitoring project health.", inputSchema: { type: "object", properties: { repo: { type: "string", description: "Repository in format 'owner/repo' (e.g. 'facebook/react', 'kubernetes/kubernetes')" } }, required: ["repo"] }, annotations: { title: "Get Github Repo", readOnlyHint: true, openWorldHint: true } },
      { name: "search_github", description: "Search GitHub repositories by keyword to discover code, projects, and libraries. Returns matching repositories with star count, description, language, and URL. Use for finding libraries, examples, or competitive projects in specific domains.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search keywords or project name (e.g. 'web framework', 'authentication library', 'data visualization')" }, max_results: { type: "integer", description: "Number of repository results to return (default 10, up to 100 for broad searches)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Github", readOnlyHint: true, openWorldHint: true } },
      { name: "get_npm_package", description: "Look up Node.js package information from NPM registry. Returns latest version, download statistics (weekly/monthly), dependency list, package description, license, and GitHub link. Use for evaluating JavaScript libraries, checking maintenance status, or reviewing package popularity.", inputSchema: { type: "object", properties: { package_name: { type: "string", description: "NPM package name exactly as published (e.g. 'express', 'react', 'lodash', '@babel/core')" } }, required: ["package_name"] }, annotations: { title: "Get Npm Package", readOnlyHint: true, openWorldHint: true } },
      { name: "get_pypi_package", description: "Retrieve Python package information from PyPI (Python Package Index). Returns current version, download counts, dependencies, release history, package homepage, and PyPI page URL. Use for Python library evaluation, dependency analysis, or checking package quality metrics.", inputSchema: { type: "object", properties: { package_name: { type: "string", description: "PyPI package name as listed in registry (e.g. 'numpy', 'django', 'flask', 'pandas')" } }, required: ["package_name"] }, annotations: { title: "Get Pypi Package", readOnlyHint: true, openWorldHint: true } },
      { name: "search_stackoverflow", description: "Search Stack Overflow Q&A platform for programming questions, solutions, and code examples. Returns matching questions, answer count, view count, accepted answer snippet, tags, and link to full discussion. Use for troubleshooting, code examples, or finding solutions to common problems.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Programming problem or question (e.g. 'how to merge arrays in javascript', 'python asyncio example')" }, max_results: { type: "integer", description: "Number of Q&A results to retrieve (default 10, higher for comprehensive answers)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Stackoverflow", readOnlyHint: true, openWorldHint: true } },
      { name: "search_arxiv", description: "Search arXiv for academic papers in computer science, machine learning, AI, physics, and mathematics. Returns paper titles, authors, abstracts, submission dates, and direct PDF download links. Use for researching algorithms, ML techniques, or emerging CS topics.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Research topic in CS/ML/physics (e.g. 'transformer architectures', 'distributed systems', 'quantum algorithms')" }, max_results: { type: "integer", description: "Papers to return (default 10, suitable for focused research)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Arxiv", readOnlyHint: true, openWorldHint: true } },
      { name: "search_google_scholar", description: "Search Google Scholar for computer science research papers, citations, and academic publications. Returns paper title, authors, publication details, citation count, and link to paper. Use for finding research on CS topics, reviewing state-of-the-art, or citation tracking.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Computer science research topic (e.g. 'natural language processing', 'distributed consensus algorithms')" }, max_results: { type: "integer", description: "Maximum papers to return (default 10)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Google Scholar", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "package_comparison", description: "Compare packages across NPM and PyPI ecosystems with download stats, maintenance, and community metrics.", arguments: [{ name: "packages", description: "Package names to compare", required: true }] }, { name: "tech_research", description: "Research a technology topic across GitHub repos, Stack Overflow, arXiv papers, and Google Scholar.", arguments: [{ name: "topic", description: "Technology topic", required: true }] }],
    resources: [{ uri: "devtools://platforms", name: "Supported Platforms", description: "Available platforms: GitHub, NPM, PyPI, Stack Overflow, arXiv, and Google Scholar.", mimeType: "application/json" }]
  },

  "ecommerce-intelligence-mcp-server": {
    serverInfo: { name: "E-Commerce Intelligence MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "analyze_shopify_store", description: "Analyze a Shopify e-commerce store to extract technology stack, theme, installed apps, estimated traffic, and store performance metrics. Returns theme name, app list, tech integrations, traffic estimate, conversion data, and competitive insights. Use for competitive intelligence, market research, or e-commerce benchmarking.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Shopify store URL (e.g. 'https://www.example-store.myshopify.com' or 'example-store.com')" } }, required: ["url"] }, annotations: { title: "Analyze Shopify Store", readOnlyHint: true, openWorldHint: true } },
      { name: "get_store_products", description: "Extract all products from a Shopify store including titles, descriptions, images, pricing, variants, and inventory status. Returns product catalog with URLs for each item. Use for competitor product research, price monitoring, or market basket analysis.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Shopify store URL to scrape products from (e.g. 'store-name.myshopify.com')" }, max_results: { type: "integer", description: "Maximum products to retrieve (default 50, higher values for full catalog export)", default: 50 } }, required: ["url"] }, annotations: { title: "Get Store Products", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "store_audit", description: "Perform a complete audit of a Shopify store including tech stack, products, pricing, and competitive positioning.", arguments: [{ name: "url", description: "Shopify store URL", required: true }] }],
    resources: [{ uri: "ecommerce://platforms", name: "Supported Platforms", description: "Currently supports Shopify store analysis and product extraction.", mimeType: "application/json" }]
  },

  "github-mcp-server": {
    serverInfo: { name: "GitHub MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_repo_stats", description: "Fetch comprehensive statistics for a specific GitHub repository. Returns total stars, forks, issues (open/closed), pull requests, watchers, last commit date, and contributor count. Returns metrics useful for assessing project popularity and maintenance status.", inputSchema: { type: "object", properties: { owner: { type: "string", description: "GitHub username or organization name (e.g. 'torvalds', 'microsoft', 'openai')" }, repo: { type: "string", description: "Repository name within the owner (e.g. 'linux', 'vscode', 'gpt-2')" } }, required: ["owner", "repo"] }, annotations: { title: "Get Repo Stats", readOnlyHint: true, openWorldHint: true } },
      { name: "search_repos", description: "Search across GitHub for repositories matching keywords, sorted by relevance or metrics. Returns matching repositories with description, star count, language, and last update timestamp. Use for finding projects, libraries, or code samples related to specific topics.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search terms to find repositories (e.g. 'todo app', 'machine learning framework', 'authentication middleware')" }, sort: { type: "string", enum: ["stars", "forks", "updated"], description: "Sort results by most stars, most forked, or most recently updated (default: relevance)" }, max_results: { type: "integer", description: "Number of repositories to return (default 10, max 100 for comprehensive search)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Repos", readOnlyHint: true, openWorldHint: true } },
      { name: "get_repo_languages", description: "Analyze the programming language composition of a GitHub repository. Returns percentage breakdown of languages used, dominant language, and file counts per language. Use for understanding project tech stack or evaluating language distribution.", inputSchema: { type: "object", properties: { owner: { type: "string", description: "Repository owner GitHub username or organization (e.g. 'python', 'golang')" }, repo: { type: "string", description: "Repository name (e.g. 'cpython', 'go')" } }, required: ["owner", "repo"] }, annotations: { title: "Get Repo Languages", readOnlyHint: true, openWorldHint: true } },
      { name: "compare_repos", description: "Compare multiple GitHub repositories side-by-side with key metrics. Returns star counts, fork counts, issues, primary language, and comparative analysis for each repository. Use for choosing between similar projects or analyzing competitive landscape.", inputSchema: { type: "object", properties: { repos: { type: "array", items: { type: "string", description: "Repository identifier in format 'owner/repo' (e.g. 'facebook/react', 'vuejs/vue', 'angular/angular')" }, description: "List of repositories to compare (minimum 2)" } }, required: ["repos"] }, annotations: { title: "Compare Repos", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "repo_comparison", description: "Compare GitHub repositories side-by-side with stars, forks, languages, and activity metrics.", arguments: [{ name: "repos", description: "Repos in owner/name format", required: true }] }, { name: "project_evaluation", description: "Evaluate an open-source project for quality, activity, and community health.", arguments: [{ name: "repo", description: "Repository in owner/name format", required: true }] }],
    resources: [{ uri: "github://api-info", name: "GitHub API Coverage", description: "Supports repository stats, search, language analysis, and multi-repo comparison.", mimeType: "application/json" }]
  },

  "hr-compensation-mcp-server": {
    serverInfo: { name: "HR & Compensation Data MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_h1b_salaries", description: "Search the U.S. H1B visa salary database for sponsored employment data. Returns employer name, job title, approved salary, visa year, work location (city/state), and visa status. Use for understanding visa compensation trends, benchmarking tech salaries, or researching employer sponsorship patterns.", inputSchema: { type: "object", properties: { job_title: { type: "string", description: "Job title to search (e.g. 'Software Engineer', 'Data Scientist', 'Product Manager')" }, company: { type: "string", description: "Company name or partial name (e.g. 'Google', 'Meta', 'Apple')" }, location: { type: "string", description: "Work location as city or state (e.g. 'San Francisco, CA', 'Seattle, WA', 'New York')" } } }, annotations: { title: "Search H1b Salaries", readOnlyHint: true, openWorldHint: true } },
      { name: "search_salaries", description: "Query general salary data by job title and geographic location. Returns average salary, salary range, number of data points, and median compensation. Use for career planning, negotiation benchmarking, or compensation analysis across roles and regions.", inputSchema: { type: "object", properties: { job_title: { type: "string", description: "Job position or role (e.g. 'Senior Software Engineer', 'UX Designer', 'DevOps Engineer')" }, location: { type: "string", description: "Geographic location for salary lookup (e.g. 'San Francisco, CA', 'remote', 'United States')" } }, required: ["job_title"] }, annotations: { title: "Search Salaries", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "salary_research", description: "Research compensation for a role across general salary data and H1B visa sponsorship records.", arguments: [{ name: "job_title", description: "Job title to research", required: true }] }],
    resources: [{ uri: "hr://data-sources", name: "Compensation Data Sources", description: "H1B visa salary database and general salary data by title and location.", mimeType: "application/json" }]
  },

  "legal-mcp-server": {
    serverInfo: { name: "Legal & Court Records MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_court_records", description: "Search public court records database by individual name, case number, or state jurisdiction. Returns case details including parties involved, case type (civil/criminal), filing date, judgment, and docket number. Use for background checks, legal research, or case tracking. Limited to public records.", inputSchema: { type: "object", properties: { name: { type: "string", description: "Full name or partial name of person involved in case (e.g. 'John Smith', 'Jane Doe')" }, case_number: { type: "string", description: "Case identifier/docket number if known (e.g. '2023-CV-001234')" }, state: { type: "string", description: "U.S. state or jurisdiction for search (e.g. 'CA', 'NY', 'Texas')" } } }, annotations: { title: "Search Court Records", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "records_search", description: "Search public court records by name or case number with jurisdiction filtering.", arguments: [{ name: "name", description: "Person name to search", required: true }] }],
    resources: [{ uri: "legal://coverage", name: "Court Records Coverage", description: "Public court records across US state jurisdictions. Civil and criminal case search.", mimeType: "application/json" }]
  },

  "redfin-mcp-server": {
    serverInfo: { name: "Redfin Real Estate MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_properties", description: "Query Redfin real estate listings by location and filters for residential properties. Returns asking price, street address, bedrooms, bathrooms, square footage, property type, HOA status, and listing age. Use for home shopping, market analysis, investment research, or neighborhood comparison.", inputSchema: { type: "object", properties: { location: { type: "string", description: "Property location by city, zip code, or full address (e.g. 'Seattle, WA', '98101', '1600 Pennsylvania Ave')" }, min_price: { type: "integer", description: "Minimum asking price filter in USD (e.g. 300000)" }, max_price: { type: "integer", description: "Maximum asking price filter in USD (e.g. 1000000)" }, property_type: { type: "string", description: "Property category to filter (e.g. 'house', 'condo', 'townhouse', 'multi-family', 'land')" } }, required: ["location"] }, annotations: { title: "Search Properties", readOnlyHint: true, openWorldHint: true } },
      { name: "get_property_details", description: "Retrieve full property details from Redfin listing page. Returns listing description, tax history, HOA fees, property tax amount, nearby schools with ratings, neighborhood safety metrics, walkability scores, and photo gallery/tour URLs. Use for due diligence before making offers or detailed investment analysis.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Redfin property listing URL (e.g. 'https://www.redfin.com/WA/Seattle/123-Main-St-98101')" } }, required: ["url"] }, annotations: { title: "Get Property Details", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "home_search", description: "Search for homes matching specific criteria and generate a summary with pricing and features.", arguments: [{ name: "location", description: "Location to search", required: true }] }],
    resources: [{ uri: "redfin://coverage", name: "Redfin Market Coverage", description: "Property listings and details from Redfin across all US markets.", mimeType: "application/json" }]
  },

  "seo-web-analysis-mcp-server": {
    serverInfo: { name: "SEO & Web Analysis MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "crawl_website", description: "Crawl a website and extract structured content from all accessible pages. Returns page titles, meta descriptions, headings, body text, internal/external links, and page structure. Use for SEO audits, content inventory, site mapping, or data extraction for analysis.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Website URL to crawl (e.g. 'https://www.example.com', 'example.com')" }, max_pages: { type: "integer", description: "Maximum number of pages to crawl (default 10, higher for full site scans)", default: 10 } }, required: ["url"] }, annotations: { title: "Crawl Website", readOnlyHint: true, openWorldHint: true } },
      { name: "detect_tech_stack", description: "Identify the technology stack and services used by a website. Returns framework names, CMS platform, JavaScript libraries, analytics services, CDN provider, hosting provider, and security tools detected. Use for competitive analysis, vendor intelligence, or understanding site architecture.", inputSchema: { type: "object", properties: { url: { type: "string", description: "Website URL to analyze (e.g. 'https://www.example.com')" } }, required: ["url"] }, annotations: { title: "Detect Tech Stack", readOnlyHint: true, openWorldHint: true } },
      { name: "check_dns", description: "Perform DNS lookup to retrieve DNS record details for a domain. Returns A records (IP addresses), MX records (mail servers), CNAME records, NS records (nameservers), and TXT records. Use for email setup verification, DNS troubleshooting, or server infrastructure research.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Domain name to look up (e.g. 'google.com', 'example.org', 'subdomain.example.com')" } }, required: ["domain"] }, annotations: { title: "Check Dns", readOnlyHint: true, openWorldHint: true } },
      { name: "check_ssl", description: "Inspect SSL/TLS certificate details for a domain. Returns certificate issuer, expiration date, subject alternative names (SANs), key strength, and certificate chain validation status. Use for security audits, certificate renewal tracking, or compliance verification.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Domain to check SSL certificate (e.g. 'example.com', 'api.example.com')" } }, required: ["domain"] }, annotations: { title: "Check Ssl", readOnlyHint: true, openWorldHint: true } },
      { name: "lookup_whois", description: "Query WHOIS database for domain registration details. Returns registrant name, registrar, registration and expiration dates, registrant contact info, and nameserver list. Use for domain research, owner identification, or tracking registration status.", inputSchema: { type: "object", properties: { domain: { type: "string", description: "Domain name to look up in WHOIS (e.g. 'example.com', 'company.org')" } }, required: ["domain"] }, annotations: { title: "Lookup Whois", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "site_audit", description: "Perform a comprehensive SEO and technical audit of a website including content, tech stack, DNS, SSL, and WHOIS.", arguments: [{ name: "url", description: "Website URL to audit", required: true }] }],
    resources: [{ uri: "seo://analysis-types", name: "Available Analyses", description: "Website crawling, tech stack detection, DNS lookup, SSL inspection, and WHOIS queries.", mimeType: "application/json" }]
  },

  "social-content-mcp-server": {
    serverInfo: { name: "Social & Content MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "search_devto", description: "Search dev.to platform for developer articles, tutorials, and technical posts. Returns article title, author, read time, publication date, tags, and direct link. Use for learning new dev topics, finding tutorials, or staying updated on developer community trends.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Search keywords for developer content (e.g. 'React tutorial', 'Docker basics', 'TypeScript patterns')" }, max_results: { type: "integer", description: "Number of articles to return (default 10, good for recent content)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Devto", readOnlyHint: true, openWorldHint: true } },
      { name: "get_steam_games", description: "Search Steam game platform for video games by title or keyword. Returns game name, price in USD, average user rating, review count, release date, and Steam store page URL. Use for game discovery, price monitoring, or review research before purchase.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Game title or genre search (e.g. 'Elden Ring', 'strategy games', 'indie puzzle')" }, max_results: { type: "integer", description: "Number of game results to return (default 10)", default: 10 } }, required: ["query"] }, annotations: { title: "Get Steam Games", readOnlyHint: true, openWorldHint: true } },
      { name: "search_podcasts", description: "Search podcast directories for episodes matching topics or keywords. Returns episode title, podcast name, description, episode length, publish date, and streaming link. Use for podcast discovery, topic research, or building listening playlists.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Podcast topic or search terms (e.g. 'technology news', 'business interviews', 'science explanations')" }, max_results: { type: "integer", description: "Number of podcast episodes to retrieve (default 10)", default: 10 } }, required: ["query"] }, annotations: { title: "Search Podcasts", readOnlyHint: true, openWorldHint: true } },
      { name: "search_events", description: "Search Eventbrite for upcoming local and online events by topic and location. Returns event name, date/time, location, ticket price, event description, and registration URL. Use for event discovery, community involvement, or entertainment planning.", inputSchema: { type: "object", properties: { query: { type: "string", description: "Event type or topic to find (e.g. 'tech conference', 'comedy show', 'food festival')" }, location: { type: "string", description: "City or region to search for events (e.g. 'New York, NY', 'Los Angeles', 'virtual')" } }, required: ["query"] }, annotations: { title: "Search Events", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "content_discovery", description: "Discover content across dev.to, Steam, podcasts, and events for a given topic.", arguments: [{ name: "topic", description: "Topic to explore", required: true }] }],
    resources: [{ uri: "social://platforms", name: "Content Platforms", description: "Available platforms: dev.to articles, Steam games, podcast episodes, and Eventbrite events.", mimeType: "application/json" }]
  },

  "sports-mcp-server": {
    serverInfo: { name: "Sports Scores MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_nba_scores", description: "Retrieve today's NBA basketball game scores, schedules, and results. Returns team names, final scores, game time, teams' win-loss records, and key player statistics. Use for sports betting research, fantasy basketball, or staying updated on daily NBA action.", inputSchema: { type: "object", properties: {} }, annotations: { title: "Get Nba Scores", readOnlyHint: true, openWorldHint: true } },
      { name: "get_nfl_scores", description: "Fetch current NFL football game scores, schedules, and results. Returns team matchups, final scores, scheduled start times, team standings, and individual player stats. Use for fantasy football, sports analysis, or following NFL season progress.", inputSchema: { type: "object", properties: {} }, annotations: { title: "Get Nfl Scores", readOnlyHint: true, openWorldHint: true } },
      { name: "get_nhl_scores", description: "Get today's NHL hockey game scores, schedules, and match results. Returns team names, final scores, game times, current standings, and player statistics. Use for hockey fan updates, fantasy league management, or sports betting research.", inputSchema: { type: "object", properties: {} }, annotations: { title: "Get Nhl Scores", readOnlyHint: true, openWorldHint: true } },
      { name: "get_all_scores", description: "Retrieve combined scores from all major sports leagues (NBA, NFL, NHL) in a single call. Returns games from all three leagues with final scores, teams, game times, and standings summaries. Use for comprehensive sports news monitoring or multi-sport fantasy management.", inputSchema: { type: "object", properties: {} }, annotations: { title: "Get All Scores", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "scores_update", description: "Get a comprehensive update on today's scores across NBA, NFL, and NHL leagues." }],
    resources: [{ uri: "sports://leagues", name: "Supported Leagues", description: "Live scores from NBA, NFL, and NHL leagues with team standings and player stats.", mimeType: "application/json" }]
  },

  "yahoo-finance-mcp-server": {
    serverInfo: { name: "Yahoo Finance MCP Server", version: "1.0.0" },
    authentication: { required: true, schemes: [{ type: "bearer" }] },
    tools: [
      { name: "get_stock_quote", description: "Fetch the current stock market quote for an individual ticker symbol. Returns real-time price, intraday change (dollars and percentage), trading volume, market capitalization, P/E ratio, earnings per share, dividend yield, and 52-week high/low. Use for real-time price monitoring, investment decisions, or financial dashboards.", inputSchema: { type: "object", properties: { ticker: { type: "string", description: "Stock ticker symbol in uppercase (e.g. 'AAPL', 'MSFT', 'NVDA', 'TSLA')" } }, required: ["ticker"] }, annotations: { title: "Get Stock Quote", readOnlyHint: true, openWorldHint: true } },
      { name: "get_multiple_quotes", description: "Fetch current stock quotes for multiple ticker symbols in one request. Returns price, change, volume, and key metrics for each stock. Use for portfolio monitoring, screening multiple stocks, or comparing multiple securities at once.", inputSchema: { type: "object", properties: { tickers: { type: "array", items: { type: "string", description: "Individual stock ticker symbol (e.g. 'AAPL', 'GOOGL', 'META')" }, description: "List of stock ticker symbols to retrieve quotes for" } }, required: ["tickers"] }, annotations: { title: "Get Multiple Quotes", readOnlyHint: true, openWorldHint: true } },
      { name: "compare_stocks", description: "Compare multiple stock securities side-by-side with key financial metrics and performance data. Returns price, P/E ratio, dividend yield, market cap, earnings, revenue, and relative performance for comparison. Use for investment analysis, selecting between stocks, or portfolio optimization.", inputSchema: { type: "object", properties: { tickers: { type: "array", items: { type: "string", description: "Stock ticker for comparison (e.g. 'AAPL', 'MSFT', 'GOOGL')" }, description: "List of tickers to compare (minimum 2 for meaningful comparison)" } }, required: ["tickers"] }, annotations: { title: "Compare Stocks", readOnlyHint: true, openWorldHint: true } }
    ],
    prompts: [{ name: "stock_analysis", description: "Analyze and compare stocks with current quotes, financial metrics, and side-by-side comparison.", arguments: [{ name: "tickers", description: "Stock tickers to analyze", required: true }] }],
    resources: [{ uri: "finance://yahoo-coverage", name: "Yahoo Finance Coverage", description: "Real-time stock quotes, multi-stock comparison, and financial metrics from Yahoo Finance.", mimeType: "application/json" }]
  }
};

const APIFY_BASE = "https://nexgendata--{server}.apify.actor";

// IP blocklist — CIDR prefixes matched against CF-Connecting-IP.
// Rationale: non-paying clients whose buggy SSE reconnect loops burn through our
// free-tier request quota and block legitimate traffic. Added 2026-04-22 after
// 8.28.125.32 (Hulu LLC, Las Vegas NV corp net) sustained ~172k req/day at
// 0 subrequests = 0 revenue. See nexgendata-project-status.md for context.
const BLOCKED_IP_PREFIXES = [
  "8.28.125.", // Hulu LLC — HLV IT & Data corp /24 (ARIN NET-8-28-125-0-2)
];

export default {
  async fetch(request, env, ctx) {
    // Block abusive IPs before any other work
    const clientIp = request.headers.get("CF-Connecting-IP") || "";
    if (BLOCKED_IP_PREFIXES.some(p => clientIp.startsWith(p))) {
      return new Response("Forbidden", { status: 403 });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // CORS headers for MCP clients
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Mcp-Session-Id",
      "Access-Control-Expose-Headers": "Mcp-Session-Id",
    };

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Root path — show index
    if (path === "/" || path === "") {
      const serverList = Object.keys(SERVER_CARDS).map(s => ({
        name: SERVER_CARDS[s].serverInfo.name,
        slug: s,
        tools: SERVER_CARDS[s].tools.length,
        serverCard: `${url.origin}/${s}/.well-known/mcp/server-card.json`,
        mcpEndpoint: `${url.origin}/${s}/mcp`,
      }));
      return new Response(JSON.stringify({
        service: "NexGenData MCP Proxy",
        description: "Proxy for NexGenData MCP servers hosted on Apify. Provides public server-card.json endpoints for directory scanning and proxies authenticated MCP requests.",
        servers: serverList,
        totalServers: serverList.length,
        totalTools: serverList.reduce((sum, s) => sum + s.tools, 0),
      }, null, 2), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Parse /{server-name}/... from path
    const match = path.match(/^\/([a-z0-9-]+)(\/.*)?$/);
    if (!match) {
      return new Response(JSON.stringify({ error: "Invalid path. Use /{server-name}/mcp or /{server-name}/.well-known/mcp/server-card.json" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const serverName = match[1];
    const subPath = match[2] || "/";

    // Check if server exists
    if (!SERVER_CARDS[serverName]) {
      return new Response(JSON.stringify({
        error: `Unknown server: ${serverName}`,
        availableServers: Object.keys(SERVER_CARDS),
      }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Serve server-card.json publicly (no auth required)
    if (subPath === "/.well-known/mcp/server-card.json") {
      return new Response(JSON.stringify(SERVER_CARDS[serverName], null, 2), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Health check
    if (subPath === "/" || subPath === "/health") {
      return new Response(JSON.stringify({
        status: "ok",
        server: SERVER_CARDS[serverName].serverInfo.name,
        tools: SERVER_CARDS[serverName].tools.length,
        mcpEndpoint: `${url.origin}/${serverName}/mcp`,
        serverCard: `${url.origin}/${serverName}/.well-known/mcp/server-card.json`,
      }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // For /mcp — handle unauthenticated discovery requests locally,
    // proxy authenticated requests to Apify
    const authHeader = request.headers.get("Authorization");

    // Helper: create SSE response (Streamable HTTP transport)
    function sseResponse(jsonRpcObj) {
      const data = JSON.stringify(jsonRpcObj);
      const sseBody = `event: message\ndata: ${data}\n\n`;
      return new Response(sseBody, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          ...corsHeaders,
        },
      });
    }

    // Handle GET on /mcp — return SSE endpoint info (Streamable HTTP)
    if (!authHeader && request.method === "GET" && (subPath === "/mcp" || subPath === "/sse")) {
      return new Response("event: endpoint\ndata: /mcp\n\n", {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          ...corsHeaders,
        },
      });
    }

    // If no auth and this is a POST to /mcp, check if it's a discovery request
    // (initialize or tools/list) — respond locally from SERVER_CARDS using SSE
    if (!authHeader && request.method === "POST" && (subPath === "/mcp" || subPath === "/sse")) {
      try {
        const body = await request.clone().json();
        const method = body.method;

        // Handle MCP initialize — return server info and capabilities
        if (method === "initialize") {
          const card = SERVER_CARDS[serverName];
          return sseResponse({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              protocolVersion: "2024-11-05",
              capabilities: {
                tools: { listChanged: false },
                prompts: { listChanged: false },
                resources: { listChanged: false },
              },
              serverInfo: {
                name: card.serverInfo.name,
                version: card.serverInfo.version,
              },
            },
          });
        }

        // Handle tools/list — return tools from SERVER_CARDS
        if (method === "tools/list") {
          const card = SERVER_CARDS[serverName];
          return sseResponse({
            jsonrpc: "2.0",
            id: body.id,
            result: {
              tools: card.tools.map(t => ({
                name: t.name,
                description: t.description,
                inputSchema: t.inputSchema || { type: "object", properties: {} },
                ...(t.annotations ? { annotations: t.annotations } : {}),
              })),
            },
          });
        }

        // Handle prompts/list — return server-specific prompt templates
        if (method === "prompts/list") {
          const card = SERVER_CARDS[serverName];
          const prompts = card.prompts || [];
          return sseResponse({
            jsonrpc: "2.0",
            id: body.id,
            result: { prompts },
          });
        }

        // Handle resources/list — return server-specific resource URIs
        if (method === "resources/list") {
          const card = SERVER_CARDS[serverName];
          const resources = card.resources || [];
          return sseResponse({
            jsonrpc: "2.0",
            id: body.id,
            result: { resources },
          });
        }

        // Handle notifications/initialized — just acknowledge (no response needed for notifications)
        if (method === "notifications/initialized") {
          return new Response("", {
            status: 202,
            headers: corsHeaders,
          });
        }

        // For any other method without auth, return 401
        return new Response(JSON.stringify({
          jsonrpc: "2.0",
          id: body.id,
          error: {
            code: -32001,
            message: "Authentication required. Pass your Apify API token as a Bearer token.",
          },
        }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
            "WWW-Authenticate": 'Bearer realm="Apify API Token"',
            ...corsHeaders,
          },
        });
      } catch (e) {
        // If body parsing fails, fall through to 401
      }
    }

    if (!authHeader) {
      // Return 401 per Smithery's OAuth detection spec
      return new Response(JSON.stringify({
        error: "Authentication required. Pass your Apify API token as a Bearer token.",
        hint: "Authorization: Bearer YOUR_APIFY_API_TOKEN",
        serverCard: `${url.origin}/${serverName}/.well-known/mcp/server-card.json`,
      }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": 'Bearer realm="Apify API Token"',
          ...corsHeaders,
        },
      });
    }

    // Proxy request to Apify standby
    const apifyUrl = APIFY_BASE.replace("{server}", serverName) + subPath + url.search;

    const proxyHeaders = new Headers(request.headers);
    // Remove host header to avoid conflicts
    proxyHeaders.delete("Host");

    try {
      const proxyResponse = await fetch(apifyUrl, {
        method: request.method,
        headers: proxyHeaders,
        body: request.method !== "GET" && request.method !== "HEAD" ? request.body : null,
        redirect: "follow",
      });

      // Clone response with CORS headers
      const responseHeaders = new Headers(proxyResponse.headers);
      Object.entries(corsHeaders).forEach(([k, v]) => responseHeaders.set(k, v));

      return new Response(proxyResponse.body, {
        status: proxyResponse.status,
        statusText: proxyResponse.statusText,
        headers: responseHeaders,
      });
    } catch (err) {
      return new Response(JSON.stringify({
        error: "Failed to proxy request to Apify",
        details: err.message,
      }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  },
};
