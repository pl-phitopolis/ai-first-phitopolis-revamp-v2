# Feature Specification: AI Day Page Upgrade

This document provides a consolidated view of the implementation plan and task checklist for enhancing the '/ai-day' presentation page.

## Implementation Plan

### Overview
Enhance the '/ai-day' page to match the \"Edge Studio\" inspiration, ensuring high-impact visuals, organic animations, and a premium \"Soft Modernism\" aesthetic.

### Proposed Changes

#### AI Day Page ('app/ai-day/page.tsx')

- **Preloader**: 
    - [MODIFY] Implement multi-step SVG path morphing for the central blob.
    - [MODIFY] Add a scale-up \"iris\" reveal that expands the blob to cover the entire screen before transitioning to the content.
- **Hero Section**:
    - [MODIFY] Add a '<canvas>' background implementing a dynamic, interactive grid/network of points (industrial feel).
    - [MODIFY] Update 'TextScramble' usage with more aggressive, industrial timing.
- **Image Masking**:
    - [MODIFY] Replace standard 'clip-path' with SVG-based organic morphing paths.
    - [MODIFY] Animate these paths as they enter the viewport to create a \"liquid\" expansion effect.
- **Service Wheel**:
    - [MODIFY] Integrate the wheel more deeply into the scroll narrative.
    - [MODIFY] Ensure rotation is perfectly synced with vertical scroll progress.
- **Horizontal Showcase**:
    - [MODIFY] Implement \"Locked Scroll\" where vertical scrolling translates to horizontal movement through the cards.
    - [MODIFY] Add advanced 3D tilt effects to cards and polish magnetic button interactions.
- **Typography & Styling**:
    - [MODIFY] Enforce lowercase-heavy body typography.
    - [MODIFY] Use bolder, larger headings for high impact.
    - [MODIFY] Maximize \"Soft Modernism\" with large border-radii and generous whitespace.

## Technical Tasks

- [ ] **Phase 1: Foundation & Preloader**
    - [ ] Revamp Preloader with multi-step SVG morphing.
    - [ ] Implement the full-screen \"iris\" reveal transition.
- [ ] **Phase 2: Hero & Visual Effects**
    - [ ] Create interactive Canvas background for Hero.
    - [ ] Update Typography and Text Scramble effects.
- [ ] **Phase 3: Organic Masking**
    - [ ] Implement SVG-based organic masking for Vision section images.
    - [ ] Orchestrate mask expansion on scroll entry.
- [ ] **Phase 4: Scroll Narrative**
    - [ ] Refine Service Wheel rotation and sync with Scroll.
    - [ ] Implement Locked Scroll for the Horizontal Showcase.
- [ ] **Phase 5: Polish & Interactions**
    - [ ] Add 3D Tilt and Magnetic interactions to Showcase cards.
    - [ ] Final audit of \"Soft Modernism\" aesthetics and responsive behavior.

## Verification Plan

### Manual Verification
1.  **Browser Check**: Navigate to '/ai-day' and verify:
    - Preloader shows smooth SVG morphing and a dramatic iris reveal.
    - Hero section background is interactive and performant.
    - Images reveal themselves with organic, \"liquid-like\" masks.
    - Service Wheel rotates correctly as the user scrolls.
    - Horizontal showcase \"locks\" vertical scroll and feels smooth.
2.  **Responsiveness**: Test on mobile and desktop viewports.
3.  **Isolation Check**: Ensure no impact on other routes (Header, Footer, Home, etc.).
