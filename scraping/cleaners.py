import re
from bs4 import BeautifulSoup
from typing import List

NOISE_SELECTORS = [
    "script",
    "style",
    "header",
    "footer",
    "nav",
    "aside",
    "iframe",
    "noscript",
    ".ad",
    ".ads",
    ".advertisement",
    ".sponsored",
    ".cookie-banner",
    ".comments",
    ".related",
    ".related-articles",
    ".newsletter",
]

CONTENT_SELECTORS = [
    "main",
    "article",
    "#content",
    ".content",
    ".post",
    ".entry",
    "[role='main']",
]


def normalize_whitespace(text: str) -> str:
    """Collapse whitespace to single spaces."""
    return re.sub(r"\s+", " ", text).strip()


def remove_duplicate_lines(lines: List[str]) -> List[str]:
    """Remove duplicate or near-duplicate lines."""
    seen = set()
    out = []
    for line in lines:
        key = line.lower().strip()
        if key in seen:
            continue
        seen.add(key)
        out.append(line)
    return out


def extract_main_content(soup: BeautifulSoup) -> str:
    """Find main body text from typical article containers."""
    for selector in CONTENT_SELECTORS:
        region = soup.select_one(selector)
        if region:
            return region.get_text(separator="\n", strip=True)
    # fallback: entire body
    return soup.body.get_text(separator="\n", strip=True) if soup.body else ""


def clean_html_to_text(html: str, max_chars: int = 16000) -> str:
    """
    Convert HTML into clean, deduplicated article text suitable for LLM processing.
    This is the main function the orchestrator should call.
    """
    soup = BeautifulSoup(html, "html.parser")

    # Remove all noise nodes
    for selector in NOISE_SELECTORS:
        for node in soup.select(selector):
            node.decompose()

    # Extract main content, fallback to body
    raw_text = extract_main_content(soup)

    # Normalise spacing
    lines = [normalize_whitespace(line) for line in raw_text.split("\n")]
    lines = [l for l in lines if len(l) > 2]  # drop tiny fragments
    lines = remove_duplicate_lines(lines)

    text = " ".join(lines)
    text = normalize_whitespace(text)

    return text[:max_chars]
