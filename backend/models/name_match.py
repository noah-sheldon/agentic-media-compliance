from pydantic import BaseModel, Field
from typing import List

class NameMatchResult(BaseModel):
    subject_name_normalized: str
    article_primary_names: List[str]
    is_name_potential_match: bool
    confidence: float = Field(ge=0, le=1)
    reasoning: str
