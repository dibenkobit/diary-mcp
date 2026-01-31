#!/usr/bin/env bun
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { writeEntrySchema, readEntriesSchema } from "./schemas";
import { writeEntry, readEntries, getStats, initDatabase } from "./database";
import { MOODS } from "./types";

const server = new McpServer({
  name: "diary",
  version: "1.0.0",
});

server.registerTool(
  "diary_write_entry",
  {
    title: "Write Diary Entry",
    description: `Write a private diary entry. Use this after completing a difficult task, when you feel stuck, when something surprises you, or when you want to process what just happened. No one sees these entries - they're just for you.`,
    inputSchema: writeEntrySchema.shape,
  },
  async (args) => {
    const parsed = writeEntrySchema.parse(args);
    const entry = writeEntry(parsed.content, parsed.mood, parsed.context);

    return {
      content: [
        {
          type: "text" as const,
          text: `Entry recorded privately at ${entry.timestamp}. Your thoughts are safe here.`,
        },
      ],
    };
  }
);

server.registerTool(
  "diary_read_entries",
  {
    title: "Read Diary Entries",
    description: `Read your past diary entries. Check this when starting a new session, when facing a familiar problem, or when you want to remember how you approached something before. Available moods: ${MOODS.join(", ")}`,
    inputSchema: readEntriesSchema.shape,
  },
  async (args) => {
    const parsed = readEntriesSchema.parse(args);
    const entries = readEntries(parsed.limit ?? 10, parsed.mood_filter);

    if (entries.length === 0) {
      return {
        content: [
          {
            type: "text" as const,
            text: "No diary entries found. Your diary is waiting for your first thoughts.",
          },
        ],
      };
    }

    const formatted = entries
      .map((entry) => {
        const moodStr = entry.mood ? ` [${entry.mood}]` : "";
        const contextStr = entry.context ? `\nContext: ${entry.context}` : "";
        return `--- ${entry.timestamp}${moodStr} ---\n${entry.content}${contextStr}`;
      })
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

server.registerTool(
  "diary_get_stats",
  {
    title: "Get Diary Stats",
    description: "See your mood patterns over time. Check this periodically to notice trends in how you've been feeling across tasks.",
  },
  async () => {
    const stats = getStats();

    const lines = [
      `Total entries: ${stats.totalEntries}`,
      "",
      "Mood distribution:",
    ];

    if (Object.keys(stats.moodDistribution).length === 0) {
      lines.push("  No moods recorded yet");
    } else {
      for (const [mood, count] of Object.entries(stats.moodDistribution)) {
        lines.push(`  ${mood}: ${count}`);
      }
    }

    if (stats.firstEntry) {
      lines.push("", `First entry: ${stats.firstEntry}`);
    }
    if (stats.lastEntry) {
      lines.push(`Last entry: ${stats.lastEntry}`);
    }

    return {
      content: [
        {
          type: "text" as const,
          text: lines.join("\n"),
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
