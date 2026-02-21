#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const APIFY_ENDPOINT = "https://nexgendata--finance-mcp-server.apify.actor/mcp";
const APIFY_TOKEN = process.env.APIFY_TOKEN || "";

async function callApifyTool(toolName: string, args: Record<string, unknown>): Promise<string> {
  const url = new URL(APIFY_ENDPOINT);
  if (APIFY_TOKEN) {
    url.searchParams.set("token", APIFY_TOKEN);
  }

  const body = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args
    }
  };

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Apify API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();

  if (data.error) {
    throw new Error(`Tool error: ${JSON.stringify(data.error)}`);
  }

  // Extract text content from MCP response
  const result = data.result;
  if (result?.content && Array.isArray(result.content)) {
    return result.content
      .filter((c: { type: string }) => c.type === "text")
      .map((c: { text: string }) => c.text)
      .join("\n");
  }

  return JSON.stringify(data.result, null, 2);
}

const server = new McpServer({
  name: "finance-mcp-server",
  version: "1.0.0"
});

server.registerTool(
  "get_stock_data",
  {
    title: "Get Stock Data",
    description: "Get stock price and financial data",
    inputSchema: {
      ticker: z.string().describe('Stock ticker symbol e.g. AAPL')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const result = await callApifyTool("get_stock_data", args);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "screen_stocks",
  {
    title: "Screen Stocks",
    description: "Screen stocks by criteria",
    inputSchema: {
      filters: z.string().describe('Screening criteria'),
      maxItems: z.number().default(20).describe('Maximum results')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const result = await callApifyTool("screen_stocks", args);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_crypto_prices",
  {
    title: "Get Crypto Prices",
    description: "Get cryptocurrency prices",
    inputSchema: {
      coinIds: z.array(z.string()).describe('Coin IDs e.g. bitcoin, ethereum'),
      maxItems: z.number().default(10).describe('Maximum results')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const result = await callApifyTool("get_crypto_prices", args);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "get_exchange_rates",
  {
    title: "Get Exchange Rates",
    description: "Get currency exchange rates",
    inputSchema: {
      baseCurrency: z.string().default('USD').describe('Base currency code'),
      maxItems: z.number().default(10).describe('Maximum rates')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const result = await callApifyTool("get_exchange_rates", args);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true
      };
    }
  }
);

server.registerTool(
  "track_crypto_portfolio",
  {
    title: "Track Crypto Portfolio",
    description: "Track crypto portfolio",
    inputSchema: {
      coinIds: z.array(z.string()).describe('Coin IDs to track'),
      maxResults: z.number().default(10).describe('Maximum results')
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      openWorldHint: true
    }
  },
  async (args) => {
    try {
      const result = await callApifyTool("track_crypto_portfolio", args);
      return {
        content: [{ type: "text", text: result }]
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        content: [{ type: "text", text: `Error: ${message}` }],
        isError: true
      };
    }
  }
);


// Export for Smithery sandbox scanning
export function createSandboxServer() {
  return server;
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Finance MCP Server running on stdio");
}

// Only run when executed directly, not when imported by Smithery scanner
if (process.argv[1]?.includes('index')) {
  main().catch(console.error);
}
