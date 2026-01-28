```md
# Weaverly Design System Style Guide

## Aesthetic Vibe
**Modern Dark-Mode SaaS (Bento-Grid Minimalist)**  
The design system for Weaverly leverages a "Premium Tech" aesthetic characterized by high-contrast accents against a deep, monochromatic canvas. It utilizes a structured "Bento Box" layout to organize information, combining crisp geometric shapes with soft glassmorphism and subtle gradients to create depth.

## Visual Tokens (Color Palette)

| Token | Role | Hex Code (Approx.) | Visual Description |
| :--- | :--- | :--- | :--- |
| **Primary Accent** | Action/Highlight | `#D1F531` | Vibrant Electric Lime / Neon Yellow-Green. |
| **Deep Background** | Core Canvas | `#0B0B0B` | Near-black neutral for high contrast. |
| **Surface Secondary**| Card/Section Base | `#161616` | Dark charcoal for elevation and layering. |
| **Border/Stroke** | Definition | `#262626` | Subtle gray for component boundaries. |
| **Text Primary** | Headers/Body | `#FFFFFF` | Pure white for maximum readability. |
| **Text Secondary** | Metadata/Details | `#8E8E8E` | Muted medium gray for hierarchy. |

## Typography

*   **Primary Font Family:** *Inter* or *Satoshi* (Geometric Sans-Serif).
*   **Typography Scale:**
    *   **Display/H1:** 64px - 80px (Bold/ExtraBold, tight letter-spacing).
    *   **Heading H2-H3:** 32px - 48px (Medium/Bold).
    *   **Body Copy:** 16px (Regular, 1.6 line-height).
    *   **Labels/Captions:** 12px - 14px (Uppercase/Monospaced for a "tech" feel).
*   **Hierarchy Note:** Uses high weight contrast (Bold vs. Regular) rather than color variation to establish importance.

## Component Specifications

### Buttons
*   **Primary Button:** Pill-shaped (fully rounded) or Large Radius (12px+). Background is the Primary Accent (`#D1F531`) with black text.
*   **Secondary Button:** Ghost/Outlined style with a 1px border (`#262626`) and white text.
*   **States:** Hover effects typically include a slight scale-up (1.02x) or a subtle glow/inner shadow to emphasize the neon accent.

### Navigation
*   **Layout:** Minimalist top-bar navigation.
*   **Styling:** Semi-transparent "Glassmorphism" background (Blurs the content behind it).
*   **Links:** Standard horizontal list with high-contrast active states using a small dot indicator or color shift.

### Cards (Bento Grid)
*   **Structure:** Varied aspect ratios (1x1, 2x1) following a strict grid system.
*   **Styling:** Rounded corners (16px to 24px).
*   **Border:** 1px solid stroke in `#262626` to separate dark surfaces from the dark background.
*   **Backdrop:** Subtle radial gradients or glass-like transparency to add dimension to the flat dark surface.

### Inputs & UI Controls
*   **Input Fields:** Dark fill (`#161616`) with subtle borders. Focus states utilize a 1px solid border of the Primary Accent color.
*   **Icons:** Thin-stroke (Linear) iconography, usually 24px, matching the stroke weight of the typography.
*   **Micro-interactions:** Smooth CSS transitions (200ms - 300ms) for all interactive surface state changes.