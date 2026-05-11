# SabiNote v1.0 — Frontend UX & Design Blueprint

> **Stack:** Next.js 14 (App Router), Tailwind CSS, Framer Motion, Radix UI primitives  
> **Design Philosophy:** *Empowering, high-integrity, educator-first.* Every animation has a purpose. Every screen reduces cognitive load. The product should feel like a confident, intelligent assistant — not a toy.

---

## Table of Contents

1. [Design System](#1-design-system)
2. [Animation Principles](#2-animation-principles)
3. [Screen 01 — Landing Page](#3-screen-01--landing-page)
4. [Screen 02 — Authentication](#4-screen-02--authentication)
5. [Screen 03 — Onboarding Gate](#5-screen-03--onboarding-gate)
6. [Screen 04 — Product Tour](#6-screen-04--product-tour)
7. [Screen 05 — Dashboard / Home](#7-screen-05--dashboard--home)
8. [Screen 06 — Wallet](#8-screen-06--wallet)
9. [Screen 07 — Generation Phase 1 (Config)](#9-screen-07--generation-phase-1-config)
10. [Screen 08 — Canvas Phase 1 (Lesson Plan)](#10-screen-08--canvas-phase-1-lesson-plan)
11. [Screen 09 — Canvas Phase 2 (Full Note)](#11-screen-09--canvas-phase-2-full-note)
12. [Screen 10 — Export Module](#12-screen-10--export-module)
13. [Screen 11 — Notes Library](#13-screen-11--notes-library)
14. [Screen 12 — Settings](#14-screen-12--settings)
15. [Global Components](#15-global-components)
16. [Responsive Breakpoints](#16-responsive-breakpoints)
17. [Accessibility Standards](#17-accessibility-standards)

---

## 1. Design System

### 1.1 Color Palette

```css
:root {
  /* ── Brand Core ─────────────────────────────── */
  --color-brand-900: #3B0764;    /* ultra-deep purple — hover depths */
  --color-brand-800: #4C0F99;    /* pressed states */
  --color-brand-700: #5B21B6;    /* active state */
  --color-brand-600: #641BC4;    /* PRIMARY — dominant brand color */
  --color-brand-500: #7C3AED;    /* CTA buttons, links */
  --color-brand-400: #A78BFA;    /* light interactive elements */
  --color-brand-100: #EDE9FE;    /* badge backgrounds, tag fills */
  --color-brand-50:  #F5F3FF;    /* page section tints */

  /* ── Accent (Warm) — for energy, highlights ── */
  --color-accent-600: #EA580C;   /* deep orange */
  --color-accent-500: #F97316;   /* PRIMARY ACCENT — animated text */
  --color-accent-400: #FB923C;   /* hover */
  --color-accent-300: #FCD34D;   /* amber glow */
  --color-accent-gradient: linear-gradient(90deg, #F97316, #FBBF24);

  /* ── ParaLearn Teal — logo & trust signals ─── */
  --color-teal-600: #0D9488;
  --color-teal-500: #14B8A6;
  --color-teal-100: #CCFBF1;

  /* ── Neutrals ───────────────────────────────── */
  --color-text-primary:   #0F0A1E;  /* near-black with purple tint */
  --color-text-secondary: #6B7280;
  --color-text-tertiary:  #9CA3AF;
  --color-text-on-dark:   #F9FAFB;

  --color-bg-white:    #FFFFFF;
  --color-bg-surface:  #FAFAFA;
  --color-bg-muted:    #F3F4F6;
  --color-bg-dark:     #0A0512;  /* for dark sections */
  --color-bg-dark-card:#140D2B;

  --color-border:        #E5E7EB;
  --color-border-strong: #D1D5DB;
  --color-border-brand:  #C4B5FD;

  /* ── Semantic ───────────────────────────────── */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error:   #EF4444;
  --color-info:    #3B82F6;

  /* ── Wallet Green ───────────────────────────── */
  --color-wallet: #059669;
  --color-wallet-bg: #ECFDF5;
}
```

---

### 1.2 Typography

```css
/* Import in layout.tsx */
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=Inter:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

:root {
  /* Display / Headlines — Bricolage Grotesque */
  --font-display: 'Bricolage Grotesque', sans-serif;

  /* Body / UI — Inter */
  --font-body: 'Inter', sans-serif;

  /* Code / Monospace */
  --font-mono: 'JetBrains Mono', monospace;

  /* ── Type Scale ──────────────────────────────── */
  --text-xs:   0.75rem;    /* 12px */
  --text-sm:   0.875rem;   /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg:   1.125rem;   /* 18px */
  --text-xl:   1.25rem;    /* 20px */
  --text-2xl:  1.5rem;     /* 24px */
  --text-3xl:  1.875rem;   /* 30px */
  --text-4xl:  2.25rem;    /* 36px */
  --text-5xl:  3rem;       /* 48px */
  --text-6xl:  3.75rem;    /* 60px */
  --text-7xl:  4.5rem;     /* 72px — hero headlines */
  --text-8xl:  6rem;       /* 96px — max impact hero */
}
```

**Typography Rules:**
- Hero headlines: `Bricolage Grotesque 700–800`, tightly tracked (`letter-spacing: -0.03em`)
- Section headings: `Bricolage Grotesque 600`, `-0.02em`
- Body copy: `Inter 400–450`, `1.6` line-height
- Labels / UI text: `Inter 500–600`
- Code / file names: `JetBrains Mono 400`

---

### 1.3 Spacing & Layout

```css
:root {
  --radius-sm:   4px;
  --radius-md:   8px;
  --radius-lg:   12px;
  --radius-xl:   16px;
  --radius-2xl:  24px;
  --radius-full: 9999px;  /* pills */

  --container-max: 1200px;
  --container-pad: clamp(1rem, 5vw, 2rem);

  --section-gap-sm: 4rem;
  --section-gap-md: 7rem;
  --section-gap-lg: 10rem;
}
```

---

### 1.4 Shadows & Elevation

```css
:root {
  --shadow-sm:     0 1px 2px rgba(15, 10, 30, 0.05);
  --shadow-md:     0 4px 16px rgba(15, 10, 30, 0.08);
  --shadow-lg:     0 8px 32px rgba(15, 10, 30, 0.12);
  --shadow-xl:     0 16px 64px rgba(15, 10, 30, 0.16);
  --shadow-brand:  0 8px 32px rgba(100, 27, 196, 0.25);
  --shadow-accent: 0 8px 32px rgba(249, 115, 22, 0.20);
  --shadow-glow:   0 0 60px rgba(100, 27, 196, 0.15);
}
```

---

### 1.5 Component Token Summary

| Component | Token |
|-----------|-------|
| Primary CTA | `bg-brand-500`, `hover:bg-brand-600`, `shadow-brand` |
| Ghost CTA | `border-brand-500 text-brand-600`, `hover:bg-brand-50` |
| Destructive | `bg-error`, `hover:bg-red-700` |
| Input | `border-border`, `focus:border-brand-500`, `focus:ring-2 ring-brand-100` |
| Card | `bg-white border border-border shadow-md rounded-xl` |
| Dark Card | `bg-bg-dark-card border border-white/8` |
| Badge / Pill | `bg-brand-100 text-brand-700 rounded-full px-3 py-1 text-sm font-medium` |
| Tag | `bg-bg-muted text-text-secondary rounded-md px-2 py-0.5 text-xs` |
| Skeleton | `bg-gradient-to-r from-border via-bg-muted to-border animate-shimmer` |

---

## 2. Animation Principles

### 2.1 Core Philosophy
- **Purposeful, not decorative.** Every animation communicates state, hierarchy, or reward.
- **Fast in, slow out.** Entrances are snappy (150–300ms), exits are gentle (200–400ms).
- **Stagger groups.** Lists and card grids animate in sequence, never simultaneously.
- **No layout shift.** All animations use `transform` and `opacity` — never `height`, `width`, or `margin`.

### 2.2 Easing Functions

```css
:root {
  --ease-spring:  cubic-bezier(0.34, 1.56, 0.64, 1);   /* bouncy — for success states */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);      /* fast open, slow settle */
  --ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);        /* smooth transitions */
  --ease-gentle:  cubic-bezier(0.25, 0.46, 0.45, 0.94);/* subtle fades */
}
```

### 2.3 Standard Durations

| Event | Duration | Easing |
|-------|----------|--------|
| Micro-interaction (button press) | 100ms | ease-in-out |
| Hover state | 150ms | ease-in-out |
| Page element entrance | 400ms | ease-out-expo |
| Modal / sheet open | 300ms | ease-out-expo |
| Modal / sheet close | 200ms | ease-in-out |
| Skeleton → content swap | 250ms | ease-gentle |
| Success flash | 600ms | ease-spring |
| Page transition | 350ms | ease-out-expo |
| Hero text reveal | 700ms staggered | ease-out-expo |
| Scroll-triggered section | 500ms | ease-out-expo |

### 2.4 Framer Motion Variants (Reusable)

```typescript
// variants.ts — import across all screens

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.34, 1.56, 0.64, 1] } }
}

export const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 32 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

// Skeleton shimmer keyframe
// @keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
```

---

## 3. Screen 01 — Landing Page

### Route: `/`
### Goal: Communicate the product's value in under 8 seconds. Inspire trust. Drive sign-up.

---

### 3.1 Navigation Bar

**Layout:** Fixed top, full-width, `backdrop-blur-md`, transitions from transparent to `bg-white/90 border-b border-border` after 60px scroll.

**Left:** ParaLearn logo (SVG) + "SabiNote" wordmark in `font-display font-bold`  
**Right:** "Log in" (ghost text link) + "Sign Up" (primary pill button)  
**Mobile:** Hamburger → full-screen slide-down menu overlay

**Animation:**
- On page load: nav slides down from `-100%` to `0` over `400ms ease-out-expo` with `80ms` delay.
- On scroll past threshold: background fades in over `200ms`.
- CTA button: subtle `scale(1.03)` pulse every 6 seconds to draw attention.

---

### 3.2 Hero Section

**Layout:** Full viewport height (`100svh`), centered content, left-aligned text on desktop.

**Background:**
- Base: `#FFFFFF`
- Decorative mesh gradient blob (purple + teal): `position: absolute`, `filter: blur(80px)`, `opacity: 0.12`, animates slowly with `@keyframes float` (8s, infinite).
- Subtle dot grid pattern: `background-image: radial-gradient(circle, #641BC4 1px, transparent 1px)`, `opacity: 0.05`, `background-size: 28px 28px`.

**Content (left column, ~55% width):**

```
[Badge — pill]
✦ Built for the Sovereign Scholar

[Headline — H1, Bricolage Grotesque 800, 64–72px]
NERDC-Compliant Lesson Notes
[accent gradient text, animated]
Generated in Seconds.

[Sub-headline — Inter 400, 18px, text-secondary]
Eliminate hours of manual planning. Create highly structured,
curriculum-aligned lesson notes tailored for Nigerian schools
— instantly, with SabiNote AI.

[CTA Row]
[Primary Button: "Start Generating for Free"]  [Ghost Button: "Watch Demo"]

[Social Proof Bar]
— Avatar stack (5 overlapping teacher avatars) —
"Join 4,000+ Educators transforming their lesson prep"
[★★★★★ 4.9/5 — 200+ reviews]
```

**Right column (~45% width):** Animated product mockup card — a styled "lesson note preview" card that types itself character by character (like a typewriter) showing a real lesson plan structure, rotating between 3 subjects.

**Hero Animations (choreographed sequence):**
1. `0ms` — badge fades up
2. `80ms` — H1 line 1 fades up
3. `160ms` — H1 line 2 (accent text) fades up + gradient sweeps left-to-right `800ms`
4. `280ms` — sub-headline fades up
5. `380ms` — CTA row fades up + primary button gets `shadow-brand` glow
6. `480ms` — social proof bar fades up
7. `500ms` — right column product mockup slides in from right
8. `600ms` — typewriter animation begins on mockup
9. Background blobs: continuous slow float, independent of choreography

**Accent Text Animation:**
```css
@keyframes gradientSweep {
  0%   { background-position: 200% center }
  100% { background-position: -200% center }
}
.accent-text {
  background: linear-gradient(90deg, #F97316, #FBBF24, #F97316);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientSweep 4s linear infinite;
}
```

---

### 3.3 Trusted By / Social Proof Strip

**Layout:** Full-width, `bg-bg-muted`, horizontal scrolling marquee of school names/logos.

**Content:** School names in `Inter 500 text-text-secondary` + ParaLearn badge.  
**Animation:** CSS `@keyframes marquee` — smooth infinite scroll left, pauses on hover, duplicated for seamless loop.

---

### 3.4 "How It Works" Section

**Layout:** `bg-white`, centered, 3-step horizontal flow on desktop, vertical stack on mobile.

**Section Header:**
```
[Small tag] — How SabiNote Works
[H2] From curriculum to classroom-ready in 3 steps.
```

**Steps (numbered cards with icons):**

| Step | Icon | Title | Body |
|------|------|-------|------|
| 01 | 📋 | Configure Your Lesson | Select your state, subject, class level, term and week. SabiNote fetches the exact curriculum automatically. |
| 02 | ⚡ | AI Generates Your Plan | Our RAG pipeline consults the official NERDC scheme of work for your state and generates a structured Lesson Plan in seconds. |
| 03 | ✏️ + 📄 | Review, Edit & Export | Refine the AI draft on your canvas, generate the full Lesson Note, then export as PDF or DOCX instantly. |

**Between steps:** Animated dashed arrow line (`stroke-dashoffset` animation on scroll enter).

**Step card animation:** Scroll-triggered `fadeUp` staggered at `0.15s` intervals.

**Each card:** `bg-white border border-border shadow-md rounded-2xl p-8`  
Number badge: `bg-brand-100 text-brand-600 font-mono text-sm font-bold`, top-left of card.

---

### 3.5 Feature Showcase Section

**Layout:** `bg-bg-dark` (dark section), alternating left-right feature blocks, 2 features.

**Section Header (white text on dark):**
```
[Tag — teal] ✦ What Makes SabiNote Different
[H2] Intelligence grounded in your state's curriculum.
```

**Feature Block 1: State-Based RAG Pipeline**
- Left: Text + bullet points
- Right: Animated diagram showing `[User State] → [Curriculum DB] → [AI Engine] → [Lesson Note]` with flowing particle line animation
- Copy: "SabiNote doesn't guess. It fetches the exact week's scheme of work from your state's curriculum database — Lagos, Ogun, Kano, or wherever you teach — and grounds every AI output in verified, NERDC-approved content."

**Feature Block 2: Human-in-the-Loop Canvas**
- Left: Animated canvas mockup with editing cursor
- Right: Text + bullets
- Copy: "You stay in control. Review and edit the AI-generated Lesson Plan before committing to the full Note. Our rich-text canvas auto-saves every keystroke, so nothing is ever lost."

**Dark section styling:**
- `bg-bg-dark` (`#0A0512`)
- Card surfaces: `bg-bg-dark-card` with `border border-white/8`
- Text: white primary, `text-white/60` secondary
- Teal accents for trust signals

---

### 3.6 Pricing / Parats Section

**Layout:** `bg-bg-surface`, centered.

**Section Header:**
```
[Tag] 💰 Simple, Transparent Pricing
[H2] Pay only for what you generate.
[Sub] No subscriptions. No hidden fees. Just $Parats.
```

**Package Cards (3 cards, horizontal):**

| Package | Parats | Price | Best For | Highlight |
|---------|--------|-------|----------|-----------|
| Starter | 50 ₽ | ₦250 | Try it out | — |
| Teacher | 100 ₽ | ₦500 | Weekly use | ⭐ Most Popular |
| School | 500 ₽ | ₦2,000 | Departments | Best Value |

**Card design:** White card, `shadow-lg`, `rounded-2xl`. "Most Popular" card has `border-2 border-brand-500 shadow-brand` and a `bg-brand-500` badge top-right.

**$Parats explainer box:**  
`bg-brand-50 border border-brand-100 rounded-xl p-5`  
"1 Lesson Plan = 8 ₽ &nbsp;|&nbsp; 1 Lesson Note = 12 ₽ &nbsp;|&nbsp; Full Package = 20 ₽"

**Animation:** Cards animate in with `staggerContainer` + `scaleIn` on scroll enter.

---

### 3.7 Testimonials Section

**Layout:** `bg-white`, 3-column masonry-style card grid.

**Section Header:**
```
[Tag] ❤️ Loved by Nigerian Educators
[H2] Real teachers. Real time saved.
```

**Testimonial card structure:**
```
[★★★★★]
"[Quote text — italic, Inter 400]"

[Avatar] [Name — bold] · [School, State]
```

**Card styling:** `bg-white border border-border shadow-md rounded-2xl p-6`
**Animation:** Scroll-triggered `staggerContainer` → `fadeUp`, 0.1s stagger.

**3 representative testimonials (write with authentic Nigerian educator voice):**
1. Mrs. Adaeze Nwosu, Chemistry Teacher, Lagos State
2. Mr. Babatunde Olawale, Mathematics, Oyo State  
3. Mrs. Fatima Al-Hassan, English Language, Kano State

---

### 3.8 Final CTA Section

**Layout:** `bg-bg-dark`, centered, full-width, generous padding.

**Background:** Large radial gradient glow (`--color-brand-600` at center, fading to dark), decorative circle rings pulsing outward in CSS animation.

**Content:**
```
[H2, white, 56px] Ready to reclaim your  
teaching time?

[Sub, white/70] Join thousands of Nigerian educators generating
curriculum-compliant lesson notes in seconds.

[Large Primary CTA] "Start Generating for Free — It's Free to Begin"
[Ghost CTA below] "See how it works first →"
```

**Animation:**
- Pulsing rings: `@keyframes ping` — 2 rings at 2s and 3s delays, `opacity: 0.1 → 0`, infinite.
- CTA button: shimmer sweep on hover.

---

### 3.9 Footer

**Layout:** `bg-bg-dark`, 4-column grid.

**Columns:**
1. Logo + tagline + "Made with ❤️ for Nigerian educators"
2. Product: Features, Pricing, Demo, Changelog
3. Company: About ParaLearn, Blog, Careers, Contact
4. Legal: Privacy Policy, Terms of Service, Refund Policy

**Bottom bar:** Copyright + social icons (Twitter/X, LinkedIn, Instagram)  
**Styling:** All text `text-white/50`, hover `text-white/80`, links `transition-colors 150ms`

---

## 4. Screen 02 — Authentication

### Routes: `/auth/login`, `/auth/register`

### Layout: Split-screen (desktop) / Single column (mobile)

**Left panel (55%):** Dark `bg-bg-dark`, displays:
- SabiNote logo (white)
- Rotating testimonial quote (auto-cycles every 5s with crossfade)
- 3 feature pills at bottom: "✦ State Curriculum DB", "✦ RAG-Powered", "✦ NERDC-Compliant"
- Decorative background: animated mesh gradient blob

**Right panel (45%):** `bg-white`, scrollable form area, centered vertically.

---

### 4.1 Register Screen

**Header:**
```
[H2] Create your SabiNote account.
[Sub] Already have an account? [Log in →]
```

**Form Fields:**
1. First Name + Last Name (side by side)
2. Email Address
3. Password (with show/hide toggle + strength indicator bar)
4. Confirm Password
5. State (dropdown — Nigerian states list, required)

**Below fields:**
- Divider: `───── or ─────`
- Google OAuth button: `border border-border rounded-full`, Google icon + "Continue with Google"
- Terms agreement: `text-sm text-text-secondary` — "By signing up you agree to our Terms and Privacy Policy"

**CTA:** Full-width `"Create Account"` primary button

**Field animation:**
- Each field slides up with `50ms` stagger on mount.
- Focus state: `border-brand-500` + subtle `ring-2 ring-brand-100`.
- Password strength bar: animated width transition, color changes green/orange/red.
- Error states: field border turns `border-error`, error message fades up below field.

---

### 4.2 Login Screen

**Header:**
```
[H2] Welcome back.
[Sub] Don't have an account? [Sign up →]
```

**Form Fields:**
1. Email Address
2. Password (show/hide) + "Forgot password?" link (right-aligned, inline)

**CTA:** `"Log In"` primary button  
**Google OAuth** button below divider

**Loading state:** Button text swaps to spinner + `"Logging in..."`, button disables.

---

### 4.3 Forgot Password Screen

Simple single-column centered card:
```
← Back to Login
[H2] Reset your password.
[Sub] Enter your email and we'll send a reset link.
[Email input]
[CTA: "Send Reset Link"]
```

**Success state:** Card morphs to confirmation state:
```
[Large checkmark icon — animated stroke draw]
[H3] Check your email.
[Sub] We sent a reset link to amaka@school.edu.ng
[Ghost CTA: "Resend email"] + [Link: "Back to Login"]
```

---

## 5. Screen 03 — Onboarding Gate

### Route: `/onboarding`
### Trigger: New user (no profile state OR incomplete profile)
### Behavior: User CANNOT access the app until this flow is complete.

---

### 5.1 Layout

Full-screen takeover. `bg-bg-surface`.  
Top progress bar (thin `4px` line): `bg-brand-500`, animated width from `0% → 100%` across steps.  
Step count top-right: `"Step 2 of 4"` in `text-sm text-text-secondary`.

---

### 5.2 Step 1 — Welcome

**Animation:** Hero entrance — entire screen fades in, then content animates up.

```
[Large animated emoji or icon: 🎓]
[H1] Welcome to SabiNote, [FirstName].

[Body]
Before you start generating lesson notes, we need a few details
to personalise your experience and connect you with the right
curriculum for your state.

This takes under 60 seconds.

[Primary CTA] "Let's Get Started →"
```

**Background:** Celebration confetti burst on mount (`canvas`-based, 1.5s, fades out) — brand purple and orange confetti particles.

---

### 5.3 Step 2 — Complete Your Profile

```
[H2] Tell us about yourself.
[Sub] This helps us serve the right curriculum for your school.

[Form]
First Name         [text input]
Last Name          [text input]
Phone Number       [text input — optional]
School Name        [text input — optional]
State              [dropdown — REQUIRED]
                   "⚠ Your state determines your curriculum. Choose carefully."
                   [Info tooltip: "You can update this later in Settings"]

[CTA] "Save & Continue →"
```

**State dropdown:** When a state is selected, a subtle confirmation pill appears below: `"✓ Lagos State Curriculum selected"` with teal checkmark, `fadeIn 200ms`.

---

### 5.4 Step 3 — Set Your Defaults

```
[H2] Quick preferences.
[Sub] Saves you time every time you generate.

[Form — optional but encouraged]
Default Subject     [dropdown]
Default Class Level [dropdown]
Note Difficulty     [segmented control: Basic / Standard / Advanced]
                   "Standard is recommended for most teachers."

[CTA] "Save Preferences →"
[Ghost link below] "Skip for now"
```

**Segmented control design:** Pill-style selector, active option has `bg-brand-500 text-white` fill, slide transition between options using `layoutId` in Framer Motion.

---

### 5.5 Step 4 — Wallet Introduction

```
[Icon: wallet illustration]
[H2] Your SabiNote Wallet.
[Sub] $Parats power your generations. New accounts start with 0 ₽.

[Wallet card — large, styled]
┌─────────────────────────────────┐
│  💜 Your Balance                │
│  ₽ 0.00                         │
│  [Top Up Now →]                  │
└─────────────────────────────────┘

[Body text]
Each Lesson Plan costs 8 ₽. A complete Lesson Note (Plan + Note)
costs 20 ₽. Top up now or explore the app first.

[Primary CTA] "Top Up Wallet →"
[Ghost link] "Explore first, I'll top up later"
```

**If user clicks "Explore first":** Wallet balance = 0. They can still access the dashboard and see the generation flow, but the "Generate" button will show a "Top Up Required" state with a prompt.

---

## 6. Screen 04 — Product Tour

### Trigger: First time entering dashboard (after onboarding) OR clicking "Try Demo First" on landing page.
### Route: `/tour` (or modal overlay on `/dashboard`)

---

### 6.1 Tour Design

Full-screen overlay, `bg-bg-dark/95 backdrop-blur-sm`.  
Tour steps are spotlight-style: a bright cutout reveals the relevant UI element, rest is dimmed.

**Step progression:** Floating card attached to highlighted element. Navigation: `← Prev` / `Next →` / `✕ Skip Tour`.

**Steps:**

| Step | Highlight | Copy |
|------|-----------|------|
| 1 | Wallet balance card | "Your $Parats balance lives here. Top up anytime to keep generating." |
| 2 | Quick Generate button | "Click here to start a new lesson note. It all begins here." |
| 3 | Subject + Class config | "Select your subject and class level. SabiNote fetches your curriculum automatically." |
| 4 | Canvas area | "This is your workspace. AI writes, you refine. Everything is auto-saved." |
| 5 | Export button | "When you're done, export as PDF or Word in one click." |

**Final step — completion screen:**
```
[Checkmark animation — stroke draw]
[H2] You're all set!
[Sub] Time to generate your first lesson note.
[CTA] "Generate My First Note →"
```

---

## 7. Screen 05 — Dashboard / Home

### Route: `/dashboard`

---

### 7.1 Layout

**Sidebar (desktop, 240px fixed):**
- Logo at top
- Navigation items (icon + label):
  - 🏠 Dashboard (active)
  - ⚡ Generate Note
  - 📚 My Notes
  - 💼 Wallet
  - ⚙️ Settings
- Bottom: User avatar + name + "Log out" link

**Main content area:** Responsive, scrollable.

**Mobile:** Bottom tab bar (5 tabs: Dashboard, Generate, Notes, Wallet, Settings).

---

### 7.2 Dashboard Content

**Top greeting row:**
```
[H2] Good morning, Amaka. 🌅
[Sub, text-secondary] Ready to generate today's lesson notes?
```
Greeting updates based on time of day: morning/afternoon/evening.

**Stats Row (4 cards):**

| Card | Icon | Metric | Sub |
|------|------|--------|-----|
| Wallet Balance | 💰 | ₽ 80.00 | "Top up →" |
| Notes Generated | 📝 | 24 | "This month" |
| Subjects Covered | 📚 | 5 | "Across 3 class levels" |
| Time Saved | ⏱️ | ~12 hrs | "Estimated" |

**Card styling:** `bg-white border border-border shadow-sm rounded-xl p-5`  
Wallet card: `bg-brand-600 text-white` (distinct dark card).

**Animation:** Stats count up from 0 on mount using `react-countup` or custom hook, `1200ms` duration.

---

### 7.3 Quick Generate CTA Band

```
┌──────────────────────────────────────────────────────┐
│  ⚡ Start a New Lesson Note                           │
│  Select your subject and class to begin.              │
│                                    [Generate Now →]   │
└──────────────────────────────────────────────────────┘
```
Styling: `bg-brand-50 border border-brand-100 rounded-2xl p-6`, icon animated with `rotate-12` pulse every 4s.

---

### 7.4 Recent Notes Grid

**Header:** "Recent Notes" + "View All →" link

**Grid:** 3-column on desktop, 2 on tablet, 1 on mobile.

**Note card:**
```
┌──────────────────────────────┐
│ [Subject tag] [Class tag]    │
│                              │
│ [Title — topic, bold]        │
│ Term 1 · Week 3              │
│                              │
│ [Status pill: Complete/Draft]│
│ [Date] · Apr 24, 2026        │
│                              │
│ [Open] [Export ↓]            │
└──────────────────────────────┘
```

**Status pill colors:**
- `Complete`: `bg-success/10 text-success`
- `Draft (Plan Only)`: `bg-warning/10 text-warning`

**Card hover:** `translateY(-4px) shadow-xl` over `200ms ease-out`.

**Empty state (no notes yet):**
```
[Illustration: notebook + sparkle]
[H3] No notes yet.
[Sub] Generate your first curriculum-aligned lesson note.
[CTA] "Generate Now →"
```

---

## 8. Screen 06 — Wallet

### Route: `/wallet`

---

### 8.1 Layout

**Top section — Balance Card:**
```
┌──────────────────────────────────────────────────────┐
│  Your SabiNote Wallet                                │
│                                                      │
│  ₽ 80.00                 [Top Up →]                  │
│  Available Balance                                   │
│                                                      │
│  ≈ 4 complete lesson packages remaining              │
└──────────────────────────────────────────────────────┘
```

**Styling:** `bg-gradient-to-br from-brand-600 to-brand-900`, white text, large balance in `Bricolage Grotesque 700 4xl`.

**Balance animation:** On screen mount, balance counts up. On successful top-up, balance flashes green with scale bounce.

---

### 8.2 Package Selection

**Header:** "Purchase $Parats"

**Package cards (3, horizontal row):**
Each card shows: Parats amount (large, brand color), Price in NGN, "Enough for X notes", Select button.

**Selected state:** Card border turns `border-brand-500 shadow-brand`, checkmark appears top-right with `scaleIn spring` animation.

**"Purchase" CTA:** Full-width primary button, disabled until a package is selected. Shows Paystack logo badge below: `🔒 Secured by Paystack`.

---

### 8.3 Paystack Modal

Custom styled modal wrapping the Paystack iframe:
```
[Modal header] "Complete Your Purchase"
[Sub] "₽100 for ₦500 — Secured by Paystack"
[Paystack iframe / redirect]
```

**Success state (post-webhook):** Modal closes, wallet card flashes green, balance updates with count-up animation, success toast appears.

---

### 8.4 Transaction History

**Table / List:**  
Each row: `[Type icon] [Description] [Date] [Amount (+/- ₽)] [Status]`

| Icon | Type | Color |
|------|------|-------|
| ↑ | Credit (top-up) | `text-success` `+₽100` |
| ↓ | Debit (generation) | `text-error` `-₽8` |

Paginated, 10 rows per page. Empty state if no transactions.

---

## 9. Screen 07 — Generation Phase 1 (Config)

### Route: `/generate`

---

### 9.1 Layout

Centered card on `bg-bg-surface` background, max-width `600px`.

**Header:**
```
← Back
[H2] Configure Your Lesson Note
[Sub] Fill in the details below. SabiNote fetches your curriculum automatically.
```

**Wallet reminder bar (top of card):**
`bg-brand-50 rounded-lg px-4 py-2 text-sm` — "Your balance: ₽80.00 · This generation costs ₽8 ₽ (Plan) + ₽12 (Note) = ₽20 total"

---

### 9.2 Form Fields (in order)

**1. Subject** — Dropdown, populated from `/curriculum/subjects` based on user's state.  
**2. Class Level** — Dropdown, e.g. JSS1 through SSS3. Filtered by subject selection.  
**3. Term** — Segmented control: Term 1 / Term 2 / Term 3  
**4. Week** — Dropdown populated from `/curriculum/weeks`. Each option shows the topic: `"Week 3 — Whole Numbers: Multiplication"`. This eliminates freetext entirely.  
**5. Duration** — Number input with stepper (30 / 40 / 45 / 60 / 80 mins), pill-button row.  
**6. Difficulty** — Segmented control: Basic / Standard / Advanced (pre-filled from user settings).

**State confirmation banner** (shown if `alwaysConfirmState = true`):
```
[Info box]
🏛 Curriculum: Lagos State · [Change →]
"Your notes will be generated using the Lagos State NERDC scheme of work."
```

**Textbook match (auto-populated):**
```
[Success box]
📖 Reference textbook matched: New General Mathematics JSS1 (Public Library)
[Change] [Remove]
```

---

### 9.3 Generate CTA

```
[Full-width Primary Button]
⚡ Generate Lesson Plan  ·  8 ₽
```

**Insufficient balance state:**  
Button disabled, `bg-bg-muted text-text-tertiary cursor-not-allowed`.  
Below button: `"⚠ Insufficient balance. [Top Up Wallet →]"` in `text-error text-sm`.

**Form validation:**  
Before submit, all required fields shake with `translateX` animation if empty. Error messages appear below each invalid field.

---

### 9.4 Loading State — Skeleton Loader

On "Generate" click:
1. Form fades out `(opacity 0, 200ms)`
2. Skeleton loader cross-fades in `(opacity 1, 200ms)`
3. Pulsing status text cycles:
   - "Connecting to Lagos State curriculum database..."
   - "Fetching Week 3 scheme of work..."
   - "Structuring your Lesson Plan..."

**Skeleton layout** mimics the Canvas document structure:
- Title bar skeleton (wide, short)
- 3 section header skeletons
- Multiple line skeletons per section
- All with `animate-shimmer` (`background: linear-gradient(90deg, #E5E7EB 25%, #F9FAFB 50%, #E5E7EB 75%)`, `background-size: 200% 100%`, `animation: shimmer 1.5s infinite`)

---

## 10. Screen 08 — Canvas Phase 1 (Lesson Plan)

### Route: `/notes/[noteId]`

---

### 10.1 Layout

Full-height editor layout. No sidebar on this screen — maximum focus.

**Top bar (fixed):**
- Left: `← Dashboard` link + `"Workspace: Whole Numbers — Multiplication"` (topic name)
- Center: `"Saved just now"` autosave indicator (greyed out, updates on save)
- Right: Wallet balance badge + `"Generate Lesson Note · 12 ₽"` primary button

**Autosave indicator states:**
- Idle: `text-text-tertiary text-sm "Saved just now"`
- Saving: spinner + `"Saving..."`
- Saved: green dot + `"Saved just now"` fades in with `fadeIn 200ms`
- Error: red dot + `"Save failed — retry?"`

---

### 10.2 Canvas Area

Rich text editor (`Tiptap` or `Slate.js`).

**Editor styling:**
- Max-width `760px`, centered, generous padding
- `font-body 1rem line-height 1.75`
- Headings: `font-display` weights
- Floating toolbar on text selection: Bold, Italic, Underline, H2, H3, Bullet list — pill-shaped `bg-text-primary text-white shadow-xl`

**Generated content structure displayed in canvas:**
```
# Lesson Plan

## Basic Information
Subject: Mathematics       Class: JSS 1
Topic: Whole Numbers — Multiplication and Division
Duration: 40 minutes       Date: ___________

## Behavioural Objectives
By the end of the lesson, students should be able to:
1. Multiply 4-digit numbers by 2-digit numbers
2. Solve long division problems
3. Apply multiplication to real-world word problems

## Entry Behaviour / Prior Knowledge
Students are expected to have prior knowledge of...

## Instructional Materials / Teaching Aids
- Charts showing multiplication tables
- Counters and abacus
...
```

**Entrance animation:** Content types in progressively — each section header appears, then lines fill in quickly, giving a "generating" feel even though content is already loaded. Uses `staggerContainer` with very short delays.

---

### 10.3 Generate Lesson Note CTA

Floating at the bottom of the viewport, sticky:

```
┌──────────────────────────────────────────────────────────────────┐
│  ✅ Lesson Plan ready. Review your edits above, then generate.   │
│  [Generate Lesson Note  ·  12 ₽]  [Costs 12 ₽ from your wallet] │
└──────────────────────────────────────────────────────────────────┘
```

**Styling:** `bg-white border-t border-border shadow-[0_-8px_32px_rgba(0,0,0,0.08)]`, `py-4 px-8`.

**On click:** Sticky bar transitions to loading state with progress indicator. Skeleton loader appends below the lesson plan content in the canvas.

---

## 11. Screen 09 — Canvas Phase 2 (Full Note)

### Route: `/notes/[noteId]` (same route, updated state)

---

### 11.1 Changes from Phase 1

**Top bar:** "Generate Lesson Note" button is replaced by "Export Material ↓" dropdown button (now that generation is complete).

**Canvas:** Lesson Note content appends below the Lesson Plan with a visual divider:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
         LESSON NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Lesson Note content example structure:**
```
## Introduction
Good morning, class. Today we'll be...

## Development

### Sub-topic 1: Multiplication of 4-digit Numbers
When we multiply large numbers, we use a method called...

#### Worked Example 1
  4,326
×    47
──────
  30,282   (4326 × 7)
+ 173,040  (4326 × 40)
──────────
  203,322  ✓

### Sub-topic 2: Long Division
...

## Common Misconceptions
⚠ Students often confuse...

## Formative Assessment
1. Calculate 3,427 × 23
...

## Assignment
Complete exercises 3a–3e on page 47 of your textbook.
```

**Entrance animation of Lesson Note section:**
- Section divider draws in with `scaleX 0→1 600ms`
- "LESSON NOTE" header fades up
- Content streams in section by section with `40ms` stagger

**Success toast:** Top-right corner, `bg-success text-white`, `"✅ Lesson Note generated successfully. Review and export when ready."`, auto-dismisses after 5s.

---

## 12. Screen 10 — Export Module

### Trigger: Clicking "Export Material ↓" dropdown in canvas top bar.

---

### 12.1 Export Dropdown

Dropdown menu below button:
```
Export Material ↓
─────────────────
📄 Download as PDF
📝 Download as DOCX
─────────────────
🔗 Copy shareable link  [Coming soon — greyed]
```

---

### 12.2 Export Modal

Opens on PDF or DOCX selection. Small modal, centered.

```
[Modal title] Export Lesson Material

[File preview box — bg-bg-muted rounded-lg p-4]
📄 File will be saved as:
Multiplication_and_Division_20260424_0830.pdf

[Options row]
[✓ Include Lesson Plan]  [✓ Include Lesson Note]

[CTA Row]
[Cancel]  [Download PDF]
```

**On download click:**
1. Modal shows inline progress: `"Packaging your document..."` with spinner
2. File download triggers (browser native)
3. Modal closes, success toast appears: `"Downloaded successfully! Check your Downloads folder."`
4. Export count increments, `isExported = true`

---

## 13. Screen 11 — Notes Library

### Route: `/notes`

---

### 13.1 Layout

**Header:**
```
[H2] My Notes
[Sub text] [24] notes generated
[Right] [+ New Note] button
```

**Filter/Search bar:**
```
[🔍 Search notes...]  [Subject ▾]  [Class ▾]  [Status ▾]  [Sort ▾]
```

**View toggle:** Grid icon / List icon (top right of results)

---

### 13.2 Grid View

3 columns desktop, 2 tablet, 1 mobile.

Each note card (same as dashboard card, but with more detail):
```
┌──────────────────────────────────────┐
│ [Mathematics] [JSS1]                 │
│                                      │
│ Whole Numbers — Multiplication       │
│ and Division                         │
│                                      │
│ Term 1 · Week 3 · Lagos              │
│                                      │
│ ● Complete     Apr 24, 2026          │
│ 1 export                             │
│                                      │
│ [Open Canvas]         [Export ↓]     │
└──────────────────────────────────────┘
```

**Hover state:** Overlay with quick action buttons fades in over card.

---

### 13.3 List View

Table-style rows:
| # | Topic | Subject | Class | Term/Wk | Status | Date | Actions |
|---|-------|---------|-------|---------|--------|------|---------|

Compact, sortable headers (click to sort, arrow indicator).

---

### 13.4 Empty States

- **No notes at all:** Illustration + "Generate your first note →"
- **No search results:** "No notes found for '[query]'" + "Clear filters"
- **Filter with no match:** "No [Subject] notes for [ClassLevel]" + "Change filters"

---

## 14. Screen 12 — Settings

### Route: `/settings`

---

### 14.1 Tab Navigation

Horizontal tab bar:
- 👤 Profile
- 🎓 Preferences
- 🔔 Notifications
- 🔐 Security
- 💳 Billing

---

### 14.2 Profile Tab

```
[Avatar with upload button]
First Name    [text input]
Last Name     [text input]
Email         [text input — disabled for OAuth users, badge: "via Google"]
Phone         [text input]
School Name   [text input]
State         [dropdown — with ⚠ warning on change]

[Save Changes] button
```

**State change warning:** If user changes state, inline alert:
`"⚠ Changing your state will switch your curriculum to [New State]. Existing notes are unaffected."`

---

### 14.3 Preferences Tab

```
Default Subject     [dropdown]
Default Class Level [dropdown]
Note Difficulty     [segmented control]
Always Confirm State[toggle]
```

---

### 14.4 Notifications Tab

```
Email Notifications       [toggle]
Generation Complete        [toggle]
Wallet Top-Up Confirmed    [toggle]
Weekly Summary             [toggle — coming soon, greyed]
```

---

### 14.5 Security Tab

```
[If email/password user]
Current Password   [password input]
New Password       [password input]
Confirm Password   [password input]
[Update Password]

[Danger Zone — red-bordered section]
Delete Account     [Destructive button — opens confirmation modal]
```

---

### 14.6 Billing Tab

= Wallet screen embedded (balance + top-up + transactions), without the separate page chrome.

---

## 15. Global Components

### 15.1 Toast Notification System

Position: `top-right`, `16px` from edge.  
Stack: Multiple toasts stack vertically, `8px` gap.  
Auto-dismiss: 5 seconds (with hover-to-pause).  
Types:
- ✅ Success — `bg-success text-white`
- ❌ Error — `bg-error text-white`
- ⚠ Warning — `bg-warning text-white`
- ℹ Info — `bg-info text-white`

**Animation:** Slides in from right `translateX(120% → 0)` with `spring ease`, slides out same direction on dismiss. Progress bar at bottom shows time remaining.

---

### 15.2 Confirmation Modal

Used for: delete note, change state, account deletion.

```
[Overlay: bg-black/40 backdrop-blur-sm]
[Modal card: bg-white rounded-2xl shadow-xl max-w-sm p-8]

[Icon — colored by severity]
[H3] Are you sure?
[Body] This action cannot be undone. [specific consequence]

[Button row]
[Cancel — ghost]  [Confirm — destructive/primary]
```

**Animation:** Modal scales in `scale(0.92 → 1)` with `ease-spring 300ms`, overlay fades in separately.

---

### 15.3 Sidebar Navigation States

**Active item:** `bg-brand-50 text-brand-600 font-medium`, `4px` left border `bg-brand-500`.  
**Hover:** `bg-bg-muted text-text-primary`, `150ms` transition.  
**Icon:** 20px, `currentColor`.  
**Collapsed state (desktop):** Icon-only at `64px` width, tooltip on hover.

---

### 15.4 Empty States (Global Pattern)

```
[Illustration — contextual SVG, max 180px]
[H3] [Context-specific headline]
[Sub] [Context-specific body]
[CTA — optional]
```

All empty states use brand-color illustrations (not generic stock art).

---

### 15.5 Loading States (Global Pattern)

| Context | Loading Method |
|---------|---------------|
| Page load | Skeleton loaders matching content layout |
| Button action | Spinner replaces button text, button disables |
| Data fetch (table) | Skeleton rows (3–5 rows) |
| Image | Blur-up (low-res placeholder → full res) |
| AI generation | Full skeleton document + cycling status text |

---

## 16. Responsive Breakpoints

```css
/* Tailwind config */
screens: {
  'sm': '640px',   /* Mobile landscape */
  'md': '768px',   /* Tablet */
  'lg': '1024px',  /* Desktop */
  'xl': '1280px',  /* Wide desktop */
  '2xl': '1536px', /* Ultrawide */
}
```

**Mobile-first rules:**
- Sidebar collapses to bottom tab bar on `< lg`
- Canvas top bar collapses: topic name hidden, only icons shown
- Hero section: single column, H1 reduced to 40px
- Package cards: vertical stack
- Stats row: 2×2 grid

---

## 17. Accessibility Standards

- All interactive elements: `focus-visible:ring-2 ring-brand-500 ring-offset-2`
- Color contrast: all text passes WCAG AA minimum (4.5:1)
- Skeleton loaders: `aria-busy="true"` on loading containers
- Modals: focus trap, `Escape` to close, `role="dialog"` + `aria-labelledby`
- Forms: all inputs have associated `<label>`, error messages linked via `aria-describedby`
- Animations: respect `prefers-reduced-motion` — all Framer Motion animations wrapped in `useReducedMotion()` check and skip or simplify when true
- Images: meaningful `alt` text on all non-decorative images

```typescript
// Global reduced motion check
const prefersReduced = useReducedMotion()
const animationProps = prefersReduced ? {} : { initial: 'hidden', animate: 'visible', variants: fadeUp }
```

---

*Document Version: 1.0 | SabiNote Frontend Design Blueprint | Ready for component-by-component development*
