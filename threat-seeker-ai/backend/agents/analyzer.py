from datetime import datetime
import uuid
from typing import Dict, List, Any, Optional

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from config.settings import settings

class AnalysisResult(BaseModel):
    result_id: str = Field(description="Unique ID for this analysis result")
    plan_id: str = Field(description="ID of the hunt plan these results are from")
    summary: Dict[str, Any] = Field(description="Summary statistics of the analysis")
    findings: List[Dict[str, Any]] = Field(description="List of key findings from the analysis")
    patterns: List[Dict[str, Any]] = Field(description="Patterns identified in the data")
    attack_techniques: List[Dict[str, str]] = Field(description="MITRE ATT&CK techniques identified in the results")
    timestamps: Dict[str, datetime] = Field(description="Important timestamps for this analysis")
    recommendations: List[str] = Field(description="Recommendations for further investigation")

class AnalysisAgent:
    """
    Agent responsible for analyzing hunt results and identifying key findings,
    patterns, and potential threats.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=0.1,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.parser = PydanticOutputParser(pydantic_object=AnalysisResult)
        
        self.prompt_template = PromptTemplate(
            template="""You are an expert security analyst tasked with analyzing the results of a threat hunt.

            ORIGINAL HYPOTHESIS: {hypothesis}
            
            RAW HUNT RESULTS: 
            {raw_results}

            Your task is to analyze these results to:
            1. Identify the most significant findings related to the hypothesis
            2. Recognize patterns that might indicate malicious activity
            3. Map findings to MITRE ATT&CK techniques
            4. Provide recommendations for further investigation
            
            Focus on finding the signal in the noise - what are the most important, suspicious, or unexpected results?
            
            {format_instructions}
            """,
            input_variables=["hypothesis", "raw_results"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
    
    async def analyze_results(self, plan_id: str, raw_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze hunt results to identify patterns, anomalies, and potential threats
        """
        try:
            # Get the original hypothesis
            hunt_plan = await self._get_hunt_plan(plan_id)
            hypothesis = hunt_plan.get("hypothesis", "")
            
            # Prepare raw results for analysis
            # In a real application, we would need to handle large result sets carefully
            results_summary = self._prepare_results_for_analysis(raw_results)
            
            # Run the analysis chain
            result = await self.chain.arun(
                hypothesis=hypothesis,
                raw_results=results_summary
            )
            
            # Parse the result
            analysis_result = self.parser.parse(result)
            
            # Set fields that should be generated here rather than by the LLM
            analysis_result.result_id = raw_results.get("result_id", str(uuid.uuid4()))
            analysis_result.plan_id = plan_id
            analysis_result.timestamps = {
                "analyzed_at": datetime.now(),
                "execution_start": raw_results.get("execution_start", datetime.now().isoformat())
            }
            
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
        result_str = f"Summary: {summary['total_results']} total results from {summary['total_queries']} queries.\n\n"
        
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
