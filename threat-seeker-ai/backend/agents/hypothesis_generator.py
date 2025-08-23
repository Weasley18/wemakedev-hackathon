import json
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional
import uuid

from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel, Field

from config.settings import settings
from connectors.rest_api import RestApiConnector
from utils.retry_handler import async_retry_with_exponential_backoff

# Setup logger
logger = logging.getLogger(__name__)

class HypothesisGeneratorAgent:
    """
    Agent responsible for generating timely threat hunting hypotheses based on 
    current threat intelligence and environmental context.
    """
    
    def __init__(self):
        self.rest_api_connector = RestApiConnector()
        
        self.prompt_template = PromptTemplate(
            template="""You are an expert threat intelligence analyst responsible for generating actionable 
            threat hunting hypotheses for a security team. 

            Your task is to analyze the latest threat intelligence data and generate 3-5 high-quality, 
            specific hunting hypotheses that security analysts should investigate.

            THREAT INTELLIGENCE DATA:
            {threat_intel}
            
            ENTERPRISE ENVIRONMENT CONTEXT:
            {environment_context}

            For each hypothesis, provide:
            1. A clear, specific hypothesis statement that can be tested through data collection and analysis
            2. The threat actor groups (if known) associated with this TTP
            3. The MITRE ATT&CK techniques relevant to this hypothesis
            4. A confidence score (0.0-1.0) representing how confident you are that this is worth investigating
            5. A justification for why this hypothesis is relevant right now
            6. The primary data sources that would be useful for investigating this hypothesis

            Format your response as a JSON array with the following structure:
            [
                {{
                    "id": "A unique ID (use UUID format)",
                    "title": "The hypothesis statement",
                    "description": "Detailed description of what to look for and why",
                    "threat_actors": ["APT29", "FIN7", etc.],
                    "techniques": ["T1078", "T1021.001", etc.],
                    "confidence": 0.85,
                    "justification": "Why this hypothesis is relevant and timely",
                    "data_sources": ["Windows Event Logs", "Endpoint EDR", etc.],
                    "source": "The primary source of this insight (e.g., 'MITRE ATT&CK', 'Recent Breaches', 'Anomaly Detection')"
                }},
                // More hypotheses...
            ]

            Make each hypothesis specific, actionable, and grounded in current threat intelligence.
            """,
            input_variables=["threat_intel", "environment_context"]
        )
        
        # Only initialize LLM if API key is available and valid
        self.llm = None
        self.chain = None
        
        if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY != "your-api-key-here":
            try:
                self.llm = ChatGoogleGenerativeAI(
                    model=settings.DEFAULT_LLM_MODEL,
                    temperature=0.4,
                    google_api_key=settings.GEMINI_API_KEY,
                    convert_system_message_to_human=True
                )
                self.chain = self.prompt_template | self.llm | StrOutputParser()
            except Exception as e:
                            logger.error(f"Failed to initialize LLM: {str(e)}")
            # Continue without LLM - will use mock data
    
    async def _fetch_threat_intelligence(self) -> str:
        """
        Fetch the latest threat intelligence data from external sources
        
        In a real implementation, this would connect to actual threat intel feeds.
        For this example, we're using the RestApiConnector to simulate it.
        """
        try:
            # Fetch MITRE ATT&CK data
            mitre_techniques_query = json.dumps({
                "url": "https://api.example.com/mitre/techniques",
                "method": "GET",
                "params": {
                    "limit": 10,
                    "sort": "updated_desc"
                }
            })
            
            mitre_groups_query = json.dumps({
                "url": "https://api.example.com/mitre/groups",
                "method": "GET",
                "params": {
                    "limit": 5,
                    "sort": "activity_desc"
                }
            })
            
            # Execute the queries
            techniques_results = await self.rest_api_connector.execute_query(
                query_string=mitre_techniques_query,
                time_range={"start": "-30d", "end": "now"},
                max_results=10
            )
            
            groups_results = await self.rest_api_connector.execute_query(
                query_string=mitre_groups_query,
                time_range={"start": "-30d", "end": "now"},
                max_results=5
            )
            
            # Format the results as a string
            intel = "Latest MITRE ATT&CK Techniques:\n"
            for technique in techniques_results:
                intel += f"- {technique.get('id')}: {technique.get('name')}\n"
                intel += f"  Description: {technique.get('description', '')[:200]}...\n"
            
            intel += "\nActive Threat Actor Groups:\n"
            for group in groups_results:
                intel += f"- {group.get('id')}: {group.get('name')} ({', '.join(group.get('aliases', []))})\n"
                intel += f"  Known for techniques: {', '.join(group.get('techniques', []))}\n"
            
            return intel
        except Exception as e:
            logger.error(f"Error fetching threat intelligence: {str(e)}")
            # Return a basic fallback in case of error
            return "Unable to fetch current threat intelligence data."
    
    def _get_environment_context(self) -> str:
        """
        Get context about the enterprise environment
        
        In a real implementation, this would be fetched from a CMDB or similar.
        For this example, we're using a static context.
        """
        return """
        Enterprise Environment:
        - Windows-dominant environment (Windows 10, Server 2016/2019)
        - Cloud infrastructure in Azure
        - Critical services: Active Directory, Exchange, SharePoint
        - VPN for remote access
        - Industry: Financial Services
        - ~5000 endpoints
        - Known security tooling: EDR, SIEM, Firewall, Email Gateway
        
        Recent Security Issues:
        - Multiple phishing attempts targeting financial staff
        - Increased scanning activity from external IPs
        - Several instances of unusual PowerShell execution
        """
    
    async def generate_hypotheses(self, count: int = 5) -> List[Dict[str, Any]]:
        """
        Generate actionable threat hunting hypotheses
        """
        try:
            # Check if LLM chain is initialized
            if self.chain is None:
                # LLM is not available, raise exception to trigger fallback to mock data
                raise ValueError("LLM chain not initialized. Using mock data.")
                
            # Fetch threat intelligence
            threat_intel = await self._fetch_threat_intelligence()
            
            # Get environment context
            environment_context = self._get_environment_context()
            
            # Run the chain with retry logic for handling rate limits
            result = await async_retry_with_exponential_backoff(
                self.chain.ainvoke,
                {
                    "threat_intel": threat_intel,
                    "environment_context": environment_context
                },
                max_retries=5,  # Maximum number of retries
                # The initial_delay will be overridden by API's retry_delay if available
                initial_delay=20,
                max_delay=300  # Maximum delay of 5 minutes
            )
            
            # Parse the result
            hypotheses = json.loads(result)
            
            # Limit to the requested count
            limited_hypotheses = hypotheses[:count] if count < len(hypotheses) else hypotheses
            
            # Ensure each hypothesis has a generated timestamp
            for hypothesis in limited_hypotheses:
                hypothesis["generated_at"] = datetime.now().isoformat()
            
            return limited_hypotheses
        except Exception as e:
            logger.error(f"Error generating hypotheses: {str(e)}")
            # We'll let the main.py handle the fallback to mock data
            raise
