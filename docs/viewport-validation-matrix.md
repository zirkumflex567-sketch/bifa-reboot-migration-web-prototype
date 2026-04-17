# REDLINE FC Web — Viewport Validation Matrix

Date: 2026-04-17
Scope: setup overlay, HUD readability, stamina bars, pause overlay, controls hints.

## Desktop matrix

| Viewport | Browser target | Result | Notes |
|---|---|---|---|
| 1920x1080 | Chromium/Chrome | Pending manual run | Baseline target for final release gate |
| 1366x768 | Chromium/Chrome | Pending manual run | Common laptop resolution |
| 1280x720 | Chromium/Chrome | Pending manual run | Minimum desktop target |

## Tablet/mobile matrix

| Viewport | Device class | Result | Notes |
|---|---|---|---|
| 1024x768 | Tablet landscape | Pending manual run | Verify HUD overlap and controls bar wrapping |
| 768x1024 | Tablet portrait | Pending manual run | Verify overlay/menu fit |
| 390x844 | Mobile portrait | Pending manual run | Check pause menu and stamina bar clipping |
| 844x390 | Mobile landscape | Pending manual run | Check controls hint overflow |

## Current automated evidence
- Responsive CSS breakpoint exists at `@media (max-width: 600px)` in `src/style.css`.
- Preview smoke endpoint responds with HTTP 200.

## Blocker to closing this checklist item
Manual browser runs across the matrix are still required to move checklist items to `[x]`.
