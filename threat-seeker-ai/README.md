# Threat-Seeker AI: The Ultimate Threat Hunting Co-Pilot

Threat-Seeker AI is an elite, hypothesis-driven threat hunting assistant designed to empower security analysts in proactive threat detection. It uses a sophisticated multi-agent architecture to translate natural language hypotheses into comprehensive hunt plans, execute them securely, and analyze results for hidden threats.

![Threat-Seeker AI Architecture](docs/architecture.png)

## Core Philosophy

- **Empower, Not Replace**: Built to augment human expertise, not replace it
- **Plan/Execute Separation**: Strict separation between planning and execution for safety
- **Hypothesis-Driven**: Focuses on targeted hunting based on specific hypotheses

## Multi-Agent Architecture

Threat-Seeker AI uses a Portia AI-based multi-agent architecture:

1. **Hunt Planner Agent**: Translates natural language hypotheses into comprehensive hunt plans with specific queries
2. **Analyst Review & Approval Gate**: Human-in-the-loop interface for reviewing and approving hunt plans
3. **Hunt Execution Agent**: Executes approved queries against multiple data sources
4. **Analysis Agent**: Processes results to identify critical threats and patterns
5. **Clarification Agent**: Handles ambiguity through analyst interaction

## Key Features

- **Natural Language Hypothesis Processing**: Convert plain language suspicions into actionable hunt plans
- **Multi-Source Query Generation**: Automatically creates source-specific queries (Splunk SPL, Elastic KQL, etc.)
- **Intelligent Result Analysis**: AI-powered filtering and prioritization of results
- **Hypothesis Generation Engine**: Proactively suggests new hunt hypotheses based on threat intelligence and anomaly detection
- **Visual Attack Path Correlation**: Maps potential attack chains across systems
- **Adaptive Learning**: Improves over time through analyst feedback

## Technology Stack

### Frontend
- **React/TypeScript**: UI framework
- **Vite**: Build tool
- **Shadcn/UI & Tailwind CSS**: UI components and styling
- **React Router**: Navigation
- **React Query**: Data fetching

### Backend
- **Python/FastAPI**: API framework
- **LangChain**: Agent framework for LLM orchestration
- **Modular Connectors**: For Splunk, Elasticsearch, and REST APIs

## Project Structure

- `/frontend`: React/TypeScript frontend
- `/backend`: Python FastAPI backend

## Setup and Installation

### Backend
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Copy `env.example` to `.env` and fill in your configuration values:
   ```
   cp env.example .env
   ```

5. Run the development server:
   ```
   uvicorn main:app --reload
   ```

### Frontend
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

## Usage

1. **Create a Hunt**: Enter a natural language hypothesis about a potential threat
2. **Review the Hunt Plan**: Examine the AI-generated queries and modify if needed
3. **Execute the Hunt**: Run the approved queries against your data sources
4. **Analyze Results**: Review the AI-analyzed findings and recommendations
5. **Ask for Clarification**: Use the Clarification Agent for deeper insights

## Security Considerations

- API keys and credentials are securely stored and encrypted
- Human-in-the-loop approval required before executing any queries
- All executed queries are logged for audit purposes