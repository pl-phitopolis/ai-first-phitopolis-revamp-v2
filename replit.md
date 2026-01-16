# Phitopolis Technology Services

## Overview
A React-based company website for Phitopolis, a technology services company founded by veterans in finance that builds data systems. The site includes pages for Services, About, Careers, Blog, and Contact.

## Tech Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (via CDN)
- **Routing**: React Router DOM v6
- **Animations**: Framer Motion
- **Icons**: Lucide React

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
└── public/           # Static assets (moved from assets/)
```

## Recent Changes
- Removed Phitopolis AI chatbox and related components.
- Deleted Google Gemini API service integration.
- Moved all project assets (videos, images) to the `public/` directory for better serving.
- Cleaned up duplicate assets and updated application code to reference the new `/public` paths.

## Running the Project
- Development: `npm run dev` (runs on port 5000)
- Build: `npm run build` (outputs to dist/)
- Preview: `npm run preview`

## Deployment
Configured for static deployment with Vite build output.
