---
name: Horizon Minimalist
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3e4949'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#6e797a'
  outline-variant: '#bdc9c9'
  surface-tint: '#00696d'
  primary: '#00696d'
  on-primary: '#ffffff'
  primary-container: '#008489'
  on-primary-container: '#ffffff'
  inverse-primary: '#74d6db'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfde'
  on-secondary-container: '#636262'
  tertiary: '#5c5c5c'
  on-tertiary: '#ffffff'
  tertiary-container: '#747474'
  on-tertiary-container: '#fefcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#91f2f7'
  primary-fixed-dim: '#74d6db'
  on-primary-fixed: '#002021'
  on-primary-fixed-variant: '#004f52'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c8c6c5'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#474746'
  tertiary-fixed: '#e3e2e2'
  tertiary-fixed-dim: '#c7c6c6'
  on-tertiary-fixed: '#1b1c1c'
  on-tertiary-fixed-variant: '#464747'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: '0'
  body-lg:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: '0'
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: '0'
  label-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter-desktop: 24px
  margin-desktop: 80px
  gutter-mobile: 16px
  margin-mobile: 24px
---

## Brand & Style
The design system is built on a foundation of **Minimalism** and **High-Clarity Modernism**. It prioritizes breathability and intellectual calm, moving away from high-density interfaces toward a "Silicon Valley" aesthetic that feels both premium and approachable.

The brand personality is professional yet warm, evoking a sense of hospitality and effortless utility. The emotional response should be one of "digital quiet"—where the interface recedes to let the content and primary actions take center stage. Visually, this is achieved through a white-dominant palette, expansive whitespace, and soft depth markers that mimic natural light.

## Colors
The palette is intentionally restrained to maintain an airy and focused environment.

*   **Primary (#008489):** A sophisticated teal used exclusively for primary calls-to-action, active states, and critical brand moments. It should never be used for large backgrounds.
*   **Surface & Backgrounds:** Use `#FFFFFF` for the main content areas to maximize brightness. Use `#F7F7F7` for secondary sections or background fills to create subtle structural separation.
*   **Typography & Icons:** Use `#222222` for primary headings and body text to ensure high legibility without the harshness of pure black. Use `#717171` for secondary labels and metadata.
*   **Dividers:** Use `#EBEBEB` for thin, 1px strokes when structural separation is required without using depth.

## Typography
This design system utilizes **Geist** across all levels to maintain a clean, technical, yet humanist feel. 

Hierarchy is established through weight and generous line-heights. Large headings use a slight negative letter-spacing to appear tighter and more "editorial," while smaller labels utilize increased letter-spacing to ensure readability at small scales. 

Avoid using "Regular" (400) weight for headings; stick to Medium (500) or Semibold (600) to provide a clear contrast against body copy. Paragraphs should always favor generous leading (line-height) to promote scanning.

## Layout & Spacing
The layout follows a **Fluid Grid** model with significant padding to create a sense of luxury and space. 

*   **Grid:** A 12-column system for desktop, shifting to a 1-column stack for mobile. 
*   **Rhythm:** Based on an 8px baseline. Use 16px (2 units) for tight groupings and 32px-48px (4-6 units) for sectional spacing. 
*   **Breathability:** Prioritize vertical whitespace. Content blocks should have ample room to "breathe," with margins typically larger than standard corporate applications to evoke the airy feeling of premium travel and lifestyle apps.

## Elevation & Depth
Hierarchy is conveyed through **Ambient Shadows** and **Tonal Layers** rather than borders. 

*   **Resting State:** Most cards and surfaces sit on the background with no border and a very soft, diffused shadow: `0 6px 16px rgba(0,0,0,0.08)`.
*   **Interactive State:** Upon hover or focus, elevation should increase slightly with a more pronounced but still soft shadow: `0 12px 24px rgba(0,0,0,0.12)`.
*   **Floating Elements:** Modals and navigation bars use a "high-profile" depth with a background blur (Backdrop Filter: Blur 10px) to maintain context while feeling physically lifted.

## Shapes
The shape language is defined by **Rounded** corners that feel organic and friendly. 

Standard components like buttons and input fields utilize a 0.5rem (8px) radius. Larger containers, such as cards and featured sections, should scale up to 1rem (16px) or 1.5rem (24px) to emphasize the "soft-touch" aesthetic. Circular shapes are reserved strictly for avatars and icon containers to provide a counterpoint to the rounded-rectangular grid.

## Components
*   **Buttons:** Primary buttons use the Teal accent with white text. They feature a subtle 1px inner glow/border to keep the color vibrant. Secondary buttons use a white fill with a thin gray border or a light gray fill (#F7F7F7).
*   **Cards:** Pure white backgrounds with the "Resting State" shadow. No external borders. Content inside cards should have a minimum of 24px internal padding.
*   **Inputs:** Large, clear input fields with 16px internal horizontal padding. Use `#F7F7F7` for the background and a 2px teal border only when the field is focused.
*   **Chips/Tags:** Used for filtering. Rounded-pill shape with a white background and 1px `#EBEBEB` border. When active, the background turns to the Secondary color (#222222) with white text.
*   **Lists:** High-density lists are avoided. Instead, use "Row Items" with clear dividers and 16px vertical padding between items.
*   **Navigation:** A "sticky" top navigation bar with a subtle bottom shadow or a simple divider line to remain unobtrusive.