# Threat-Seeker AI Backend

This directory contains the Python FastAPI backend for Threat-Seeker AI.

## Architecture

The backend implements a multi-agent architecture:

- **Hunt Planner Agent**: Converts analyst hypotheses into detailed hunt plans
- **Hunt Execution Agent**: Securely executes approved queries against data sources
- **Analysis Agent**: Processes results to identify key threats and patterns
- **Clarification Agent**: Handles ambiguities through analyst interaction

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Copy `env.example` to `.env` and fill in your configuration values:
   ```
   cp env.example .env
   ```

4. Run the development server:
   ```
   uvicorn main:app --reload
   ```

## API Endpoints

- `POST /api/hypothesis`: Generate a hunt plan from a natural language hypothesis
- `POST /api/execute`: Execute approved queries from a hunt plan
- `POST /api/clarify`: Request clarification about hunt results
- `GET /api/health`: Health check endpoint

## Data Source Connectors

The backend includes modular connectors for different data sources:

- **Splunk**: Query Splunk instances for security data
- **Elasticsearch**: Search Elasticsearch for security events
- **REST API**: Connect to generic REST APIs (like threat intelligence services)

## Development

To add a new data source connector:

1. Create a new connector class in the `connectors` directory
2. Implement the `execute_query` method
3. Register the connector in the `HuntExecutionAgent` class
