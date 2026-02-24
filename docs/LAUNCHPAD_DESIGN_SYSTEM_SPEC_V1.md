# Launchpad 4 Success Design System v1.0

## Core Direction
- Product tone: aerospace control system for operators.
- Emotional feel: calm authority, technical precision, professional flight deck.
- Visual language: cockpit backdrop, glass HUD overlays, restrained motion, personality accents.

## Theme Model
- Default theme: dark.
- Optional theme: light palette inversion only (no layout changes).
- Supported personality accents: `rocket`, `anchor`, `glitch`.

## Color Tokens
### Accent Tokens
- Rocket: `#2EE6C2`, `#1FC7A7`, `#159C86`
- Anchor: `#AEB7C2`, `#8E99A8`
- Glitch: `#E83EFF`, `#C92DE6` (sparingly)

### Dark Theme
- Background base: `#0A0F14`
- Glass base: `rgba(18, 28, 38, 0.72)`
- Panel border: `rgba(255, 255, 255, 0.08)`
- Text primary: `#EAF8FF`
- Text secondary: `#9FB4C8`
- Text muted: `#6C7A89`

### Light Theme
- Background base: `#F4F7FA`
- Glass base: `rgba(255, 255, 255, 0.75)`
- Panel border: `rgba(0, 0, 0, 0.08)`
- Text primary: `#1C2A36`
- Text secondary: `#3D4F5F`
- Text muted: `#708090`

## Background System
- Persistent cockpit art direction across product surfaces.
- Optional overlays:
  - dark: `rgba(0,0,0,0.4)` gradient
  - light: `rgba(255,255,255,0.3)` gradient
- Blueprint/radar grid overlays limited to technical views (builder, analytics).

## Glass HUD System
- Standard panel:
  - blur: `18px`
  - radius: `14px`
  - padding: `1.25rem`
- Dark panel:
  - `background: rgba(18, 28, 38, 0.72)`
  - `border: 1px solid rgba(255,255,255,0.08)`
  - `box-shadow: 0 0 0 1px rgba(255,255,255,0.02), 0 8px 32px rgba(0,0,0,0.35)`
- Light panel:
  - `background: rgba(255,255,255,0.75)`
  - `border: 1px solid rgba(0,0,0,0.08)`
  - `box-shadow: 0 0 0 1px rgba(0,0,0,0.02), 0 8px 24px rgba(0,0,0,0.12)`

## Typography
- Primary font: Inter.
- Optional display accent: Sora.
- Sizes:
  - H1: `42px`, `600`, tracking `-0.02em`
  - H2: `28px`, `600`
  - H3: `18px`, `500`
  - Body: `15px`, `400`, line-height `1.6`
  - System labels: `12px`, uppercase, tracking `0.12em`, reduced opacity

## Spacing
- 4px base scale: `4, 8, 12, 16, 24, 32, 48, 64`.
- Minimum viewport edge spacing: `24px`.

## Motion
- Default transitions: `180-250ms`, easing `cubic-bezier(0.4, 0, 0.2, 1)`.
- No bounce/elastic animation patterns.
- Motion reduction must be respected.

## Buttons
- Primary:
  - gradient `#1FC7A7 -> #2EE6C2`
  - radius `10px`
  - `0.75rem 1.75rem` padding
  - hover: subtle lift + controlled glow
- Secondary:
  - glass surface with border
- Danger/Admin:
  - restrained red semantics (no neon)

## Personality Behavior
- Rocket: teal accent, soft glow, smooth micro-motion.
- Anchor: slate accent, minimal motion, no glow bias.
- Glitch: magenta pulse used only on specific events, never persistent distortion.

## Accessibility
- Minimum contrast ratio: `4.5:1`.
- Focus states must be visible and consistent.
- Interactive targets: minimum `44px` height.
- Honor `prefers-reduced-motion`.

## Route Metaphors
- Home: Mission Control
- Dashboard: Flight Deck
- Builder: Engineering Bay
- Analytics: Telemetry
- AI/Brand Brain: Core Intelligence
- Payments: Fuel System
- Downloads: Cargo Bay
- Team: Crew Roster
- Admin: Command Authority

## Non-Negotiable Consistency Rules
- One cockpit background language.
- One glass system.
- One spacing system.
- Personality accents are contextual, not decorative noise.
- Avoid random neon, mixed corner radii, or inconsistent blur/shadow stacks.
