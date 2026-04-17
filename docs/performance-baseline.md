# REDLINE FC Web — Performance Baseline (Local)

Date: 2026-04-17
Environment:
- OS: Linux (WSL2)
- Node: v24.14.0
- npm: 11.10.1

## Build baseline
- Command: `npm run build`
- End-to-end wall time: 3.322s
- Vite bundling phase (reported): 578ms

Build artifacts:
- `dist/index.html`: 5.54 kB (gzip 1.69 kB)
- `dist/assets/index-HVGNezqL.css`: 8.92 kB (gzip 2.45 kB)
- `dist/assets/index-BPh5N9iK.js`: 548.91 kB (gzip 140.60 kB)

Total dist footprint:
- `dist/`: 124 MB
- Note: Most size is static assets under `dist/assets/textures` and `dist/assets/characters`.

## Local preview HTTP baseline
- Command: `curl` against `http://127.0.0.1:4173`
- 5 sample requests:
  - req1: ttfb=11.6ms, total=11.6ms
  - req2: ttfb=2.9ms, total=3.0ms
  - req3: ttfb=3.3ms, total=3.3ms
  - req4: ttfb=3.2ms, total=3.2ms
  - req5: ttfb=3.3ms, total=3.3ms

## Next perf steps
1. Record FPS and frame-time spikes during match gameplay (desktop + low-end laptop).
2. Track texture memory and draw-call count during active play.
3. Introduce CI trend line for build duration + JS gzip size.
