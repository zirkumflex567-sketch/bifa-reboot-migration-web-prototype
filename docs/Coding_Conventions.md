# REDLINE FC Coding Conventions

## Scope
These rules apply to:
- Runtime gameplay code (`Assets/_Project/Scripts/Core/**`)
- Shared utilities (`Assets/_Project/Scripts/Shared/**`)
- Presentation/HUD code
- EditMode and PlayMode tests

## Architecture and dependency rules
- Keep domain logic free of Unity-specific scene/search code where possible.
- Flow dependencies one direction: `Domain -> Application -> Infrastructure -> Presentation`.
- Prefer constructor/configuration methods over hidden singleton coupling.
- Avoid cross-module direct field access; communicate via commands/events/services.

## Runtime code style
- One class per file and file name equals class name.
- Public API should be explicit and minimal.
- Keep `MonoBehaviour` scripts thin; push game rules to testable services.
- No per-frame allocations in hot paths (`Update`, physics loops, command routing).
- Cache references instead of repeated global searches in runtime loops.

## Input/gameplay rules
- Route gameplay intent through command objects and command router.
- Keep keyboard paths as non-shipping debug fallback only.
- New player actions should be added to Input Actions + command abstraction together.

## Naming
- Types: `PascalCase`
- Methods/properties: `PascalCase`
- Private fields: `camelCase`
- Serialized fields: private `camelCase` with `[SerializeField]`
- Constants: `PascalCase` for `const` fields

## Tests
- Every gameplay rule change should include or update at least one test.
- EditMode tests for deterministic game rules.
- PlayMode tests for scene flow, integration, and camera/input behavior.

## Definition of done (code level)
- Feature compiles with zero errors.
- Relevant tests pass locally.
- Checklist/doc impact updated when behavior changes.
