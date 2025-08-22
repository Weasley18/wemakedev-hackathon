from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional, Literal
from pydantic import BaseModel

class Finding(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    confidence: float
    affected_hosts: List[str]
    events_count: int
    techniques: List[str]
    details: Dict[str, Any]
    
class Pattern(BaseModel):
    id: str
    name: str
    description: str
    count: int
    
class AnalysisResult(BaseModel):
    result_id: str
    plan_id: str
    summary: Dict[str, Any]
    findings: List[Finding]
    patterns: List[Pattern]
    attack_techniques: List[Dict[str, str]]
    timestamps: Dict[str, Any]
    recommendations: List[str]

class AnalysisAgent:
    """
    Agent responsible for analyzing hunt results and identifying key findings,
    patterns, and potential threats.
    """
    
    def __init__(self):
        # In a real implementation, this would initialize a language model
        pass
    
    async def analyze_results(self, plan_id: str, raw_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze hunt results to identify patterns, anomalies, and potential threats
        
        For this example, we're using a hard-coded mock response.
        """
        try:
            # Get the original hypothesis
            hunt_plan = await self._get_hunt_plan(plan_id)
            hypothesis = hunt_plan.get("hypothesis", "")
            
            # Create a mock analysis result
            result_id = raw_results.get("result_id", str(uuid.uuid4()))
            
            analysis_result = AnalysisResult(
                result_id=result_id,
                plan_id=plan_id,
                summary={
                    "total_queries": 3,
                    "successful_queries": 3,
                    "total_results": 127,
                    "execution_time": "1m 42s"
                },
                findings=[
                    Finding(
                        id="find1",
                        title="Suspicious WMI Event Consumer Registration",
                        description="A new WMI event consumer was registered on DC01 that executes a PowerShell script from a temp directory. This is consistent with WMI persistence techniques described in ATT&CK T1546.003.",
                        severity="critical",
                        confidence=0.95,
                        affected_hosts=["DC01"],
                        events_count=3,
                        techniques=["T1546.003"],
                        details={
                            "event_timestamp": "2023-06-15T14:22:33Z",
                            "user": "DOMAIN\\admin",
                            "command": "powershell.exe -NoP -NonI -W Hidden -Enc UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgACIAYwA6AFwAdwBpAG4AZABvAHcAcwBcAHMAeQBzAHQAZQBtADMAMgBcAGMAYQBsAGMALgBlAHgAZQAiAA==",
                            "decoded_command": "Start-Process \"c:\\windows\\system32\\calc.exe\"",
                            "consumer_name": "Evil Consumer",
                            "filter_query": "SELECT * FROM __InstanceCreationEvent WITHIN 5 WHERE TargetInstance ISA \"Win32_Process\" AND TargetInstance.Name = \"svchost.exe\""
                        }
                    ),
                    Finding(
                        id="find2",
                        title="Lateral Movement via WMI",
                        description="Multiple instances of WMIC.exe executing remote process creation commands from WORKSTATION03 to several servers. This is consistent with lateral movement using WMI as described in ATT&CK T1047.",
                        severity="high",
                        confidence=0.88,
                        affected_hosts=["SERVER01", "SERVER02", "DC01"],
                        events_count=12,
                        techniques=["T1047", "T1021"],
                        details={
                            "event_timestamp": "2023-06-15T15:45:21Z",
                            "user": "DOMAIN\\user",
                            "command": "wmic /node:SERVER01 process call create \"cmd.exe /c powershell.exe -NoP -NonI -W Hidden -Enc UwB0AGEAcgB0AC0AUAByAG8AYwBlAHMAcwAgACIAYwA6AFwAdwBpAG4AZABvAHcAcwBcAHMAeQBzAHQAZQBtADMAMgBcAGMAYQBsAGMALgBlAHgAZQAiAA==\"",
                            "source_host": "WORKSTATION03",
                            "source_process": "cmd.exe"
                        }
                    ),
                    Finding(
                        id="find3",
                        title="Abnormal WMI Provider Service Activity",
                        description="Unusual spikes in WmiPrvSE.exe activity detected on multiple workstations. While this could be legitimate administrative activity, the pattern is inconsistent with typical baseline activity.",
                        severity="medium",
                        confidence=0.75,
                        affected_hosts=["WORKSTATION01", "WORKSTATION03", "WORKSTATION07"],
                        events_count=32,
                        techniques=["T1047"],
                        details={
                            "time_period": "Last 24 hours",
                            "baseline_daily_avg": "15 executions",
                            "current_count": "47 executions",
                            "anomaly_score": 0.82
                        }
                    )
                ],
                patterns=[
                    Pattern(
                        id="pattern1",
                        name="WMI Command Pattern",
                        description="Commands using WMI for remote execution frequently included encoded PowerShell payloads",
                        count=15
                    ),
                    Pattern(
                        id="pattern2",
                        name="Temporal Pattern",
                        description="Most activity occurred during non-business hours (2am-4am local time)",
                        count=27
                    ),
                    Pattern(
                        id="pattern3",
                        name="Target Selection Pattern",
                        description="Domain controllers and file servers were targeted more frequently than other systems",
                        count=22
                    )
                ],
                attack_techniques=[
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
                timestamps={
                    "analyzed_at": datetime.now().isoformat(),
                    "execution_start": raw_results.get("execution_start", datetime.now().isoformat())
                },
                recommendations=[
                    "Investigate the suspicious WMI event consumer on DC01 and remove if unauthorized",
                    "Review DOMAIN\\admin and DOMAIN\\user activities during the time periods of suspicious activity",
                    "Implement WMI logging across the environment for better visibility",
                    "Consider implementing PowerShell Script Block Logging to capture the execution of encoded commands",
                    "Review firewall rules to limit WMI traffic between workstations and critical servers"
                ]
            )
            
            return analysis_result.dict()
        except Exception as e:
            # Log the error
            print(f"Error analyzing results: {str(e)}")
            raise
    
    def _prepare_results_for_analysis(self, raw_results: Dict[str, Any]) -> str:
        """
        Prepare raw results for analysis by summarizing and formatting them
        """
        summary = raw_results.get("summary", {})
        query_results = raw_results.get("query_results", [])
        
        # Create a summary string
        result_str = f"Summary: {summary.get('total_results', 0)} total results from {summary.get('total_queries', 0)} queries.\n\n"
        
        # Add details for each query result
        for qr in query_results:
            result_str += f"Query ID: {qr.get('query_id')}\n"
            result_str += f"Data Source: {qr.get('data_source')}\n"
            result_str += f"Status: {qr.get('status')}\n"
            
            if qr.get("status") == "success":
                result_str += f"Result Count: {qr.get('result_count', 0)}\n"
                
                # Add sample of results (limiting to prevent token overflow)
                results = qr.get("results", [])
                sample_size = min(10, len(results))
                
                if sample_size > 0:
                    result_str += "Sample Results:\n"
                    for i in range(sample_size):
                        result_str += f"  - {str(results[i])[:500]}...\n"
                
                if len(results) > sample_size:
                    result_str += f"  (and {len(results) - sample_size} more results)\n"
            else:
                result_str += f"Error: {qr.get('error_message', 'Unknown error')}\n"
            
            result_str += "\n"
        
        return result_str
    
    async def _get_hunt_plan(self, plan_id: str) -> Dict[str, Any]:
        """
        Get a hunt plan by ID
        
        In a real app, this would retrieve the plan from a database.
        For this example, we're returning a placeholder.
        """
        # In a real app, this would fetch from a database
        return {
            "plan_id": plan_id,
            "hypothesis": "I suspect an attacker is using WMI for lateral movement, hiding persistence in WMI event consumer bindings."
        }
