from datetime import datetime
from typing import Dict, Any, Optional

from langchain.chains import LLMChain
from langchain.prompts import PromptTemplate
from langchain_openai import ChatOpenAI
from pydantic import BaseModel

from config.settings import settings

class ClarificationAgent:
    """
    Agent responsible for handling ambiguity in analysis results through
    analyst interaction.
    """
    
    def __init__(self):
        self.llm = ChatOpenAI(
            model=settings.DEFAULT_LLM_MODEL,
            temperature=0.3,
            openai_api_key=settings.OPENAI_API_KEY
        )
        
        self.prompt_template = PromptTemplate(
            template="""You are an expert security analyst clarifying aspects of a threat hunt.
            
            HUNT RESULT CONTEXT:
            {context}
            
            ANALYST QUESTION:
            {question}
            
            Please provide a clear, concise answer based on the hunt result context.
            Include any relevant technical details and explain security implications.
            If you're uncertain, state that clearly rather than guessing.
            """,
            input_variables=["context", "question"]
        )
        
        self.chain = LLMChain(llm=self.llm, prompt=self.prompt_template)
    
    async def get_clarification(self, result_id: str, question: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Provide clarification about hunt results based on analyst questions
        """
        try:
            # Get the hunt result
            hunt_result = await self._get_hunt_result(result_id)
            
            # Combine the provided context with the hunt result
            full_context = self._prepare_context(hunt_result, context)
            
            # Run the clarification chain
            answer = await self.chain.arun(
                context=full_context,
                question=question
            )
            
            # Calculate confidence score (simplified for this example)
            # In a real app, this would be based on more sophisticated measures
            confidence = self._calculate_confidence(answer)
            
            return {
                "result_id": result_id,
                "answer": answer,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            # Log the error
            print(f"Error getting clarification: {str(e)}")
            raise
    
    def _prepare_context(self, hunt_result: Dict[str, Any], user_context: Dict[str, Any]) -> str:
        """
        Prepare context for clarification by combining hunt result with user-provided context
        """
        # Start with the hunt result summary
        context_str = "HUNT RESULT SUMMARY:\n"
        
        # Add findings
        findings = hunt_result.get("findings", [])
        context_str += f"Key Findings ({len(findings)}):\n"
        for i, finding in enumerate(findings[:5]):  # Limit to top 5 findings
            context_str += f"  {i+1}. {finding.get('title', 'Unnamed Finding')}: {finding.get('description', 'No description')}\n"
        
        # Add attack techniques
        techniques = hunt_result.get("attack_techniques", [])
        context_str += f"\nIdentified MITRE ATT&CK Techniques ({len(techniques)}):\n"
        for technique in techniques[:5]:  # Limit to top 5 techniques
            context_str += f"  - {technique.get('id', 'Unknown')}: {technique.get('name', 'Unknown')}\n"
        
        # Add user-provided context
        context_str += "\nADDITIONAL CONTEXT:\n"
        for key, value in user_context.items():
            context_str += f"  {key}: {value}\n"
        
        return context_str
    
    def _calculate_confidence(self, answer: str) -> float:
        """
        Calculate confidence score for the answer
        
        In a real app, this would use more sophisticated methods.
        For this example, we're using a simple heuristic.
        """
        # Simple confidence heuristic based on hedge words
        hedge_words = ["might", "could", "possibly", "perhaps", "not sure", 
                      "uncertain", "may", "unclear", "don't know"]
        
        # Count hedge words
        hedge_count = sum(answer.lower().count(word) for word in hedge_words)
        
        # Calculate confidence (inversely related to hedge words)
        base_confidence = 0.9  # Start with high confidence
        confidence = max(0.1, min(0.99, base_confidence - (hedge_count * 0.1)))
        
        return confidence
    
    async def _get_hunt_result(self, result_id: str) -> Dict[str, Any]:
        """
        Get a hunt result by ID
        
        In a real app, this would retrieve the result from a database.
        For this example, we're returning a placeholder.
        """
        # In a real app, this would fetch from a database
        return {
            "result_id": result_id,
            "findings": [
                {
                    "title": "WMI Persistence Detected",
                    "description": "WMI event consumer bindings found on critical servers"
                }
            ],
            "attack_techniques": [
                {
                    "id": "T1546.003",
                    "name": "Windows Management Instrumentation Event Subscription"
                }
            ]
        }
