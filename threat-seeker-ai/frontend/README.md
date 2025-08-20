# Threat-Seeker AI Frontend

This directory contains the React/TypeScript frontend for Threat-Seeker AI.

## Technology Stack

- **React**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **React Router**: Navigation
- **Shadcn/UI**: UI components
- **Tailwind CSS**: Styling
- **React Query**: Data fetching
- **Axios**: HTTP client
- **Lucide React**: Icons

## Architecture

The frontend implements the key interfaces for Threat-Seeker AI:

1. **Dashboard**: Overview of hunt activities and system status
2. **Hunt Creation**: Natural language hypothesis entry for new hunts
3. **Hunt Review**: Human-in-the-loop review and approval of AI-generated hunt plans
4. **Hunt Results**: Analysis of hunt results with visual attack path correlation
5. **Settings**: Configuration for data sources and system behavior

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm run dev
   ```

3. Build for production:
   ```
   npm run build
   ```

## Development

The project structure follows a standard React/Vite setup:

- `src/components`: UI components
- `src/pages`: Application pages
- `src/layouts`: Layout components
- `src/hooks`: Custom React hooks
- `src/context`: React context providers
- `src/services`: API services
- `src/styles`: Global styles
- `src/lib`: Utility functions
- `src/types`: TypeScript types
- `src/assets`: Static assets
