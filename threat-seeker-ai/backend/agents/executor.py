from datetime import datetime
import uuid
import asyncio
from typing import Dict, List, Optional, Any

from config.settings import settings
from connectors.splunk import SplunkConnector
from connectors.elastic import ElasticConnector
from connectors.rest_api import RestApiConnector

class HuntExecutionAgent:
    """
    Agent responsible for executing approved queries against different data sources
    and collecting the results.
    """
    
    def __init__(self):
        # Initialize connectors
        self.connectors = {
            "splunk": SplunkConnector(
                host=settings.SPLUNK_HOST,
                port=settings.SPLUNK_PORT,
                username=settings.SPLUNK_USERNAME,
                password=settings.SPLUNK_PASSWORD
            ),
            "elastic": ElasticConnector(
                hosts=settings.ELASTIC_HOSTS,
                username=settings.ELASTIC_USERNAME,
                password=settings.ELASTIC_PASSWORD
            ),
            "rest_api": RestApiConnector()
        }
        
    async def execute_query(self, query_details: Dict[str, Any], modifications: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Execute a single query against its specified data source
        """
        data_source = query_details.get("data_source", "").lower()
        query_string = query_details.get("query_string", "")
        
        # Apply any modifications to the query string
        if modifications and query_details["query_id"] in modifications:
            query_string = modifications[query_details["query_id"]]
        
        # Check if we have a connector for this data source
        if data_source not in self.connectors:
            raise ValueError(f"Unsupported data source: {data_source}")
        
        try:
            # Execute the query using the appropriate connector
            connector = self.connectors[data_source]
            
            # Get time range from query details or use default
            time_range = query_details.get("time_range", {
                "start": "-24h",
                "end": "now"
            })
            
            # Execute the query
            start_time = datetime.now()
            results = await connector.execute_query(
                query_string=query_string,
                time_range=time_range,
                max_results=settings.MAX_RESULTS_PER_QUERY
            )
            end_time = datetime.now()
            
            # Calculate execution time
            execution_time = (end_time - start_time).total_seconds()
            
            return {
                "query_id": query_details["query_id"],
                "data_source": data_source,
                "results": results,
                "result_count": len(results),
                "execution_time": execution_time,
                "executed_at": end_time.isoformat(),
                "status": "success"
            }
        except Exception as e:
            # Log the error
            print(f"Error executing query {query_details['query_id']}: {str(e)}")
            
            # Return error information
            return {
                "query_id": query_details["query_id"],
                "data_source": data_source,
                "status": "error",
                "error_message": str(e),
                "executed_at": datetime.now().isoformat()
            }
    
    async def execute_queries(self, plan_id: str, query_ids: List[str], modifications: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """
        Execute multiple approved queries from a hunt plan
        """
        try:
            # Get the hunt plan (in a real app, this would come from a database)
            # For this example, we're simulating it
            hunt_plan = await self._get_hunt_plan(plan_id)
            
            # Filter for only approved queries
            approved_queries = [q for q in hunt_plan["queries"] if q["query_id"] in query_ids]
            
            # Execute all approved queries concurrently
            tasks = [self.execute_query(query, modifications) for query in approved_queries]
            query_results = await asyncio.gather(*tasks)
            
            # Format the results
            result_id = str(uuid.uuid4())
            results = {
                "result_id": result_id,
                "plan_id": plan_id,
                "execution_start": datetime.now().isoformat(),
                "query_results": query_results,
                "summary": {
                    "total_queries": len(query_results),
                    "successful_queries": sum(1 for r in query_results if r["status"] == "success"),
                    "failed_queries": sum(1 for r in query_results if r["status"] == "error"),
                    "total_results": sum(r.get("result_count", 0) for r in query_results)
                }
            }
            
            return results
        except Exception as e:
            # Log the error
            print(f"Error executing hunt plan {plan_id}: {str(e)}")
            raise
    
    async def _get_hunt_plan(self, plan_id: str) -> Dict[str, Any]:
        """
        Get a hunt plan by ID
        
        In a real app, this would retrieve the plan from a database.
        For this example, we're returning a placeholder.
        """
        # In a real app, this would fetch from a database
        return {
            "plan_id": plan_id,
            "queries": [
                # This would be populated with actual queries in a real app
                # We're returning an empty list for this example
            ]
        }
