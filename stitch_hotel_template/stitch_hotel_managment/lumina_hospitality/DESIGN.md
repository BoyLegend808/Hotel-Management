---
name: Lumina Hospitality
colors:
  surface: '#f7fafc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7fafc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f4f6'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e5'
  on-surface: '#181c1e'
  on-surface-variant: '#3f484d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eef1f4'
  outline: '#6f787e'
  outline-variant: '#bfc8cd'
  surface-tint: '#006684'
  primary: '#006683'
  on-primary: '#ffffff'
  primary-container: '#2a7f9e'
  on-primary-container: '#ffffff'
  inverse-primary: '#84d0f2'
  secondary: '#845400'
  on-secondary: '#ffffff'
  secondary-container: '#fdaa2d'
  on-secondary-container: '#6a4200'
  tertiary: '#86510f'
  on-tertiary: '#ffffff'
  tertiary-container: '#a36927'
  on-tertiary-container: '#ffffff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#bde9ff'
  primary-fixed-dim: '#84d0f2'
  on-primary-fixed: '#001f2a'
  on-primary-fixed-variant: '#004d64'
  secondary-fixed: '#ffddb7'
  secondary-fixed-dim: '#ffb95c'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86f'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#f7fafc'
  on-background: '#181c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Roboto Slab
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h1-mobile:
    fontFamily: Roboto Slab
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  h2:
    fontFamily: Roboto Slab
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.3'
  h3:
    fontFamily: Roboto Slab
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  container-margin: 2rem
  gutter: 1.5rem
---

## Brand & Style
The design system is engineered for the high-stakes, fast-paced environment of luxury hotel management. It balances operational efficiency with a sophisticated aesthetic that mirrors the premium service of the hospitality industry.

The visual direction utilizes **Glassmorphism** to create a sense of depth and hierarchy without cluttering the interface. This style uses translucent layers and background blurs to maintain context while focusing on active tasks. The emotional response is one of calm control, professionalism, and modern luxury. 

Key stylistic markers include:
- **Translucency:** Surfaces use semi-transparent fills with high-density backdrop blurs (20px-30px).
- **Precision:** Clean lines and purposeful spacing to handle complex data density.
- **Motion:** All interactive states utilize a `0.3s ease-out` transition to feel responsive yet fluid.

## Colors
The palette is rooted in professional reliability (Teal) and luxury service (Gold). 

- **Primary Teal (#2A7F9E):** Used for primary actions, navigation selection, and active states.
- **Accent Gold (#D98C00):** Reserved for "Premium" or "VIP" indicators, highlighting critical guest status, and subtle callouts.
- **Surface Strategy:** In light mode, surfaces use a soft off-white (#F5F5F5). In dark mode, the system shifts to a deep charcoal (#1E1E1E).
- **Accessibility:** All text-on-background combinations are audited to maintain a minimum 4.5:1 contrast ratio. Interactive elements utilize a high-visibility focus ring in Gold to ensure keyboard navigability.

## Typography
The system employs a dual-typeface strategy to distinguish between editorial flair and functional data.

- **Roboto Slab (Headings):** Provides an authoritative, established feel. Its slab serifs suggest stability and tradition, essential for hospitality heritage.
- **Inter (Body & UI):** A highly legible sans-serif designed for screens. It handles dense reservation tables and guest profiles with clarity.
- **Hierarchy:** Use H1 for page titles (e.g., "Guest Registry"), H2 for section headers, and H3 for card titles. Labels use uppercase Inter with slight tracking for clear categorization in forms.

## Layout & Spacing
The layout follows a **Fluid Grid** model with fixed maximum widths for readability on large management consoles.

- **Grid:** 12-column system for desktop, 6-column for tablet, and 2-column for mobile.
- **Rhythm:** An 8px base unit drives all spacing. Consistent padding (1.5rem) inside glass cards ensures content doesn't feel cramped against blurred edges.
- **Adaptation:** On mobile, the side navigation collapses into a bottom bar or a "hamburger" glass overlay. Margins reduce from 2rem to 1rem to maximize screen real estate for data tables.

## Elevation & Depth
Depth is communicated through "Optical Stacking" using glass layers rather than heavy shadows.

- **Level 0 (Base):** The solid background color (#F5F5F5 or #1E1E1E).
- **Level 1 (Cards/Panels):** `rgba(255, 255, 255, 0.7)` in light mode or `rgba(30, 30, 30, 0.6)` in dark mode. Includes a 1px solid border with low opacity and a 20px background blur.
- **Level 2 (Modals/Toasts):** Higher translucency with a subtle drop shadow: `0 8px 32px 0 rgba(0, 0, 0, 0.08)`.
- **Level 3 (Floating Actions):** Pronounced shadows with minimal blur to simulate physical proximity to the user.

## Shapes
The shape language is "Soft-Modern." 

A `0.5rem` (8px) base radius is applied to standard UI components like inputs and buttons. For larger containers, such as dashboard cards, use `1rem` (16px) to soften the interface and emphasize the glass effect. This roundedness avoids the harshness of sharp corners while maintaining the professional structure required for an enterprise application.

## Components

### Glass-morphism Cards
The signature component. Must include `backdrop-filter: blur(20px)` and a 1px border (`rgba(255,255,255, 0.3)`). Cards should have a subtle inner glow on the top-left edge to simulate light hitting glass.

### Floating Label Inputs
When the input is empty, the label sits inside the field. On focus or when text is present, the label scales down and moves to the top border. This saves vertical space and keeps the UI clean. Use a Teal bottom-border (2px) for the active state.

### Navigation Bar
A vertical sidebar for desktop (Glass-morphism style) or a floating bottom-dock for mobile. Icons should be "Line Art" style with a 2px stroke weight.

### Toast Notifications
Located in the top-right or bottom-center. Use a glass surface with a color-coded vertical bar on the left (Teal for info, Gold for warnings, Red for errors).

### Loading Spinners
A dual-ring spinner using Teal and Gold. The motion should be a continuous "sweep" to reflect the 0.3s ease-out transition logic found elsewhere in the system.

### Buttons
- **Primary:** Solid Teal with white text. On hover, darken by 10%.
- **Secondary:** Transparent with a 1px Teal border. 
- **VIP/Special:** Solid Gold with white text, used sparingly for priority tasks.