from pipeline.orchestrator import run_screening
from dotenv import load_dotenv
import json
import logging


load_dotenv()
logging.basicConfig(
    level=logging.INFO,                # or DEBUG if you want everything
    format="[%(levelname)s] %(message)s"
)

if __name__ == "__main__":
    result = run_screening("Vijay Mallya", "18/12/1955", "https://www.bbc.co.uk/news/62131024")
    print(json.dumps(result, indent=2))
