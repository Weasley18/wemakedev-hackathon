from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel

from agents.planner import HuntPlannerAgent
from agents.executor import HuntExecutionAgent
from agents.analyzer import AnalysisAgent
from agents.clarifier import ClarificationAgent
from config.settings import settings

app = FastAPI(
    title="Threat-Seeker AI API",
    description="Backend API for the Threat-Seeker AI threat hunting co-pilot",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class HypothesisRequest(BaseModel):
    hypothesis: str
    analyst_id: str
    context: Optional[Dict[str, Any]] = None

class HuntPlan(BaseModel):
    plan_id: str
    hypothesis: str
    queries: List[Dict[str, Any]]
    created_at: datetime
    analyst_id: str

class QueryApprovalRequest(BaseModel):
    plan_id: str
    query_ids: List[str]
    modifications: Optional[Dict[str, str]] = None

class HuntResult(BaseModel):
    result_id: str
    plan_id: str
    raw_results: Dict[str, Any]
    analysis: Dict[str, Any]
    created_at: datetime

class ClarificationRequest(BaseModel):
    result_id: str
    question: str
    context: Dict[str, Any]

class ClarificationResponse(BaseModel):
    result_id: str
    answer: str
    confidence: float

# Agent instances
planner_agent = HuntPlannerAgent()
execution_agent = HuntExecutionAgent()
analysis_agent = AnalysisAgent()
clarification_agent = ClarificationAgent()

# Routes
@app.post("/api/hypothesis", response_model=HuntPlan)
async def create_hunt_plan(hypothesis_req: HypothesisRequest):
    """
    Generate a hunt plan from a natural language hypothesis
    """
    try:
        hunt_plan = await planner_agent.create_plan(
            hypothesis=hypothesis_req.hypothesis,
            analyst_id=hypothesis_req.analyst_id,
            context=hypothesis_req.context
        )
        return hunt_plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hunt plan: {str(e)}"
        )

@app.post("/api/execute", response_model=HuntResult)
async def execute_hunt_plan(approval: QueryApprovalRequest):
    """
    Execute approved queries from a hunt plan
    """
    try:
        # Execute approved queries
        raw_results = await execution_agent.execute_queries(
            plan_id=approval.plan_id,
            query_ids=approval.query_ids,
            modifications=approval.modifications
        )
        
        # Analyze results
        hunt_results = await analysis_agent.analyze_results(
            plan_id=approval.plan_id,
            raw_results=raw_results
        )
        
        return hunt_results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute hunt plan: {str(e)}"
        )

@app.post("/api/clarify", response_model=ClarificationResponse)
async def request_clarification(req: ClarificationRequest):
    """
    Request clarification about hunt results
    """
    try:
        response = await clarification_agent.get_clarification(
            result_id=req.result_id,
            question=req.question,
            context=req.context
        )
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get clarification: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
