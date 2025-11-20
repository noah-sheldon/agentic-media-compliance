from pydantic import BaseModel, Field
from typing import List, Optional

class PersonExtractionResult(BaseModel):
    """
    Identify who the article is primarily about, and distinguish
    main subject from other people and authors.
    """

    main_person: Optional[str] = Field(
        None,
        description="Name of the main person the article is about, if clearly identifiable."
    )
    other_people: List[str] = Field(
        default_factory=list,
        description="Other people mentioned (witnesses, officials, victims, etc.)."
    )
    author_names: List[str] = Field(
        default_factory=list,
        description="Any names that appear to be authors, editors, or byline credits."
    )
    reasoning: str = Field(
        ...,
        description="Short explanation with snippets indicating why this person is considered the main subject."
    )
