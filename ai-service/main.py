import json
import os
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from openai import OpenAI
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Grievance AI Service")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


class AnalyzeRequest(BaseModel):
    agentName: str = Field(default="complaint-analysis")
    complaint: Dict[str, Any]
    instructions: Optional[str] = None


def require_client() -> OpenAI:
    if not client:
        raise HTTPException(
            status_code=503,
            detail="OPENAI_API_KEY is not configured for ai-service",
        )
    return client


def compact_complaint(complaint: Dict[str, Any]) -> Dict[str, Any]:
    allowed_keys = [
        "id",
        "complaintNumber",
        "title",
        "description",
        "translatedDescription",
        "status",
        "priority",
        "locationText",
        "language",
        "sourceChannel",
        "category",
        "department",
        "jurisdiction",
    ]
    return {key: complaint.get(key) for key in allowed_keys if key in complaint}


def call_json_agent(system_prompt: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    openai_client = require_client()

    response = openai_client.chat.completions.create(
        model=OPENAI_MODEL,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, ensure_ascii=False)},
        ],
        temperature=0.2,
    )

    content = response.choices[0].message.content

    try:
        return json.loads(content)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="AI service returned invalid JSON") from exc


def complaint_analysis_agent(complaint: Dict[str, Any]) -> Dict[str, Any]:
    system_prompt = """
You are a municipal grievance complaint analysis agent.
Return only valid JSON with these keys:
detectedLanguage, translatedText, summary, categorySuggestion,
prioritySuggestion, departmentSuggestion, locationSuggestion, confidenceScore.
Use prioritySuggestion as one of LOW, MEDIUM, HIGH, URGENT.
confidenceScore must be a number between 0 and 1.
Do not invent facts. If unknown, use null.
"""
    return call_json_agent(
        system_prompt,
        {
            "task": "analyze_complaint",
            "complaint": compact_complaint(complaint),
        },
    )


def routing_agent(complaint: Dict[str, Any]) -> Dict[str, Any]:
    system_prompt = """
You are a municipal grievance routing agent.
Return only valid JSON with these keys:
departmentSuggestion, departmentId, officerId, reason, confidenceScore.
departmentId and officerId must be null unless explicitly provided in input context.
confidenceScore must be a number between 0 and 1.
This is a recommendation, not final assignment.
"""
    return call_json_agent(
        system_prompt,
        {
            "task": "route_complaint",
            "complaint": compact_complaint(complaint),
        },
    )


def response_draft_agent(complaint: Dict[str, Any], instructions: Optional[str]) -> Dict[str, Any]:
    system_prompt = """
You are a municipal grievance response drafting agent.
Return only valid JSON with these keys:
draftText, tone, nextSteps, confidenceScore.
Write a clear citizen-facing response. Do not promise resolution or action
that is not confirmed in the complaint context. Keep it professional and concise.
confidenceScore must be a number between 0 and 1.
"""
    return call_json_agent(
        system_prompt,
        {
            "task": "draft_response",
            "complaint": compact_complaint(complaint),
            "instructions": instructions,
        },
    )


AGENTS = {
    "complaint-analysis": complaint_analysis_agent,
    "complaint-routing": routing_agent,
    "response-draft": response_draft_agent,
}


@app.get("/")
def home():
    return {
        "message": "AI service is running",
        "openaiConfigured": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "service": "ai-service",
        "openaiConfigured": bool(OPENAI_API_KEY),
        "model": OPENAI_MODEL,
        "agents": list(AGENTS.keys()),
    }


@app.post("/analyze")
def analyze(data: AnalyzeRequest):
    agent_name = data.agentName

    if agent_name not in AGENTS:
        raise HTTPException(status_code=400, detail=f"Unknown agentName: {agent_name}")

    if agent_name == "response-draft":
        output = response_draft_agent(data.complaint, data.instructions)
    else:
        output = AGENTS[agent_name](data.complaint)

    return {
        "agentName": agent_name,
        "model": OPENAI_MODEL,
        **output,
    }
