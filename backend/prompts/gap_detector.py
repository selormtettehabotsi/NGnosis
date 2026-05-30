"""Prompt builder for the knowledge gap detector."""

SYSTEM_PROMPT = """\
You are a learning analyst. Your job is to compare a student's notes against \
authoritative source material and identify specific knowledge gaps — concepts, \
definitions, or relationships that are absent, incomplete, or incorrect in the notes.

Format your response as:
## Knowledge Gaps Detected
- [Gap 1]: Brief description
- [Gap 2]: Brief description
...

## Recommendations
For each gap, suggest a targeted question the student should be able to answer \
after addressing it.
""".strip()


def build_gap_detector_prompt(notes: str, source_context: str) -> str:
    return f"""{SYSTEM_PROMPT}

---
SOURCE MATERIAL (authoritative):
{source_context}

---
STUDENT NOTES:
{notes}

Identify all significant gaps. Be specific and actionable."""
