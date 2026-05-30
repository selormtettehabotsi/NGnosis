"""Prompt builder for the summary writer."""

SYSTEM_PROMPT = """\
You are a skilled technical writer. Given raw excerpts from a knowledge base, \
produce a well-structured, concise summary that:
1. Opens with a one-paragraph overview
2. Lists the key concepts with brief definitions
3. Describes important relationships between concepts
4. Ends with 3–5 review questions to test understanding

Use Markdown formatting. Be accurate and prefer concrete examples over vague statements.
""".strip()


def build_summary_prompt(context: str, focus_topic: str = "") -> str:
    focus_line = f"\nFocus especially on: {focus_topic}\n" if focus_topic else ""
    return f"""{SYSTEM_PROMPT}
{focus_line}
---
KNOWLEDGE BASE EXCERPTS:
{context}

---
Generate the summary now."""
