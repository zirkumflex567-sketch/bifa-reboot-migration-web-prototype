# REDLINE FC Project Settings Policy

## Goal
Keep Unity project settings reproducible across machines while avoiding noisy or machine-local churn.

## Commit these
- `UnityProject/Packages/manifest.json`
- `UnityProject/Packages/packages-lock.json`
- `UnityProject/ProjectSettings/**`
- `UnityProject/Assets/**` including `.meta` files

## Do not commit these
- `UnityProject/Library/**`
- `UnityProject/Temp/**`
- `UnityProject/Logs/**`
- `UnityProject/obj/**`
- User-specific editor caches and generated build output

## Package management rules
- Package additions/removals must be committed together with updated lockfile.
- Prefer pinned git commit hashes for git-based Unity packages.
- Validate package changes with a compile check before pushing.

## Scene and settings changes
- Keep scene order changes in Build Settings intentional and documented.
- If project-wide rendering/input settings are changed, add a short note in PR/commit summary.
- Avoid unrelated setting churn in the same commit as gameplay feature code.

## Current baseline (2026-04-16)
- Active render pipeline: URP (`GraphicsSettings.asset` + `QualitySettings.asset`).
- Input backend: Input System only (`activeInputHandler: 1`).
- URP assets tracked under `Assets/_Project/Settings` and `Assets/UniversalRenderPipelineGlobalSettings.asset`.
