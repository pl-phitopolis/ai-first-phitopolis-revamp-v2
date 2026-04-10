# Feature Specification: AI Day Presentation Page

## CRITICAL: Strict Isolation Rules
> [!IMPORTANT]
> This project is strictly limited to the creation of the `/ai-day` page. 
> - **DO NOT** modify any existing page components or logic (e.g., `Home.tsx`, `Services.tsx`, etc.).
> - **DO NOT** modify the global `Header`, `Footer`, or `MobileNavigation` components.
> - **DO NOT** alter existing global CSS variables or Tailwind configurations if it impacts external pages.
> - **ISOLATION**: The AI Day page **must** use a custom layout that bypasses the global site furniture.

## Overview
This document outlines the design and technical specifications for a specialized "AI Day Presentation" page. This page is designed to be a high-impact, interactive experience presented during Phitopolis' AI Day. It draws inspiration from the award-winning [Edge Studio](https://edge.studio/) while maintaining Phitopolis' brand identity.

## Design Philosophy

### 1. Aesthetic: Soft Modernism
- **Color Palette**: 
  - **Base**: Off-white/Light Gray (`#F5F5F5`) for a clean, spacious look.
  - **Accent**: Coral/Orange (`#FF7F50`) for interactive elements and highlights.
  - **Contrast**: Deep Charcoal (`#1A1A1A`) for high-impact content sections.
- **Typography**: 
  - **Headings**: Bold, condensed sans-serif with a "tech-industrial" feel.
  - **Body**: Spacious, lowercase-heavy sans-serif for a modern, approachable vibe.
- **Layout**: Large border-radii (e.g., `48px` or `64px`) on containers and images to evoke "Soft Modernism."

### 2. Interaction Model
- **Fluidity**: All transitions must be smooth and organic.
- **Scroll-Driven Narrative**: Use scroll position to reveal content, morph masks, and trigger horizontal movement.

## Core Components & Features

### 1. Logo-Powered Preloader
- **Concept**: A centralized Phitopolis logo inside a morphing, organic shape.
- **Animation**: A glowing, rotating ring (already conceptualized in Phitopolis assets) that expands into a full-page "reveal" when the initial assets are loaded.
- **Tech**: `Lottie` or `framer-motion` for the path transformations.

### 2. Dynamic Hero Section
- **Text Scramble Effect**: The main heading (e.g., "Future Proofing with AI") scrambles into place using an industrial character set.
- **Background**: Subtle parallax depth with abstract connectivity visuals.

### 3. Image Masking (Morphing Shapes)
- **Effect**: Images (e.g., of Phitopolis engineering teams or tech abstractions) appear inside rounded, organic shapes that morph and expand as they enter the viewport.
- **Tech**: `framer-motion` `clip-path` or SVG masking.

### 4. Rotating Service Wheel
- **Interaction**: A circular navigation element that tracks scroll progress. 
- **Content**: Indicators for sections like "Machine Learning," "Data Infrastructure," and "Human-AI Synergy."
- **Behavior**: Clicking a point on the wheel scrolls the page to the corresponding section.

### 5. Horizontal Portfolio Showcase
- **Transition**: At a specific scroll trigger, vertical scrolling pauses, and the user scrolls horizontally through a set of case study cards.
- **Cards**: Feature 3D tilt effects on hover and magnetic primary buttons.

## Content Strategy (AI Day Presentation)

- **Section 01: The Vision**: Redefining software engineering in the age of Agentic AI.
- **Section 02: Core Expertise**: 
  - **Data Science**: From raw data to actionable intelligence.
  - **Full-Stack AI**: Seamlessly integrating models into production-grade apps.
- **Section 03: The Process**: Our "Human-in-the-loop" R&D consulting methodology.
- **Section 04: Innovation Hub**: Showcase of Phitopolis AI-driven projects.

## Technical Integration

### 1. Route Configuration
- **Path**: `/ai-day`
- **Isolation**: To ensure this page remains "very different," it will use a separate Layout component that **excludes** the global Header and Footer.
- **App.tsx Implementation**: 
  ```tsx
  // Concept for AppRoutes.tsx
  <Route path="/ai-day" element={<PresentationLayout><AIDayPage /></PresentationLayout>} />
  ```

### 2. Styling & Dependencies
- Utilize existing `framer-motion` for all orchestration.
- Implement custom CSS for mask-morphing if `framer-motion` SVG transitions are insufficient.
- No changes to existing global CSS variables to avoid affecting other pages.

## Performance & Accessibility
- **Motion Reduction**: Honor `prefers-reduced-motion` settings.
- **Lazy Loading**: All horizontal sections and heavy assets should be lazy-loaded.
- **Semantic HTML**: Use proper sectioning even with complex animation wrappers.
