/**
 * REDLINE FC — Input System
 * Keyboard + Gamepad with action buffering.
 */

const pressed = new Set<string>();
const justP = new Set<string>();
const justR = new Set<string>();
const holdTime: Record<string, number> = {};

export function initInput(): void {
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (!pressed.has(k)) { justP.add(k); holdTime[k] = 0; }
    pressed.add(k);
    if (k === 'escape') e.preventDefault();
  });
  window.addEventListener('keyup', (e) => {
    const k = e.key.toLowerCase();
    pressed.delete(k);
    justR.add(k);
  });
  window.addEventListener('blur', () => {
    pressed.clear(); justP.clear(); justR.clear();
  });
}

export const isDown = (...k: string[]): boolean => k.some(x => pressed.has(x.toLowerCase()));
export const wasP = (...k: string[]): boolean => k.some(x => justP.has(x.toLowerCase()));
export const wasR = (...k: string[]): boolean => k.some(x => justR.has(x.toLowerCase()));

export function updateHoldTimes(dt: number): void {
  for (const k of pressed) holdTime[k] = (holdTime[k] || 0) + dt;
}

export function getHoldTime(key: string): number {
  return holdTime[key.toLowerCase()] || 0;
}

export function endFrame(): void {
  justP.clear();
  justR.clear();
}

export interface GamepadState {
  moveX: number; moveZ: number;
  aimX: number; aimZ: number;
  pass: boolean; shoot: boolean;
  tackle: boolean; trick: boolean;
  sprint: boolean; meter: boolean;
  pause: boolean; special: boolean;
}

export function readGamepad(idx: number): GamepadState | null {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  const gp = gps[idx];
  if (!gp) return null;
  const deadzone = 0.15;
  const ax = (v: number) => Math.abs(v) < deadzone ? 0 : v;
  return {
    moveX: ax(gp.axes[0]),
    moveZ: ax(gp.axes[1]),
    aimX: ax(gp.axes[2] || 0),
    aimZ: ax(gp.axes[3] || 0),
    pass: gp.buttons[0]?.pressed ?? false,
    shoot: gp.buttons[2]?.pressed ?? false,
    tackle: gp.buttons[1]?.pressed ?? false,
    trick: gp.buttons[3]?.pressed ?? false,
    sprint: (gp.buttons[6]?.pressed || gp.buttons[4]?.pressed) ?? false,
    meter: (gp.buttons[7]?.pressed || gp.buttons[5]?.pressed) ?? false,
    pause: gp.buttons[9]?.pressed ?? false,
    special: gp.buttons[8]?.pressed ?? false,
  };
}
