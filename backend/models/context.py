from pydantic import BaseModel, Field
from typing import List, Optional

class ContextExtractionResult(BaseModel):
    """
    Extract contextual signals that help confirm identity and understand risk:
    locations, organisations, roles, etc.
    """

    locations: List[str] = Field(
        default_factory=list,
        description="Key geographic locations associated with the main person or events."
    )
    organisations: List[str] = Field(
        default_factory=list,
        description="Key companies/organisations associated with the main person."
    )
    roles_or_occupations: List[str] = Field(
        default_factory=list,
        description="Roles or occupations associated with the main person (e.g. 'businessman', 'CEO')."
    )
    subject_context_consistent: Optional[bool] = Field(
        None,
        description=(
            "If subject info is provided, whether these context details are broadly "
            "consistent with the subject (True/False/None)."
        ),
    )
    confidence: float = Field(
        ...,
        ge=0.0,
        le=1.0,
        description="Confidence (0.0–1.0) in the context consistency judgment."
    )
    reasoning: str = Field(
        ...,
        description="Short explanation referencing key context snippets from the article."
    )
