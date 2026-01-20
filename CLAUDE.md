# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```bash
npm install          # Install dependencies
npm run dev          # Start dev server on port 5000
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

## Architecture

This is a React SPA for the Phitopolis corporate website, using Vite as the build tool and deployed to Netlify.

### Key Files
- `App.tsx` - Main app component with HashRouter, Header, Footer, and all routes
- `index.tsx` - React entry point
- `index.html` - Contains Tailwind config, custom CSS (including `.wysiwyg-content` styles for Directus content), and import maps
- `constants.tsx` - Static data for services, jobs, blog posts, and team members
- `types.ts` - TypeScript interfaces (Service, Job, BlogPost, TeamMember)

### Page Structure
Pages live in `app/` using Next.js-like conventions but are standard React components:
- `app/page.tsx` - Home
- `app/services/page.tsx` - Services
- `app/about/page.tsx` - About
- `app/careers/page.tsx` - Careers listing
- `app/careers/[slug]/page.tsx` - Career detail (dynamic)
- `app/blog/page.tsx` - Blog listing
- `app/blog/[slug]/page.tsx` - Blog post detail (dynamic)
- `app/contact/page.tsx` - Contact
- `app/team/page.tsx` - Team

### Data Layer
Dynamic content (careers, blog posts) comes from a Directus CMS via GraphQL:
- `lib/apollo-client.ts` - Apollo Client setup with environment-aware endpoints
- `lib/graphql/queries.ts` - GraphQL queries for careers and blogs
- `lib/utils.ts` - Asset URL helper function

**Data fetching pattern:** Pages use `useState` + `useEffect` with `apolloClient.query()`. Include loading, error, and empty states:
```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

### Backend Proxy
- **Development**: Vite proxies `/graphql` and `/assets` to Directus (configured in `vite.config.ts`)
- **Production**: Netlify Functions proxy requests to avoid mixed content issues:
  - `netlify/functions/graphql.ts` - GraphQL proxy
  - `netlify/functions/assets.ts` - Asset proxy

Environment variables for Netlify (see `.env.example`):
- `DIRECTUS_GRAPHQL_URL`
- `DIRECTUS_ASSETS_URL`

### Styling
- Tailwind CSS loaded via CDN in `index.html`
- Custom colors: `primary` (deep blue #0A2A66), `accent` (golden yellow #FFC72C)
- Fonts: Inter (body), Outfit (display/headings)
- Framer Motion for animations
- Use `.wysiwyg-content` class for rendering HTML content from Directus

### Routing
Uses HashRouter (`#/path`) for Netlify SPA compatibility. The `netlify.toml` has a catch-all redirect to `index.html`.
