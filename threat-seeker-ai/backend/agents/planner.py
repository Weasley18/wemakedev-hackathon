from datetime import datetime
import uuid
from typing import Dict, List, Optional, Any
from pydantic import BaseModel

class QueryDetails(BaseModel):
    query_id: str
    data_source: str
    query_string: str
    explanation: str
    technique_ids: List[str]
    time_range: Dict[str, str]
    expected_volume: str
    risk_level: str

class HuntPlan(BaseModel):
    plan_id: str
    hypothesis: str
    queries: List[QueryDetails]
    created_at: datetime
    analyst_id: str
    mitre_techniques: List[Dict[str, str]]
    estimated_execution_time: str

class HuntPlannerAgent:
    """
    Agent responsible for translating natural language hypotheses into detailed hunt plans
    with specific queries for different data sources.
    """
    
    def __init__(self):
        # In a real implementation, this would initialize a language model
        pass
    
    async def create_plan(self, hypothesis: str, analyst_id: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a hunt plan from a natural language hypothesis
        
        For this example, we're using a hard-coded mock response.
        """
        # Generate a unique plan ID
        plan_id = str(uuid.uuid4())
        
        # Create a mock hunt plan
        hunt_plan = HuntPlan(
            plan_id=plan_id,
            hypothesis=hypothesis,
            queries=[
                QueryDetails(
                    query_id="q1",
                    data_source="splunk",
                    query_string="""index=windows source="WinEventLog:Microsoft-Windows-WMI-Activity/Operational" EventCode=5861 
                    | stats count by Computer, User, Message 
                    | sort -count""",
                    explanation="This query searches for WMI event consumer registrations in the Windows Event Logs. EventCode 5861 specifically captures when a new permanent event consumer is registered, which could indicate persistence.",
                    technique_ids=["T1546.003"],
                    time_range={"start": "-7d", "end": "now"},
                    expected_volume="medium",
                    risk_level="high"
                ),
                QueryDetails(
                    query_id="q2",
                    data_source="splunk",
                    query_string="""index=windows source="WinEventLog:Security" EventCode=4688 process="wmiprvse.exe" 
                    | stats count by host, user, ParentProcessId, NewProcessId, CommandLine 
                    | where count > 5""",
                    explanation="This query looks for WmiPrvSE.exe (the WMI Provider Service) process creations. An unusually high number of WMI process executions may indicate automated lateral movement.",
                    technique_ids=["T1047", "T1021"],
                    time_range={"start": "-24h", "end": "now"},
                    expected_volume="high",
                    risk_level="medium"
                ),
                QueryDetails(
                    query_id="q3",
                    data_source="elastic",
                    query_string="""process.name:("wmic.exe" OR "wmiprvse.exe") AND event.action:"Process Create" AND 
                    process.command_line:(*process call create* OR *wmi* OR *win32_process* OR *invoke-wmimethod*)""",
                    explanation="This Elasticsearch query detects potential WMI lateral movement by looking for WMIC command execution creating new processes. Attackers often use 'wmic /node:' for remote execution.",
                    technique_ids=["T1047", "T1569.002"],
                    time_range={"start": "-30d", "end": "now"},
                    expected_volume="low",
                    risk_level="critical"
                )
            ],
            created_at=datetime.now(),
            analyst_id=analyst_id,
            mitre_techniques=[
                {
                    "id": "T1546.003",
                    "name": "Windows Management Instrumentation Event Subscription",
                    "description": "Adversaries may establish persistence by executing malicious content triggered by a Windows Management Instrumentation (WMI) event subscription."
                },
                {
                    "id": "T1047",
                    "name": "Windows Management Instrumentation",
                    "description": "Adversaries may abuse Windows Management Instrumentation (WMI) to execute malicious commands and payloads."
                },
                {
                    "id": "T1021",
                    "name": "Remote Services",
                    "description": "Adversaries may use valid accounts to log into a service specifically designed to accept remote connections."
                }
            ],
            estimated_execution_time="5 minutes"
        )
        
        return hunt_plan.dict()
