from scraping.cleaners import clean_html_to_text
import requests

def fetch_article_text(url: str, max_chars: int = 16000) -> str:
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()

    html = resp.text
    return clean_html_to_text(html, max_chars=max_chars)
