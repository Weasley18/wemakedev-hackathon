from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import uuid
import logging
import traceback

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("threat-seeker-api")

# Import settings first to ensure environment variables are loaded
from config.settings import settings

# Import agent classes with exception handling
try:
    from agents.planner import HuntPlannerAgent
except ImportError as e:
    logger.error(f"Failed to import HuntPlannerAgent: {e}")
    HuntPlannerAgent = None

try:
    from agents.executor import HuntExecutionAgent
except ImportError as e:
    logger.error(f"Failed to import HuntExecutionAgent: {e}")
    HuntExecutionAgent = None

try:
    from agents.analyzer import AnalysisAgent
except ImportError as e:
    logger.error(f"Failed to import AnalysisAgent: {e}")
    AnalysisAgent = None

try:
    from agents.clarifier import ClarificationAgent
except ImportError as e:
    logger.error(f"Failed to import ClarificationAgent: {e}")
    ClarificationAgent = None

try:
    from agents.critic import CriticAgent
except ImportError as e:
    logger.error(f"Failed to import CriticAgent: {e}")
    CriticAgent = None
    
try:
    from agents.hypothesis_generator import HypothesisGeneratorAgent
except ImportError as e:
    logger.error(f"Failed to import HypothesisGeneratorAgent: {e}")
    HypothesisGeneratorAgent = None

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

# Agent instances with safe initialization
try:
    planner_agent = HuntPlannerAgent() if HuntPlannerAgent else None
    execution_agent = HuntExecutionAgent() if HuntExecutionAgent else None
    analysis_agent = AnalysisAgent() if AnalysisAgent else None
    clarification_agent = ClarificationAgent() if ClarificationAgent else None
    critic_agent = CriticAgent() if CriticAgent else None
    hypothesis_generator_agent = HypothesisGeneratorAgent() if HypothesisGeneratorAgent else None
    
    logger.info("Agent initialization complete")
except Exception as e:
    logger.error(f"Error initializing agents: {e}")
    logger.error(traceback.format_exc())
    
    # Set any failed agents to None
    if 'planner_agent' not in locals(): planner_agent = None
    if 'execution_agent' not in locals(): execution_agent = None
    if 'analysis_agent' not in locals(): analysis_agent = None
    if 'clarification_agent' not in locals(): clarification_agent = None
    if 'critic_agent' not in locals(): critic_agent = None
    if 'hypothesis_generator_agent' not in locals(): hypothesis_generator_agent = None

# Routes
@app.post("/api/hypothesis", response_model=HuntPlan)
async def create_hunt_plan(hypothesis_req: HypothesisRequest):
    """
    Generate a hunt plan from a natural language hypothesis
    """
    # Check if agent was initialized
    if planner_agent is None:
        logger.error("Hunt planner agent not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hunt planning service is currently unavailable"
        )
    
    try:
        logger.info(f"Creating hunt plan for hypothesis: {hypothesis_req.hypothesis[:50]}...")
        # Generate the hunt plan
        hunt_plan = await planner_agent.create_plan(
            hypothesis=hypothesis_req.hypothesis,
            analyst_id=hypothesis_req.analyst_id,
            context=hypothesis_req.context
        )
        
        logger.info(f"Successfully created hunt plan with ID: {hunt_plan.plan_id}")
        return hunt_plan
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Failed to create hunt plan: {str(e)}")
        logger.debug(f"Error details: {error_details}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create hunt plan: {str(e)}"
        )

@app.post("/api/execute", response_model=HuntResult)
async def execute_hunt_plan(approval: QueryApprovalRequest):
    """
    Execute approved queries from a hunt plan
    """
    # Check if agents were initialized
    if execution_agent is None:
        logger.error("Hunt execution agent not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Hunt execution service is currently unavailable"
        )
    
    if analysis_agent is None:
        logger.error("Analysis agent not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Analysis service is currently unavailable"
        )
    
    try:
        logger.info(f"Executing hunt plan queries for plan ID: {approval.plan_id}")
        # Execute approved queries
        raw_results = await execution_agent.execute_queries(
            plan_id=approval.plan_id,
            query_ids=approval.query_ids,
            modifications=approval.modifications
        )
        
        logger.info(f"Analyzing results for plan ID: {approval.plan_id}")
        # Analyze results
        hunt_results = await analysis_agent.analyze_results(
            plan_id=approval.plan_id,
            raw_results=raw_results
        )
        
        logger.info(f"Successfully completed hunt execution and analysis for plan ID: {approval.plan_id}")
        return hunt_results
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Failed to execute hunt plan: {str(e)}")
        logger.debug(f"Error details: {error_details}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to execute hunt plan: {str(e)}"
        )

