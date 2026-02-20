# Mobile Experience Tuning: Beyond Responsive

**Date:** February 20, 2026
**Target Audience:** Claude (Implementation AI) / UX Engineering Team

> [!NOTE]
> This document outlines a "Mobile-First Premium" strategy. The goal is not just to make the site fit on a phone, but to make it feel like a **native app ecosystem**.

---

## 1. Core Philosophy: "Thumb-First" Design

Current implementation uses a standard top-nav + hamburger menu. This is functional but dated.
**Proposal:** Shift primary navigation to the bottom of the screen for easier reachability on modern tall devices.

### 1.1 The "Dynamic Island" Bottom Bar
Instead of a standard fixed bottom tab bar, implement a **floating glass-morphic island** at the bottom center of the screen.

**Interaction:**
*   **Idle:** Default state shows primary icons (Home, Services, Contact) + a "Menu" trigger.
*   **Scroll Down:** Examples of "Hide on Scroll" behavior to maximize content view.
*   **Scroll Up:** Smoothly slides back in.
*   **Active:** Active tab glows with the accent color (`#FFC72C`).

**Implementation Sketch:**
```tsx
// Suggested Component Structure
<motion.nav 
  className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary/80 backdrop-blur-xl border border-white/10 rounded-full px-6 py-3 flex items-center space-x-6 shadow-2xl z-50"
  initial={{ y: 0 }}
  animate={{ y: isScrollingDown ? 100 : 0 }} // Logic to hide/show
>
  <NavLink icon={<Home />} to="/" />
  <NavLink icon={<Briefcase />} to="/services" />
  <NavLink icon={<Users />} to="/about" />
  <div className="w-px h-6 bg-white/20" /> // Separator
  <MenuTrigger /> // Expands a full-screen overlay for secondary links
</motion.nav>
```

---

## 2. Advanced Gestures & Haptics

Web apps often feel "dead" compared to native apps. We will add life through touch response.

### 2.1 Horizontal Snap Cards (Services)
**Current:** Vertical stack of service cards on mobile.
**Issue:** Requires infinite scrolling; user loses context of "how many services are there?".
**Better Interaction:** **Horizontal Snap Carousel** with "peeking" next card.

*   **Behavior:** Users swipe left/right to browse services.
*   **Visual Cue:** Use a subtle "bounce" animation on page load to indicate horizontal scrollability.
*   **Tech:** CSS Scroll Snap (`snap-x snap-mandatory`) + `framer-motion` drag gestures.

### 2.2 Device Orientation Parallax (Hero)
**Current:** Mouse-move parallax (desktop only).
**Mobile Upgrade:** Use the **Gyroscope** (if permission granted) or fallback to a gentle "breathing" animation.
*   **Effect:** The background gradients and floating shapes shift slightly as the user tilts their phone.
*   **Why:** Creates a deep sense of immersion and "tech" mastery.

### 2.3 Tactile Feedback (Haptics)
*   **Action:** Trigger `navigator.vibrate(5)` (very short tick) when:
    *   Tapping a primary navigation button.
    *   Snapping to a new service card in the carousel.
    *   Expanding a job detail.
*   *Note:* Ensure a toggle exists or gracefully degrade if not supported.

---

## 3. "App-Like" Transitions

Avoid hard page reloads. Use **Shared Element Transitions** (via `framer-motion`'s `layoutId`) to make the UI feel fluid.

### 3.1 Card-to-Detail Expansion
**Scenario:** Tapping a "Service" card or "Job Opening".
**Interaction:** Instead of a new page loading from blank:
1.  The card **expands** to fill the screen (hero image grows).
2.  Content fades in below the expanded hero.
3.  "Back" button appears floating top-left.

**Implementation Guide:**
*   Wrap the card image in `<motion.div layoutId={\`card-image-\${id}\`} />`.
*   On the destination page, wrap the hero image in the same `layoutId`.

---

## 4. Performance & Data Savers

Mobile users are often on cellular data.

### 4.1 "Lite" Video Mode
**Observation:** The hero uses a heavy video background.
**Optimization:**
*   Detect connection type (`navigator.connection.saveData`).
*   If `saveData` is true OR device is low-power mode: Replace video with a high-res static WebP image.
*   **Benefit:** Faster LCP (Largest Contentful Paint) and battery savings.

### 4.2 Touch Target Hygiene
*   Ensure all tap targets are **minimum 44x44px**.
*   Add **visible active states** (background color change) instantly on touch start, not just touch end, to make the UI feel responsive (`:active` classes).

---

## 5. Implementation Roadmap for Claude

### Phase 1: The "Cloud Nav" (Bottom Navigation)
1.  Create `MobileNavigation.tsx`.
2.  Implement `useScrollDirection` hook to handle hide/show logic.
3.  Replace the standard mobile hamburger in `Header` with this new component (render only on `md:hidden`).

### Phase 2: Service Carousel
1.  Modify `services/page.tsx` grid.
2.  On mobile (`< md`), switch `flex-col` to `flex-row overflow-x-auto snap-x`.
3.  Add "snap-center" to each card.

### Phase 3: The "Magic" (Gestures)
1.  Add `Drag` support to the service cards.
2.  Implement `navigator.vibrate` on interaction (with feature detection).

---

## 6. Risks
*   **Screen Real Estate:** Bottom nav takes up vertical space. *Mitigation: Hide on scroll down.*
*   **Gesture Conflict:** Horizontal swipes might conflict with browser "Back" gestures (iOS). *Mitigation: Ensure scroll container has padding and doesn't claim full edge-to-edge width.*

