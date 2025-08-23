# Threat-Seeker AI Backend

This directory contains the Python FastAPI backend for Threat-Seeker AI.

## Architecture

The backend implements a sophisticated multi-agent architecture:

- **Hunt Planner Agent**: Converts analyst hypotheses into detailed hunt plans
- **Critic Agent**: Reviews and improves hunt plans before they reach analysts
- **Hunt Execution Agent**: Securely executes approved queries against data sources
- **Analysis Agent**: Processes results using Mixture of Experts (MoE) approach with specialized experts for different data types
- **Clarification Agent**: Handles ambiguities through analyst interaction
- **Hypothesis Generator Agent**: Dynamically generates relevant hunt hypotheses from threat intelligence

## Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   # For development
   pip install -r requirements.txt
   
   # For deployment
   pip install -e .
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

- `POST /api/hypothesis`: Generate a hunt plan from a natural language hypothesis (includes critic review)
- `POST /api/execute`: Execute approved queries from a hunt plan
- `POST /api/clarify`: Request clarification about hunt results
- `GET /api/suggested-hypotheses`: Get AI-generated threat hunting hypotheses
- `GET /api/health`: Health check endpoint

## Data Source Connectors

The backend includes modular connectors for different data sources:

- **Splunk**: Query Splunk instances for security data
- **Elasticsearch**: Search Elasticsearch for security events
- **REST API**: Connect to generic REST APIs (like threat intelligence services)

## Deployment

For deployment to platforms like Render:

1. Use the provided setup.py for installation:
   ```
   pip install -e .
   ```

2. The deployment process uses a custom build command that handles dependencies correctly.

3. For troubleshooting deployment issues, check that all requirements are properly installed and that the application can find all necessary modules.

## Development

To add a new data source connector:

1. Create a new connector class in the `connectors` directory
2. Implement the `execute_query` method
3. Register the connector in the `HuntExecutionAgent` class
