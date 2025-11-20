from pydantic import BaseModel, Field
from typing import Optional

class DobAgeMatchResult(BaseModel):
    dob_in_article: Optional[str] = None
    age_in_article: Optional[int] = None
    age_phrase: Optional[str] = None
    is_dob_or_age_consistent: Optional[bool] = None
    confidence: float = Field(ge=0, le=1)
    reasoning: str
