# REDLINE FC - Repo Setup Status (Current)

Last updated: 2026-04-16

## Current state
The repository is now past scaffold-only setup and includes a running Unity implementation baseline.

Implemented and committed in project structure:
- Bootstrap flow (`Bootstrap` -> `MatchPrototype`)
- Match runtime bootstrap installer
- Input command routing stack
- Local multiplayer join baseline (2-4 players, hot-join service present)
- HUD baseline (score, timer, callout, onboarding hint)
- Input Actions asset (`Global`, `Match`, `SetPiece`)
- Core foundation docs (architecture, checklist, conventions, settings policy)

## Packages (installed in `Packages/manifest.json`)
- `com.unity.render-pipelines.universal`
- `com.unity.inputsystem`
- `com.unity.cinemachine`
- `com.unity.addressables`
- `com.unity.ugui`
- `com.coplaydev.coplay`
- `com.coplaydev.unity-mcp`

Note: `com.unity.textmeshpro` is not listed as a standalone package anymore; TMP functionality is provided through UGUI in this Unity version.

## Rendering and project settings
- URP is active in:
  - `ProjectSettings/GraphicsSettings.asset`
  - `ProjectSettings/QualitySettings.asset`
- URP assets present:
  - `Assets/_Project/Settings/UniversalRenderPipelineAsset.asset`
  - `Assets/_Project/Settings/UniversalRendererData.asset`
  - `Assets/UniversalRenderPipelineGlobalSettings.asset`
- Input backend is Input System only:
  - `ProjectSettings/ProjectSettings.asset` -> `activeInputHandler: 1`

## Validation status
- Compile gate: passing (`No compile errors` via Coplay MCP checks)
- Runtime smoke: passing (Play from Bootstrap reaches `MatchPrototype`; key runtime objects spawn)
- Local validation script: available at `Tools/local-validate.ps1` (batch compile + EditMode + PlayMode)

## Known non-blocking warnings
- Coplay toolbar extension warning about unsupported custom main toolbar insertion.
  - Origin: plugin/editor extension layer, not gameplay runtime code.

## Next recommended focus
1. Execute full automated test pass (`Tools/local-validate.ps1`) and store artifacts.
2. Start Step 3 implementation track (movement/passing feel lock).
3. Continue expanding PlayMode coverage for restart/join/camera smoke checks.
