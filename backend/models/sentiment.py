from enum import Enum
from pydantic import BaseModel
from typing import List

class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    MIXED = "mixed"
    NEUTRAL = "neutral"

class SentimentResult(BaseModel):
    overall_sentiment: SentimentLabel
    is_adverse_media: bool
    adverse_categories: List[str]
    key_positives: List[str]
    key_negatives: List[str]
    reasoning: str
