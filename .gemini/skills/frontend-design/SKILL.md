---
name: frontend-design
description: |
  Comprehensive guide and design system reference for modern UI/UX frontend engineering.
  Use when building, refactoring, or polishing web interfaces, Tailwind CSS designs, responsive layouts, 
  Light/Dark mode theme engines, mobile drawers, fixed/collapsible sidebars, top header bars, and structured data tables.
---

# Frontend Design & UI/UX System Guide

A comprehensive skill for building modern, accessible, high-contrast, responsive web interfaces with React, Next.js, and Tailwind CSS.

---

## 1. Layout & Architecture Standards

### A. Fixed & Collapsible Sidebar Navigation
- **Fixed Desktop Sidebar**: Pinned to the left viewport edge (`fixed left-0 top-0 bottom-0 h-screen z-40`).
- **Collapsible State**:
  - **Expanded (`w-64`)**: Displays logo, app title, section headers, icon + label navigation links, user profile card, and collapse toggle.
  - **Collapsed (`w-20`)**: Displays compact icon-only navigation buttons with tooltips.
  - **Toggle Control**: Controlled via top/bottom `PanelLeftClose` / `PanelLeftOpen` icon buttons.
- **Content Offsets**: The main layout wrapper adjusts padding dynamically based on sidebar state (`md:pl-64` or `md:pl-20`).

### B. Persistent Top Header Bar
- **Sticky Header**: Pinned across the top of the main viewport (`sticky top-0 z-30 h-16 backdrop-blur-md`).
- **Header Components**:
  - Left: Desktop sidebar toggle button, mobile drawer toggle, page title & breadcrumbs.
  - Center/Right: **Quick Links toolbar** (pills for core routes e.g., `/flag-single`, `/flag-bulk`, `/settings`), external links (e.g. Google Maps).
  - Far Right: **Theme Switcher** (Sun/Moon button) and user avatar.

### C. Mobile Responsive Navigation
- **Header Bar**: Displays mobile menu button (`Menu` icon) on screens smaller than `md`.
- **Slide-Over Drawer**: Slide-out panel (`fixed inset-0 z-50`) with backdrop blur (`bg-black/70 backdrop-blur-sm`).
- **Auto-Close**: Navigation clicks or backdrop taps automatically dismiss the drawer.

---

## 2. Light Mode & Dark Mode Theme Engine

### A. Tailwind Configuration Requirement
In `tailwind.config.ts`, explicitly declare class-based dark mode:
```typescript
const config: Config = {
  darkMode: 'class',
  // ...
};
```

### B. Global CSS Variables & Body Transitions
In `globals.css`:
```css
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
}

.dark {
  --background: #09090b;
  --foreground: #f4f4f5;
}

body {
  color: var(--foreground);
  background: var(--background);
  transition: background-color 0.2s ease, color 0.2s ease;
}
```

### C. Theme Provider Implementation
- Context manages `theme` (`'dark'` | `'light'`) and persists in `localStorage.setItem('app-theme', theme)`.
- Updates DOM classes on both `document.documentElement` and `document.body`.

---

## 3. Structured HTML Data Tables

Do not use centered generic `div` blocks for tabular data. Always use structured, responsive HTML `<table>` elements:

```tsx
<div className="overflow-x-auto">
  <table className="w-full text-left text-xs border-collapse min-w-[750px]">
    <thead>
      <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 font-bold uppercase tracking-wider bg-slate-50/50 dark:bg-zinc-950/40">
        <th className="py-3 px-4">Column Header</th>
        <th className="py-3 px-4 text-right">Actions</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-slate-800 dark:text-zinc-300">
      <tr className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
        <td className="py-3.5 px-4 font-semibold">Row Data</td>
        <td className="py-3.5 px-4 text-right">
          <button className="...">Action</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 4. Color Palette & Contrast Hierarchy

| Theme Role | Dark Mode Class | Light Mode Class | Purpose |
| :--- | :--- | :--- | :--- |
| **Page Background** | `dark:bg-zinc-950` | `bg-slate-50` | Deep obsidian dark vs clean slate light |
| **Card / Panel** | `dark:bg-zinc-900/80` | `bg-white` | Raised surface containers |
| **Borders** | `dark:border-zinc-800` | `border-slate-200` | Subtle, clean separation |
| **Primary Accent** | `from-rose-600 to-rose-500` | `from-rose-600 to-rose-500` | Primary CTA buttons & active links |
| **Success Badge** | `dark:text-emerald-400` | `text-emerald-600` | Confirmations, removals, status ok |
| **Pending Badge** | `dark:text-purple-400` | `text-purple-600` | In-progress / review pending |
| **Rating / Warning**| `text-amber-500` | `text-amber-500` | Star ratings, warnings, highlights |

---

## 5. Component Interaction & Polish

1. **Micro-interactions**: Use `transition-all duration-200` on interactive elements.
2. **Glassmorphism**: Use `backdrop-blur-md` on sticky headers and modals.
3. **Copy & Feedback**: Provide instant visual confirmation (e.g. checkmark icon toggle) when user copies text or performs an action.
4. **Accessibility (a11y)**:
   - Ensure all buttons have descriptive `aria-label` or visible text.
   - Maintain a minimum contrast ratio of 4.5:1 for standard text.
