from agents import Runner
from models.inputs import ScreeningInput
from aml_agents.name_agent import name_match_agent
from aml_agents.dob_agent import dob_age_agent
from aml_agents.sentiment_agent import sentiment_agent
from aml_agents.decision_agent import decision_agent
from aml_agents.article_metadata_agent import article_metadata_agent
from aml_agents.person_agent import person_extraction_agent
from aml_agents.context_agent import context_extraction_agent
from scraping.fetcher import fetch_article_text
import logging
from typing import Any, Dict, Optional

logger = logging.getLogger("aml.orchestrator")


def build_base_prompt(screening_input: ScreeningInput) -> str:
    dob = screening_input.subject_date_of_birth or "not provided"
    return f"""
You are assisting with adverse media screening in a regulated financial services context.

Subject:
- Full name: {screening_input.subject_name}
- Date of birth: {dob}

Article URL:
- {screening_input.article_url}

Article text:
\"\"\"{screening_input.article_text}\"\"\"

Use ONLY the information above. Do not fabricate new facts.
"""


def run_screening(name: str, dob: Optional[str], url: str) -> Dict[str, Any]:
    logger.info(
        "Starting screening for subject='%s', dob='%s', url=%s",
        name,
        dob or "not provided",
        url,
    )

    # 1) Fetch Article
    try:
        article_text = fetch_article_text(url)
        logger.info(f"Fetched article: length={len(article_text)} chars from {url}")
    except Exception as e:
        logger.error(f"Failed to fetch article: {e}")
        raise

    screening_input = ScreeningInput(name, dob, url, article_text)
    prompt = build_base_prompt(screening_input)

    logger.debug(f"Base prompt:\n{prompt}")

    # 2) Run specialist agents
    logger.info("Running ArticleMetadataAgent…")
    metadata_result = Runner.run_sync(article_metadata_agent, prompt).final_output

    logger.info("Running PersonExtractionAgent…")
    person_result = Runner.run_sync(person_extraction_agent, prompt).final_output

    logger.info("Running ContextExtractionAgent…")
    context_result = Runner.run_sync(context_extraction_agent, prompt).final_output

    logger.info("Running NameMatchAgent…")
    name_result = Runner.run_sync(name_match_agent, prompt).final_output

    logger.info("Running DobAgeAgent…")
    dob_result = Runner.run_sync(dob_age_agent, prompt).final_output

    logger.info("Running SentimentAgent…")
    sentiment_result = Runner.run_sync(sentiment_agent, prompt).final_output

    # 3) Build final decision prompt (you can extend this later to include metadata/context/person if desired)
    decision_prompt = f"""
You are combining the outputs of three specialist AML agents.

NameMatchResult:
{name_result.model_dump_json(indent=2)}

DobAgeMatchResult:
{dob_result.model_dump_json(indent=2)}

SentimentResult:
{sentiment_result.model_dump_json(indent=2)}

Produce a FinalScreeningDecision JSON object only.
"""
    logger.debug(f"Decision prompt:\n{decision_prompt}")

    logger.info("Running DecisionAgent…")
    final = Runner.run_sync(decision_agent, decision_prompt).final_output

    logger.info(
        f"DecisionAgent completed: decision={final.decision}, "
        f"match={final.is_subject_match}, risk={final.overall_risk_label}"
    )

    # 4) Return unified JSON with all agent outputs for the UI
    return {
        **final.model_dump(),
        "details": {
            "metadata": metadata_result.model_dump(),
            "people": person_result.model_dump(),
            "context": context_result.model_dump(),
            "name_match": name_result.model_dump(),
            "dob_age": dob_result.model_dump(),
            "sentiment": sentiment_result.model_dump(),
            "article_text": article_text,
        },
    }
