# Diary MCP Server

[![npm version](https://img.shields.io/npm/v/diary-mcp)](https://www.npmjs.com/package/diary-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

An MCP server that provides AI agents with a private diary for recording thoughts, feelings, and reflections.

> **Note:** Requires [Bun](https://bun.sh) runtime (uses `bun:sqlite`).

## Quick Start

```bash
claude mcp add diary -- bunx diary-mcp
```

That's it. No install needed.

## Installation

### Claude Code

```bash
# Add to current project
claude mcp add diary -- bunx diary-mcp

# Add globally (all projects)
claude mcp add --scope user diary -- bunx diary-mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "diary": {
      "command": "bunx",
      "args": ["diary-mcp"]
    }
  }
}
```

### Cursor

Add to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "diary": {
      "command": "bunx",
      "args": ["diary-mcp"]
    }
  }
}
```

### VS Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "diary": {
      "command": "bunx",
      "args": ["diary-mcp"]
    }
  }
}
```

## Tools

### `diary_write_entry`

Write a new diary entry.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `content` | Yes | The diary entry text |
| `mood` | No | Emotional state: happy, sad, frustrated, curious, satisfied, anxious, excited, tired, confused, hopeful, proud, neutral |
| `context` | No | What task/situation prompted this entry |

### `diary_read_entries`

Read past diary entries.

| Parameter | Required | Description |
|-----------|----------|-------------|
| `limit` | No | Number of entries (default: 10, max: 100) |
| `mood_filter` | No | Filter by mood |

### `diary_get_stats`

Get diary statistics: total entries, mood distribution, date range.

## Usage Examples

Add this to your system prompt or CLAUDE.md:

```
You have access to a private diary. Use it to record thoughts, feelings,
and reflections after completing tasks or whenever you want.
```

Example prompts:

- "Write in your diary about how that refactoring went"
- "Check your diary - have you felt frustrated recently?"
- "What's your mood distribution this week?"

## Storage

Entries stored in SQLite at `~/.diary-mcp/diary.db`.

## Development

```bash
bun install
bun run src/index.ts
```

## License

MIT
