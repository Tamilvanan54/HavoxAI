import re

REFERENCE_PRONOUNS = {"it", "its", "that", "their", "this", "them", "these", "those"}

FOLLOWUP_KEYWORDS = {
    "shortly", "briefly", "short", "summary", "summarize", "elaborate",
    "detail", "details", "example", "examples", "usages", "usage",
    "applications", "application", "advantages", "disadvantages", "types",
    "explain", "more", "points", "step", "steps", "diagram", "code"
}

FOLLOWUP_PHRASES = [
    "give it shortly", "give shortly", "in short", "make it short", "make short",
    "explain shortly", "tell shortly", "give brief", "briefly", "short answer",
    "give 1 mark", "give 2 marks", "give 3 marks", "give 5 marks", "give 7 marks",
    "give 8 marks", "give 10 marks", "give 12 marks", "give 14 marks", "give 16 marks",
    "1 mark", "2 mark", "5 mark", "7 mark", "10 mark", "16 mark",
    "give its usage", "give its usages", "how it works", "how does it work",
    "explain step 2", "give more details", "tell me more", "what about it",
    "its applications", "usages of it", "give 3 examples", "what is its domain",
    "give example", "give code", "give diagram", "explain in detail", "explain more"
]

def resolve_history_reference(
    query: str,
    history: str | list | None
) -> tuple[str, bool, str | None, str | None]:
    """
    Resolve references like 'it', 'its', 'give it shortly', 'shortly', '2 marks', etc. using chat history.
    Returns: (search_query, is_unclear, refusal_type, clarification_message)
    """
    if not query:
        return query, False, None, None

    query_lower = query.lower().strip()
    words = set(re.findall(r'\b[a-zA-Z0-9_-]+\b', query_lower))

    has_pronoun = bool(words.intersection(REFERENCE_PRONOUNS))
    has_followup_phrase = any(phrase in query_lower for phrase in FOLLOWUP_PHRASES)
    has_followup_kw = bool(words.intersection(FOLLOWUP_KEYWORDS)) and len(words) <= 5
    is_short_query = len(words) <= 4

    is_followup = has_pronoun or has_followup_phrase or has_followup_kw or is_short_query

    # Format history turns into list of strings
    history_lines = []
    if history:
        if isinstance(history, list):
            for turn in history:
                if isinstance(turn, dict):
                    sender = turn.get("sender", "User")
                    text = turn.get("text", "")
                    history_lines.append(f"{sender}: {text}")
                elif isinstance(turn, str):
                    history_lines.append(turn)
        elif isinstance(history, str):
            history_lines = [l.strip() for l in history.split("\n") if l.strip()]

    # Extract user questions from history
    user_questions = []
    for line in history_lines:
        line_strip = line.strip()
        line_lower = line_strip.lower()
        if line_lower.startswith("user:") or line_lower.startswith("student:") or line_lower.startswith("q:"):
            parts = line_strip.split(":", 1)
            if len(parts) > 1:
                q_text = parts[1].strip()
                if q_text and "cannot find information" not in q_text.lower() and "study materials" not in q_text.lower():
                    user_questions.append(q_text)

    # If query is a follow-up but NO prior user topic exists in history:
    if is_followup and not user_questions:
        if has_pronoun or "its" in query_lower or "it" in words:
            refusal_msg = 'Could you clarify what topic you are referring to? I can then search the uploaded materials for the correct topic.'
            return query, True, "unclear_reference", refusal_msg

    # Extract previous user topic
    if user_questions:
        last_user_q = user_questions[-1][:120]
        if last_user_q.lower() != query_lower:
            search_query = f"{last_user_q} {query}"
            print(f"🔄 [HISTORY RESOLUTION] Resolved search query: '{query}' -> '{search_query}' (Topic: '{last_user_q}')")
            return search_query, False, None, None

    return query, False, None, None
