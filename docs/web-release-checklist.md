# Web Release Checklist

## Build and Quality Gates

- [ ] `npm install` runs without errors
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] `npm run preview` starts successfully

## Gameplay Smoke Tests

- [ ] Match starts from waiting screen with `Space`
- [ ] P1 movement, sprint, dash, pass, shoot, tackle work
- [ ] Goal increments score and match restarts from kickoff
- [ ] Half-time and full-time transitions trigger correctly
- [ ] Full-time restart resets score and clock

## Browser and UX Validation

- [ ] Desktop check in current Chrome, Edge, Firefox
- [ ] Mobile viewport check at 390x844 and 768x1024
- [ ] HUD remains readable and non-overlapping
- [ ] Input and camera feel stable at low/high FPS

## Performance Baseline

- [ ] Stable near 60 FPS on target machine
- [ ] No severe frame spikes during active play
- [ ] Bundle size tracked after each release build

## Documentation and Release Notes

- [ ] Changed mechanics documented in `README.md` or docs
- [ ] Known issues logged before release
- [ ] Release date and owner noted in project notes
