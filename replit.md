# Phitopolis Technology Services

## Overview
A React-based company website for Phitopolis, a technology services company founded by veterans in finance that builds data systems. The site includes pages for Services, About, Careers, Blog, and Contact with an AI-powered chat feature using Google's Gemini API.

## Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI Integration**: Google Gemini API (@google/genai)

## Project Structure
```
/
├── App.tsx           # Main app component with routing
├── index.tsx         # Entry point
├── index.html        # HTML template with Tailwind config
├── constants.tsx     # App constants and data
├── types.ts          # TypeScript type definitions
├── vite.config.ts    # Vite configuration
├── app/              # Page components
├── public/           # Static assets (moved from assets/)
└── services/         # API services (Gemini)
```

## Recent Changes
- Moved all project assets (videos, images) to the `public/` directory for better serving.
- Cleaned up duplicate assets and updated application code to reference the new `/public` paths.

## Running the Project
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build` (outputs to dist/)
- Preview: `npm run preview`

## Environment Variables
- `GEMINI_API_KEY`: Google Gemini API key for AI chat features

## Deployment
Configured for static deployment with Vite build output.
