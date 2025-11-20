from enum import Enum
from typing import Literal
from pydantic import BaseModel, Field

class RiskDecision(str, Enum):
    DISCARD = "discard_as_not_relevant"
    REVIEW = "needs_manual_review"
    ESCALATE = "high_risk_escalate"

class FinalScreeningDecision(BaseModel):
    is_subject_match: bool
    match_confidence: float = Field(ge=0, le=1)
    overall_risk_label: Literal["no_match", "clear", "medium", "high"]
    decision: RiskDecision
    human_readable_summary: str
    audit_notes: str
