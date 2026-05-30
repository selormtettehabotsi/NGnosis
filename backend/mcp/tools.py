"""MCP tool definitions and handlers for Gnosis."""

from mcp.types import TextContent, Tool

from vector_store import get_vector_store
from prompts.socratic_tutor import build_tutor_prompt
from prompts.gap_detector import build_gap_detector_prompt
from prompts.summary_writer import build_summary_prompt

import anthropic
from config import get_settings

_settings = get_settings()
_client = anthropic.Anthropic(api_key=_settings.anthropic_api_key)


# ---------------------------------------------------------------------------
# Tool definitions (JSON Schema)
# ---------------------------------------------------------------------------

TOOL_DEFINITIONS: list[Tool] = [
    Tool(
        name="search_knowledge_base",
        description="Search the Gnosis vector store for relevant document chunks.",
        inputSchema={
            "type": "object",
            "properties": {
                "course_id": {"type": "integer", "description": "Course to search within"},
                "query": {"type": "string", "description": "Search query"},
                "n_results": {"type": "integer", "default": 5},
            },
            "required": ["course_id", "query"],
        },
    ),
    Tool(
        name="tutor_question",
        description="Ask the Socratic tutor a question grounded in the course knowledge base.",
        inputSchema={
            "type": "object",
            "properties": {
                "course_id": {"type": "integer"},
                "question": {"type": "string"},
            },
            "required": ["course_id", "question"],
        },
    ),
    Tool(
        name="detect_gaps",
        description="Detect knowledge gaps between a student's notes and source material.",
        inputSchema={
            "type": "object",
            "properties": {
                "course_id": {"type": "integer"},
                "student_notes": {"type": "string"},
            },
            "required": ["course_id", "student_notes"],
        },
    ),
    Tool(
        name="summarize_course",
        description="Generate a structured summary of a course's knowledge base.",
        inputSchema={
            "type": "object",
            "properties": {
                "course_id": {"type": "integer"},
                "focus_topic": {"type": "string", "description": "Optional topic to focus on"},
            },
            "required": ["course_id"],
        },
    ),
]


# ---------------------------------------------------------------------------
# Handlers
# ---------------------------------------------------------------------------


async def _search_knowledge_base(args: dict) -> list[TextContent]:
    results = get_vector_store().query(
        course_id=args["course_id"],
        query_text=args["query"],
        n_results=args.get("n_results", 5),
    )
    text = "\n\n".join(
        f"[{i+1}] (distance={r['distance']:.3f})\n{r['text']}"
        for i, r in enumerate(results)
    )
    return [TextContent(type="text", text=text or "No results found.")]


async def _tutor_question(args: dict) -> list[TextContent]:
    chunks = get_vector_store().query(
        course_id=args["course_id"],
        query_text=args["question"],
        n_results=6,
    )
    context = "\n\n".join(c["text"] for c in chunks)
    prompt = build_tutor_prompt(question=args["question"], context=context)
    response = _client.messages.create(
        model=_settings.claude_model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return [TextContent(type="text", text=response.content[0].text)]


async def _detect_gaps(args: dict) -> list[TextContent]:
    chunks = get_vector_store().query(
        course_id=args["course_id"],
        query_text=args["student_notes"],
        n_results=8,
    )
    context = "\n\n".join(c["text"] for c in chunks)
    prompt = build_gap_detector_prompt(notes=args["student_notes"], source_context=context)
    response = _client.messages.create(
        model=_settings.claude_model,
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return [TextContent(type="text", text=response.content[0].text)]


async def _summarize_course(args: dict) -> list[TextContent]:
    focus = args.get("focus_topic", "")
    query = focus or "main concepts overview key ideas"
    chunks = get_vector_store().query(
        course_id=args["course_id"],
        query_text=query,
        n_results=10,
    )
    context = "\n\n".join(c["text"] for c in chunks)
    prompt = build_summary_prompt(context=context, focus_topic=focus)
    response = _client.messages.create(
        model=_settings.claude_model,
        max_tokens=2048,
        messages=[{"role": "user", "content": prompt}],
    )
    return [TextContent(type="text", text=response.content[0].text)]


TOOL_HANDLERS = {
    "search_knowledge_base": _search_knowledge_base,
    "tutor_question": _tutor_question,
    "detect_gaps": _detect_gaps,
    "summarize_course": _summarize_course,
}
