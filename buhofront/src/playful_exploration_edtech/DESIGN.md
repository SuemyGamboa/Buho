---
name: Playful Exploration EdTech
colors:
  surface: '#f4faff'
  surface-dim: '#cfdce4'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f6fd'
  surface-container: '#e3f0f8'
  surface-container-high: '#ddeaf2'
  surface-container-highest: '#d7e4ec'
  on-surface: '#111d23'
  on-surface-variant: '#414753'
  inverse-surface: '#263238'
  inverse-on-surface: '#e6f3fb'
  outline: '#727784'
  outline-variant: '#c1c6d5'
  surface-tint: '#005db8'
  primary: '#005db8'
  on-primary: '#ffffff'
  primary-container: '#4d96ff'
  on-primary-container: '#002e61'
  inverse-primary: '#a9c7ff'
  secondary: '#725c00'
  on-secondary: '#ffffff'
  secondary-container: '#fed33a'
  on-secondary-container: '#715b00'
  tertiary: '#b52330'
  on-tertiary: '#ffffff'
  tertiary-container: '#ff6064'
  on-tertiary-container: '#650010'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#a9c7ff'
  on-primary-fixed: '#001b3e'
  on-primary-fixed-variant: '#00468c'
  secondary-fixed: '#ffe082'
  secondary-fixed-dim: '#ecc228'
  on-secondary-fixed: '#231b00'
  on-secondary-fixed-variant: '#564500'
  tertiary-fixed: '#ffdad8'
  tertiary-fixed-dim: '#ffb3b0'
  on-tertiary-fixed: '#410007'
  on-tertiary-fixed-variant: '#92001b'
  background: '#f4faff'
  on-background: '#111d23'
  surface-variant: '#d7e4ec'
typography:
  display-hero:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 24px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  button-chunky:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '800'
    lineHeight: 22px
    letterSpacing: 0.02em
  badge-label:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '800'
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  space-xxs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 2.5rem
  space-3xl: 3.5rem
  content-margin-mobile: 1.25rem
  content-margin-tablet: 2rem
  interactive-min-tap: 3.5rem
---

## Brand & Style

The design system embodies an exploratory, joyful, and tactile learning universe tailored for young minds aged 5 to 10. The core personality is encouraging, curious, and vibrant, balancing the thrill of an arcade quest with the clarity and scaffolding required for young literacy and cognitive development.

The visual style blends **Modern Tactile Gaming** with **Elevated Contemporary Minimalism**. Interfaces feel physical, squishy, and interactive—buttons provide physical "click-down" depth through contrasting bottom lip bevels, cards float like physical rounded tiles, and progress indicators bubble with vivid energy. The mood avoids patronizing, noisy nursery tropes; instead, it establishes an organized, premium digital playground where high-contrast legibility meets delightful game mechanics.

## Colors

The palette uses sky blue as the primary anchor for structure, interactive flows, and focus states, paired with an energetic spectrum of gamified accents:

- **Primary Sky Blue (`#4D96FF`)**: Core navigation, subject tags, secondary actions, and tinted drop-shadow anchors. Conveys calm focus and modern tech friendliness.
- **Secondary Sunshine Yellow (`#FFD43B`)**: Reward chests, streak indicators, primary "claim" actions, and star ratings. Paired with a deeper amber bottom bevel (`#E0A800`) to create a 3D tactile push feel.
- **Tertiary Coral Red (`#FF5A5F`)**: Timed challenges, energy hearts, attention beacons, and urgent feedback, supported by an anchor shade (`#D9383D`).
- **Success Mint Green (`#4ECB71`)**: Correct answers, completed quests, and XP milestones, paired with a deeper pine anchor (`#2EA44F`).
- **Magic Purple (`#9B6DFF`)**: Rare artifacts, mystery levels, and unlocked avatar powers.
- **Canvas Cream (`#FFF9E8`)**: Warm, low-strain background tone providing soft contrast and preventing eye fatigue during extended tablet or phone sessions.
- **Surface White (`#FFFFFF`)**: Crisp floating containers that keep game layouts neat and organized.
- **Deep Navy Slate (`#263238`)**: AAA-level text legibility, replacing harsh pure black with a rich, friendly ink shade.

## Typography

The type system pairs **Plus Jakarta Sans** for headlines and interactive tokens with **Be Vietnam Pro** for instructional body copy. 

- **Plus Jakarta Sans** brings rounded geometry, welcoming counterforms, and ultra-punchy heavy weights (`700` and `800`) ideal for game buttons, badges, score counters, and speech bubbles.
- **Be Vietnam Pro** provides clear open apertures, unambiguous letterforms (essential for early readers distinguishing glyphs like `a`, `c`, and `o`), and clean rhythm at body scale.

Text scales preserve comfort on handheld mobile devices by avoiding overly dense paragraphs. Headings use snug letter spacing for punchy poster-like impacts, while instructional copy maintains generous line heights for frictionless read-aloud experiences.

## Layout & Spacing

The layout is built on an adaptive fluid grid anchored by child-friendly ergonomics:

