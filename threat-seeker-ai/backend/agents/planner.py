from datetime import datetime
import uuid
from typing import Dict, List, Optional, Any

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain.output_parsers import PydanticOutputParser
from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field

from config.settings import settings

class QueryDetails(BaseModel):
    query_id: str = Field(description="Unique ID for this query")
    data_source: str = Field(description="Data source type (e.g., 'splunk', 'elastic', 'crowdstrike')")
    query_string: str = Field(description="The actual query string formatted for the specific data source")
    explanation: str = Field(description="Natural language explanation of what this query is looking for")
    technique_ids: List[str] = Field(description="MITRE ATT&CK technique IDs this query is targeting")
    time_range: Dict[str, str] = Field(description="Time range for the query")
    expected_volume: str = Field(description="Expected volume of results (e.g., 'high', 'medium', 'low')")
    risk_level: str = Field(description="Risk level if this query returns results (e.g., 'critical', 'high', 'medium', 'low')")

class HuntPlan(BaseModel):
    plan_id: str = Field(description="Unique ID for this hunt plan")
    hypothesis: str = Field(description="Original hypothesis provided by the analyst")
    queries: List[QueryDetails] = Field(description="List of queries to execute for this hunt")
    created_at: datetime = Field(description="Timestamp when this plan was created")
    analyst_id: str = Field(description="ID of the analyst who created this hypothesis")
    mitre_techniques: List[Dict[str, str]] = Field(description="List of MITRE ATT&CK techniques relevant to this hypothesis")
    estimated_execution_time: str = Field(description="Estimated time to execute all queries")

class HuntPlannerAgent:
    """
    Agent responsible for translating natural language hypotheses into detailed hunt plans
    with specific queries for different data sources.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=0.1,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.parser = PydanticOutputParser(pydantic_object=HuntPlan)
        
        self.prompt_template = PromptTemplate(
            template="""You are an expert threat hunter with deep knowledge of security tools, 
            data sources, and the MITRE ATT&CK framework.

            Given the following hypothesis from a security analyst, create a detailed hunt plan 
            with specific queries for different data sources.

            HYPOTHESIS: {hypothesis}

            ADDITIONAL CONTEXT (if available): {context}

            Your task is to create a comprehensive hunt plan that includes:
            1. Relevant MITRE ATT&CK techniques
            2. Specific queries for different data sources (Splunk, Elastic, CrowdStrike, etc.)
            3. Natural language explanations for each query
            4. Expected result volumes and risk levels

            {format_instructions}
            """,
            input_variables=["hypothesis", "context"],
            partial_variables={"format_instructions": self.parser.get_format_instructions()}
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
    
    async def create_plan(self, hypothesis: str, analyst_id: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a hunt plan from a natural language hypothesis
        """
        try:
            # Generate a unique plan ID
            plan_id = str(uuid.uuid4())
            
            # Format context if provided, otherwise use empty string
            context_str = str(context) if context else ""
            
            # Run the chain
            result = await self.chain.arun(
                hypothesis=hypothesis,
                context=context_str
            )
            
            # Parse the result into a HuntPlan object
            hunt_plan = self.parser.parse(result)
            
            # Set fields that should be generated here rather than by the LLM
            hunt_plan.plan_id = plan_id
            hunt_plan.created_at = datetime.now()
            hunt_plan.analyst_id = analyst_id
            
            return hunt_plan.dict()
        except Exception as e:
            # Log the error
            print(f"Error creating hunt plan: {str(e)}")
            raise
