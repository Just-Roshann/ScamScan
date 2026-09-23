from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

ScamTypeLiteral = Literal[
    "phishing",
    "bank_kyc",
    "upi_payment",
    "job_task",
    "lottery_reward",
    "courier_bill",
    "impersonation",
    "investment",
    "tech_support",
    "sextortion",
    "other",
    "none",
]

ConfidenceLiteral = Literal["low", "medium", "high"]

class Signal(BaseModel):
    id: str
    category: str
    title: str
    detail: str
    weight: int = Field(ge=0, le=30)
    evidence: str = ""

class ReasonItem(BaseModel):
    title: str
    detail: str
    evidence: str = ""
    category: str = "general"
    source: Literal["rules", "ai"] = "rules"
    weight: int = 0

class TextHighlight(BaseModel):
    start: int
    end: int
    category: str

class UrlBreakdown(BaseModel):
    scheme: str = ""
    subdomain: str = ""
    registered_domain: str = ""
    tld: str = ""
    path: str = ""
    query: str = ""
    suspicious_part: str = ""
    reason: str = ""

class UrlAnalysisResult(BaseModel):
    url: str
    score: int
    breakdown: UrlBreakdown
    signals: List[Signal] = []

class AnalyzeRequest(BaseModel):
    type: Literal["message", "email", "url", "website"]
    content: str

class AnalyzeResponse(BaseModel):
    id: str
    score: int
    verdict: Literal["Looks Safe", "Suspicious", "Dangerous"]
    scam_type: str
    summary: str
    reasons: List[ReasonItem]
    highlights: List[TextHighlight]
    urls: List[UrlAnalysisResult]
    safe_actions: List[str]
    ai_used: bool
    elapsed_ms: int

class AiReason(BaseModel):
    title: str
    detail: str
    evidence: str = ""

class AiAnalysisResponse(BaseModel):
    ai_risk: int = Field(ge=0, le=100)
    scam_type: ScamTypeLiteral
    confidence: ConfidenceLiteral
    reasons: List[AiReason] = Field(default_factory=list)
    safe_actions: List[str] = Field(default_factory=list)
    summary: str

class HistoryItem(BaseModel):
    id: str
    timestamp: str
    input_type: str
    content_preview: str
    score: int
    verdict: str
    scam_type: str

class StatsResponse(BaseModel):
    total_scans: int
    verdict_counts: Dict[str, int]
    scam_type_counts: Dict[str, int]
