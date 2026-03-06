# Launchpad 4 Cockpit Interface

Responsive cockpit-style web app for `Launchpad4Success.pro`, built with HTML, CSS, and vanilla JavaScript.

## Implemented Core Features

- Dashboard cockpit with mapped interactive hotspots
- Dark/light theme support (dark default)
- Special `Launchpad 4 Vision` pivot panel
  - Working mode: 20% width
  - Command mode: 80% width + blurred/dimmed cockpit + Vision Dock
- Vision Dock sections (expanded mode only):
  - Insights
  - Saved Ideas
  - Alerts
  - Strategy
- Vision chat with:
  - Scrollable conversation
  - Typing indicator animation
  - Inline image responses
- Vision mission context ribbon above chat:
  - Launch -> Funnel -> Optimization
  - Active step glows using `--glow-color`
  - Step updates from conversation topic
- Voice system with 3 personalities:
  - Anchor (⚓)
  - Rocket (🚀)
  - Glitch (⚡)
- Intelligence configuration panel:
  - Voice selection
  - Message tone
  - Typing speed
  - Pulse style
  - Auto Voice Adaptation ON/OFF
- Voice preference persistence via `localStorage`
- Message-triggered Vision pulse behavior:
  - Pulse only on new AI messages
  - Reminder pulse after 90s if Vision remains closed

## Module Map

- Top Right: Launchpad 4 Vision
- Lower Right Large: Radar
- Lower Right Small: Settings
- Upper Left: Communications
- Mid Left: Fuel
- Lower Left: Navigation
- Middle Left: Propulsion
- Middle Right: Intelligence
- Middle Lower: Resources

## Module Click Behavior

- `Vision`: opens pivot panel (no page navigation)
- All non-Vision modules route via history navigation and update cockpit context panels
  - `/navigation`
  - `/propulsion`
  - `/intelligence`
  - `/communications`
  - `/fuel`
  - `/radar`
  - `/settings`
  - `/resources`

## Run

Open `index.html` directly or serve statically:

```bash
npx serve launchpad4-cockpit
```

## File Structure

- `index.html`
- `css/cockpit.css`
- `js/cockpit-core.js`
- `js/vision-chat.js`
- `js/voice-engine.js`
- `js/mission-timeline.js`