@app.post("/api/clarify", response_model=ClarificationResponse)
async def request_clarification(req: ClarificationRequest):
    """
    Request clarification about hunt results
    """
    # Check if agent was initialized
    if clarification_agent is None:
        logger.error("Clarification agent not initialized")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Clarification service is currently unavailable"
        )
    
    try:
        logger.info(f"Requesting clarification for result ID: {req.result_id}, question: {req.question[:50]}...")
        response = await clarification_agent.get_clarification(
            result_id=req.result_id,
            question=req.question,
            context=req.context
        )
        logger.info(f"Successfully generated clarification response")
        return response
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Failed to get clarification: {str(e)}")
        logger.debug(f"Error details: {error_details}")
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get clarification: {str(e)}"
        )

@app.get("/api/health")
async def health_check():
    """
    Health check endpoint
    """
    logger.info("Health check endpoint called")
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/suggested-hypotheses")
async def get_suggested_hypotheses(count: Optional[int] = 3):
    """
    Get AI-generated threat hunting hypotheses
    """
    logger.info(f"Received request for {count} suggested hypotheses")
    
    # Check if agent was initialized
    if hypothesis_generator_agent is None:
        logger.warning("Hypothesis generator agent not initialized, using mock data")
        mock_hypotheses = get_mock_hypotheses()
        limited_hypotheses = mock_hypotheses[:count] if count < len(mock_hypotheses) else mock_hypotheses
        return {"hypotheses": limited_hypotheses}
    
    try:
        # Check if Gemini API key is set
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-api-key-here":
            logger.info("Using LLM to generate hypotheses")
            # Generate hypotheses using the agent
            hypotheses = await hypothesis_generator_agent.generate_hypotheses(count=count)
            logger.info(f"Successfully generated {len(hypotheses)} hypotheses using LLM")
            return {"hypotheses": hypotheses}
        else:
            logger.info("No valid Gemini API key found, using mock hypotheses")
            # Return static mock hypotheses for demo purposes
            mock_hypotheses = get_mock_hypotheses()
            # Limit to requested count
            limited_hypotheses = mock_hypotheses[:count] if count < len(mock_hypotheses) else mock_hypotheses
            return {"hypotheses": limited_hypotheses}
    except Exception as e:
        error_details = traceback.format_exc()
        logger.error(f"Error generating hypotheses: {str(e)}")
        logger.debug(f"Error details: {error_details}")
        
        # Fallback to mock data on error
        logger.info("Falling back to mock hypotheses data")
        mock_hypotheses = get_mock_hypotheses()
        limited_hypotheses = mock_hypotheses[:count] if count < len(mock_hypotheses) else mock_hypotheses
        return {"hypotheses": limited_hypotheses}

def get_mock_hypotheses() -> List[Dict[str, Any]]:
    """
    Generate mock hypothesis data for demonstration purposes
    """
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "DCSync attacks from privileged workstations",
            "description": "Look for potential DCSync attacks originating from workstations, which may indicate credential theft.",
            "threat_actors": ["APT29", "FIN7"],
            "techniques": ["T1003.006", "T1207"],
            "confidence": 0.85,
            "justification": "Recent breaches have shown an increase in this technique",
            "data_sources": ["Windows Event Logs", "Active Directory Logs"],
            "source": "Intel Feed",
            "generated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Log4j exploitation attempts in web servers",
            "description": "Monitor for Log4j exploitation attempts targeting your web infrastructure.",
            "threat_actors": ["Multiple threat actors"],
            "techniques": ["T1190", "T1059.1"],
            "confidence": 0.73,
            "justification": "Widespread vulnerability with continued exploitation attempts",
            "data_sources": ["Web Server Logs", "Network Traffic"],
            "source": "Anomaly Detection",
            "generated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "PsExec usage for lateral movement",
            "description": "Detect potentially malicious use of PsExec for lateral movement across your network.",
            "threat_actors": ["APT32", "FIN10"],
            "techniques": ["T1021.002", "T1570"],
            "confidence": 0.91,
            "justification": "Common technique observed in recent campaigns",
            "data_sources": ["EDR", "Process Creation Logs"],
            "source": "MITRE ATT&CK",
            "generated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Kerberoasting activity targeting privileged service accounts",
            "description": "Identify potential Kerberoasting attacks against service accounts with high privileges.",
            "threat_actors": ["APT28", "LAPSUS$"],
            "techniques": ["T1558.003", "T1208"],
            "confidence": 0.78,
            "justification": "Service accounts with SPN are high-value targets",
            "data_sources": ["Windows Event Logs", "Authentication Logs"],
            "source": "Intel Feed",
            "generated_at": datetime.now().isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "title": "NTLM relay attacks via SMB",
            "description": "Detect potential NTLM relay attacks exploiting SMB protocol for credential theft.",
            "threat_actors": ["FIN7", "Unknown Groups"],
            "techniques": ["T1557.001", "T1212"],
            "confidence": 0.68,
            "justification": "Recent surge in NTLM relay exploitation",
            "data_sources": ["Network Traffic", "Windows Event Logs"],
            "source": "Threat Research",
            "generated_at": datetime.now().isoformat()
        }
    ]

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
