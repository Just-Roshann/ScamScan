import os
from pathlib import Path
from dotenv import load_dotenv

backend_dir = Path(__file__).resolve().parent.parent
root_dir = backend_dir.parent

load_dotenv(backend_dir / ".env")
load_dotenv(root_dir / ".env")

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
PRIMARY_MODEL = "llama-3.3-70b-versatile"
FALLBACK_MODEL = "llama-3.1-8b-instant"
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
PORT = int(os.getenv("PORT", "8000"))
if os.getenv("VERCEL"):
    DATABASE_PATH = Path("/tmp/scamscan.db")
    os.environ["TLDEXTRACT_CACHE"] = "/tmp/tldextract"
else:
    DATABASE_PATH = backend_dir / "scamscan.db"

