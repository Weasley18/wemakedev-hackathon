from datetime import datetime
import uuid
from typing import Dict, List, Optional, Any

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from config.settings import settings

class CriticAgent:
    """
    Agent responsible for reviewing and critiquing hunt plans before they are presented to analysts.
    Acts as a "Red Team" security expert to improve the quality of generated queries.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=0.2,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.prompt_template = PromptTemplate(
            template="""You are an expert "Red Team" security analyst tasked with critiquing a threat hunt plan 
            before it is presented to the security team.

            HUNT PLAN DETAILS:
            Hypothesis: {hypothesis}
            
            QUERIES TO REVIEW:
            {queries}
            
            Your task is to critically evaluate each query in the hunt plan and provide feedback on:
            
            1. EFFICIENCY: Is the query optimized for performance? Could it be rewritten to be less resource-intensive?
            
            2. ACCURACY: Does the query accurately reflect the hypothesis and the targeted MITRE techniques?
            Are there any logical errors or misconceptions in how the query is formulated?
            
            3. GAPS: Are there any missing queries that should be included to fully investigate the hypothesis?
            Are there important data sources or detection opportunities being overlooked?
            
            4. FALSE POSITIVES: Will the query likely generate too many false positives? How could it be refined?
            
            5. EVASION RESISTANCE: Could a sophisticated attacker easily evade detection by this query?
            How could it be improved to catch evasive techniques?
            
            For each query, provide specific, actionable feedback. If a query looks good, acknowledge its strengths.
            If improvements are needed, suggest specific changes to the query.

            Always include specific technical recommendations and provide example modifications where appropriate.
            
            Format your response as a JSON object with the following structure:
            {{
                "query_critiques": [
                    {{
                        "query_id": "ID of the query",
                        "critique": "Your detailed critique",
                        "suggested_modifications": "Specific changes to improve the query",
                        "critique_severity": "high/medium/low" // How urgent/important is this feedback
                    }},
                    // More query critiques...
                ],
                "overall_assessment": "Your overall assessment of the hunt plan",
                "missing_detection_opportunities": ["List of any detection opportunities that are being missed"],
                "additional_data_sources": ["Any additional data sources that should be considered"]
            }}
            """,
            input_variables=["hypothesis", "queries"]
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
    
    async def critique_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
        """
        Critique a hunt plan and provide feedback on each query
        """
        try:
            # Extract the hypothesis and queries from the plan
            hypothesis = plan.get("hypothesis", "")
            queries = plan.get("queries", [])
            
            # Format the queries for the prompt
            queries_str = ""
            for i, query in enumerate(queries):
                queries_str += f"QUERY {i+1} (ID: {query.get('query_id', 'unknown')}):\n"
                queries_str += f"Data Source: {query.get('data_source', 'unknown')}\n"
                queries_str += f"Query String: {query.get('query_string', 'unknown')}\n"
                queries_str += f"Explanation: {query.get('explanation', 'unknown')}\n"
                queries_str += f"Targeted MITRE Techniques: {', '.join(query.get('technique_ids', []))}\n"
                queries_str += f"Expected Volume: {query.get('expected_volume', 'unknown')}\n"
                queries_str += f"Risk Level: {query.get('risk_level', 'unknown')}\n\n"
            
            # Run the critique chain
            critique_result = await self.chain.arun(
                hypothesis=hypothesis,
                queries=queries_str
            )
            
            # Parse the critique result
            import json
            critique_data = json.loads(critique_result)
            
            # Add critique to each query in the original plan
            for query in plan["queries"]:
                # Find the matching critique
                for critique in critique_data.get("query_critiques", []):
                    if critique.get("query_id") == query["query_id"]:
                        # Add critique to the query
                        query["critique"] = {
                            "feedback": critique.get("critique", ""),
                            "suggested_modifications": critique.get("suggested_modifications", ""),
                            "severity": critique.get("critique_severity", "low")
                        }
                        break
                
                # If no critique found, add a default one
                if "critique" not in query:
                    query["critique"] = {
                        "feedback": "No specific feedback for this query.",
                        "suggested_modifications": "",
                        "severity": "low"
                    }
            
            # Add overall assessment to the plan
            plan["critique_summary"] = {
                "overall_assessment": critique_data.get("overall_assessment", ""),
                "missing_detection_opportunities": critique_data.get("missing_detection_opportunities", []),
                "additional_data_sources": critique_data.get("additional_data_sources", []),
                "critiqued_at": datetime.now().isoformat()
            }
            
            return plan
        except Exception as e:
            # Log the error
            print(f"Error critiquing hunt plan: {str(e)}")
            raise
