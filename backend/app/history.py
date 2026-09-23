import hashlib
import sqlite3
import datetime
from app.config import DATABASE_PATH
from app.schemas import HistoryItem, StatsResponse

def get_database_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection

def initialize_database():
    with get_database_connection() as conn:
        conn.execute(
            "CREATE TABLE IF NOT EXISTS scans ("
            "id TEXT PRIMARY KEY, "
            "timestamp TEXT NOT NULL, "
            "input_type TEXT NOT NULL, "
            "content_hash TEXT NOT NULL, "
            "content_preview TEXT NOT NULL, "
            "score INTEGER NOT NULL, "
            "verdict TEXT NOT NULL, "
            "scam_type TEXT NOT NULL)"
        )
        conn.commit()

def record_scan_result(scan_id: str, input_type: str, content: str, score: int, verdict: str, scam_type: str):
    initialize_database()
    content_hash = hashlib.sha256(content.encode("utf-8", errors="ignore")).hexdigest()
    content_preview = content.strip().replace("\n", " ")[:120]
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    with get_database_connection() as conn:
        conn.execute(
            "INSERT INTO scans (id, timestamp, input_type, content_hash, content_preview, score, verdict, scam_type) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            (scan_id, timestamp, input_type, content_hash, content_preview, score, verdict, scam_type),
        )
        conn.commit()

def fetch_recent_scans(limit_count: int = 50):
    initialize_database()
    with get_database_connection() as conn:
        rows = conn.execute(
            "SELECT id, timestamp, input_type, content_preview, score, verdict, scam_type FROM scans ORDER BY timestamp DESC LIMIT ?",
            (limit_count,),
        ).fetchall()
        return [
            HistoryItem(
                id=row["id"],
                timestamp=row["timestamp"],
                input_type=row["input_type"],
                content_preview=row["content_preview"],
                score=row["score"],
                verdict=row["verdict"],
                scam_type=row["scam_type"],
            )
            for row in rows
        ]

def calculate_scan_statistics() -> StatsResponse:
    initialize_database()
    with get_database_connection() as conn:
        total_count = conn.execute("SELECT COUNT(*) FROM scans").fetchone()[0]
        verdict_rows = conn.execute("SELECT verdict, COUNT(*) FROM scans GROUP BY verdict").fetchall()
        scam_rows = conn.execute("SELECT scam_type, COUNT(*) FROM scans GROUP BY scam_type").fetchall()

    verdict_counts = {"Looks Safe": 0, "Suspicious": 0, "Dangerous": 0}
    for row in verdict_rows:
        verdict_counts[row[0]] = row[1]

    scam_type_counts = {}
    for row in scam_rows:
        scam_type_counts[row[0]] = row[1]

    return StatsResponse(
        total_scans=total_count,
        verdict_counts=verdict_counts,
        scam_type_counts=scam_type_counts,
    )
