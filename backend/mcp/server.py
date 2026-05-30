"""Gnosis MCP Server — exposes Gnosis tools to Claude Desktop and other MCP clients."""

import asyncio
import sys
from pathlib import Path

# Allow imports from backend/
sys.path.insert(0, str(Path(__file__).parent.parent))

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool

import tools as gnosis_tools

app = Server("gnosis")


@app.list_tools()
async def list_tools() -> list[Tool]:
    return gnosis_tools.TOOL_DEFINITIONS


@app.call_tool()
async def call_tool(name: str, arguments: dict):
    handler = gnosis_tools.TOOL_HANDLERS.get(name)
    if handler is None:
        raise ValueError(f"Unknown tool: {name}")
    return await handler(arguments)


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
