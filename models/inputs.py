from dataclasses import dataclass
from typing import Optional

@dataclass
class ScreeningInput:
    subject_name: str
    subject_date_of_birth: Optional[str]
    article_url: str
    article_text: str