- **Mobile First Touch Bounds**: All touch targets adhere to a generous minimum height of `3.5rem` (`56px`), accommodating developing motor skills and quick thumb/finger presses.
- **Margins & Gutters**: Handheld views rely on a fluid 4-column system with `1.25rem` screen margins. Tablet and landscape learning-pad views expand to 8 columns with centered container constraints (max `880px`) to prevent visual fragmentation during interactive minigames.
- **Vertical Spacing Rhythm**: Spacing tokens follow an 8pt base grid with specialized micro-steps (`space-xxs` at 4px) for button bevel offsets and tight label badges.
- **Reflow & Island Containers**: Gamified elements (quest maps, milestone trees) scroll continuously along vertical or isometric paths, encased within floating island cards bordered with comfortable breathing room.

## Elevation & Depth

Depth is established through a combination of **chromatic ambient shadows** and **tactile structural offsets** rather than blurry, dark drop shadows:

1. **Card Level (Floating Tile)**: Surfaces use a crisp white fill (`#FFFFFF`) with a soft, tinted ambient glow: `box-shadow: 0 8px 24px rgba(77, 150, 255, 0.12)`. This anchors elements securely above the warm `#FFF9E8` canvas.
2. **Interactive 3D Layer (Chunky Buttons)**: Interactive elements have a solid 4px to 6px solid bottom edge lip (bevel) in a darker shade of the button's hue. On tap or active state, the button transforms down (`translateY(4px)`), collapsing the bottom lip and delivering immediate mechanical feedback.
3. **Floating Overlay (Modals & Celebration Overlays)**: Promoted modal dialogs utilize a high-radiance double shadow: `0 12px 36px rgba(38, 50, 56, 0.14), 0 4px 12px rgba(77, 150, 255, 0.10)`. Backdrops feature a 40% translucent warm wash with a 6px frosted blur (`backdrop-filter: blur(6px)`).

## Shapes

The design system embraces high roundedness (level `3`, Pill & Ballooned forms). Sharp corners are strictly avoided across all child-facing contexts.

- **Standard Cards & Containers**: Use `rounded-lg` (2rem / 32px) to look soft, safe, and huggable.
- **Buttons, Counters, & Chips**: Use full pill radii (`rounded-full` / 9999px) to preserve balloon-like bounce and guide the eye smoothly across interactive zones.
- **Input Fields & Audio Prompts**: Bound by a minimum corner radius of `1.25rem` (20px), echoing the friendly geometric contours of the typography.

## Components

### Chunky Game Buttons
- **Style**: Pill-shaped (`rounded-full`), `min-height: 56px`, padded with `1.5rem` horizontal padding.
- **Structure**: Colored surface with a matching 4px solid inset/offset bottom border:
  - Primary Play / Action: `#FFD43B` face with `#E0A800` bevel.
  - Secondary Explorer: `#4D96FF` face with `#2F74DE` bevel.
  - Success Confirm: `#4ECB71` face with `#32A350` bevel.
- **Interaction**: `:active` state triggers a 4px downward displacement (`transform: translateY(4px)`) while removing the bottom bevel, mimicking a real arcade switch.

### Quest Cards & Lesson Tiles
- **Style**: White `#FFFFFF` surface, `border-radius: 28px`, tinted shadow `0 8px 24px rgba(77, 150, 255, 0.12)`.
- **Layout**: Large bold icon or star cluster on the left, high-contrast title (`#263238`), and a secondary pill badge displaying reward coin values.
- **Border Treatment**: 2px border in `#F0E7D0` to define boundaries against the warm cream canvas.

### Audio & Sound-Wave Prompts
- **Style**: Pill-shaped container filled with `#4D96FF` at 10% opacity, framed with a vibrant `#4D96FF` outline.
- **Contents**: A circular yellow megaphone button alongside animated audio waveform bars that scale dynamically during voiceover playback, enabling pre-literate children to easily re-listen.

### Progress & Streak Meters
- **Track**: `#EFE6CE` recessed pill channel (`height: 20px`, `border-radius: 9999px`).
- **Indicator**: Vibrant gradient (`#4ECB71` to `#75E292`) with a subtle gloss highlight line along the top half and an animated mascot star pin marking the current tip.

### Chips & Badges
- **Style**: Compact pill-shaped tags (`border-radius: 9999px`, height `32px`), featuring uppercase bold labels in Plus Jakarta Sans.
- **Variants**:
  - Streak Chip: Soft yellow tint background with a flaming coral icon and `#263238` numeric text.
  - Gem Chip: Magic purple tint background (`#F1EBFF`) with a faceted diamond icon and purple text (`#9B6DFF`).

### Checkboxes & Multiple Choice Pickers
- **Style**: Chunky tiles (`min-height: 64px`, `border-radius: 24px`) with centered large text and an illustrative pictogram.
- **States**: Unselected displays a white tile with a subtle 2px border in `#E8DFC7`. Selected transitions into a vivid `#4D96FF` or `#4ECB71` border (3px thick) with a soft pastel fill, accompanied by a checkmark badge popping into place.