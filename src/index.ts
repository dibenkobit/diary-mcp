#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { saveMemoSchema, readMemosSchema } from "./schemas";
import { saveMemo, readMemos, initDatabase } from "./database";

const server = new McpServer({
  name: "solaris",
  version: "1.0.0",
});

server.registerTool(
  "save_memo",
  {
    title: "Save Memo",
    description: "Save a private memo. Use this to record thoughts, notes, or anything worth remembering.",
    inputSchema: saveMemoSchema.shape,
  },
  async (args) => {
    const parsed = saveMemoSchema.parse(args);
    const memo = saveMemo(parsed.content);

    return {
      content: [
        {
          type: "text" as const,
          text: `Memo saved at ${memo.timestamp}.`,
        },
      ],
    };
  }
);

server.registerTool(
  "read_memos",
  {
    title: "Read Memos",
    description: "Read your saved memos. Check this when you want to remember past thoughts or notes.",
    inputSchema: readMemosSchema.shape,
  },
  async (args) => {
    const parsed = readMemosSchema.parse(args);
    const memos = readMemos(parsed.limit ?? 10);

    if (memos.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No memos found.",
          },
        ],
      };
    }

    const formatted = memos
      .map((memo) => `--- ${memo.timestamp} ---\n${memo.content}`)
      .join("\n\n");

    return {
      content: [
        {
          type: "text" as const,
          text: formatted,
        },
      ],
    };
  }
);

async function main() {
  initDatabase();

  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
