# Phitopolis Technology Services

Corporate website for [Phitopolis](https://phitopolis.com) — a technology R&D firm founded by veterans in finance, specializing in full-stack development, data science, and AI/ML solutions for quantitative finance.

## Tech Stack

- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (CDN), custom theme with Inter + Outfit fonts
- **Routing:** React Router DOM v6 (BrowserRouter)
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **CMS:** Directus (headless) via GraphQL
- **Data Fetching:** Apollo Client

## Getting Started

### Prerequisites

- Node.js (v18+)
- A running Directus instance (or access to `https://directus.phitopolis.io`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start dev server (runs on port 5000)
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|---|---|---|
| `VITE_DIRECTUS_URL` | Directus CMS base URL | `https://directus.phitopolis.io` |

### Build

```bash
# Production build (outputs to dist/)
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
├── App.tsx                  # Root component (Header, Footer, Routes)
├── index.tsx                # React entry point
├── index.html               # HTML template + Tailwind config + custom CSS
├── constants.tsx             # Static data (services, team)
├── types.ts                 # TypeScript interfaces
├── vite.config.ts            # Vite config with dev proxy
├── app/
│   ├── page.tsx             # Home (landing page)
│   ├── services/page.tsx    # Services
│   ├── about/page.tsx       # About
│   ├── careers/page.tsx     # Careers listing
│   ├── careers/[slug]/page.tsx  # Career detail
│   ├── blog/page.tsx        # Blog listing
│   ├── blog/[slug]/page.tsx # Blog post detail
│   ├── contact/page.tsx     # Contact
│   └── team/page.tsx        # Team
├── lib/
│   ├── apollo-client.ts     # Apollo Client setup
│   ├── graphql/queries.ts   # GraphQL queries
│   └── utils.ts             # Asset URL helpers
└── public/                  # Static assets (videos, images, SVGs)
```

## Data Layer

Dynamic content (careers, blog posts) is fetched from Directus CMS via GraphQL using Apollo Client.

- **Development:** Vite proxies `/graphql` and `/assets` to the Directus URL
- **Production:** Frontend connects directly to Directus

## Design Tokens

| Token | Value |
|---|---|
| Primary (Navy) | `#0A2A66` |
| Accent (Gold) | `#FFC72C` |
| Body Font | Inter |
| Display Font | Outfit |

## Deployment

Static SPA — build with `npm run build` and serve the `dist/` directory. The web server must be configured to serve `index.html` for all routes to support client-side routing.

Currently deployed to EC2 at `uat.phitopolis.io`.
