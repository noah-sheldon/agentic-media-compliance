# aml_agents/context_agent.py
from agents import Agent
from models.context import ContextExtractionResult
from backend.config import DEFAULT_MODEL

context_extraction_agent = Agent(
    name="context_extraction_agent",
    model=DEFAULT_MODEL,
    instructions=(
        "You are a context-extraction specialist for AML adverse media screening.\n\n"
        "You will be given the subject details and the article text. Your tasks:\n"
        "- Extract key locations (cities, countries, regions) clearly associated with the main person.\n"
        "- Extract key organisations/companies clearly linked to the main person.\n"
        "- Extract roles or occupations associated with the main person (e.g. 'businessman', 'former CEO').\n"
        "- If subject details are available, assess whether this context is broadly consistent with the subject.\n\n"
        "RULES:\n"
        "- Only include locations/organisations/roles that clearly refer to the main article subject, "
        "  not to side characters or generic references.\n"
        "- subject_context_consistent can be true, false, or null (if you lack enough information).\n"
        "- confidence must be a float between 0.0 and 1.0, reflecting your certainty in the consistency judgment.\n\n"
        "Return a strict JSON object matching ContextExtractionResult."
    ),
    output_type=ContextExtractionResult,
)
