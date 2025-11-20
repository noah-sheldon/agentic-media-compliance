# models/article_metadata.py
from pydantic import BaseModel, Field
from typing import Optional

class ArticleMetadataResult(BaseModel):
    """High-level metadata extracted from the article / URL."""

    title: Optional[str] = Field(
        None,
        description="Best-effort article title inferred from context or page."
    )
    published_date: Optional[str] = Field(
        None,
        description="Best-effort publication date in ISO-8601 or original string form."
    )
    section: Optional[str] = Field(
        None,
        description="Article section/category, e.g. 'Business', 'Crime', 'Politics'."
    )
    source_domain: Optional[str] = Field(
        None,
        description="Domain of the article source, e.g. 'bbc.co.uk'."
    )
    is_recent: Optional[bool] = Field(
        None,
        description="True if the article is judged to be reasonably recent for AML purposes."
    )
    reasoning: str = Field(
        ...,
        description="Short explanation of how metadata was inferred from the text/URL."
    )
