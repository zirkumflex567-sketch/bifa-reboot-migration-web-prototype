/**
 * REDLINE FC — Game Tuning Constants
 * All gameplay-relevant numbers in one place for easy balancing.
 */
export const CFG = {
  // Pitch dimensions
  pl: 60, pw: 40, hl: 30, hw: 20,
  gw: 8, gd: 2.5, gh: 3,
  pal: 14, paw: 22, cr: 7, lw: 0.12,

  // Movement
  baseSpd: 6.5, sprintSpd: 9.8, carrierPen: 0.83,
  sprintTurnPen: 0.6, strafePen: 0.7,
  accelRate: 35, decelRate: 25,

  // Tackle
  tackleDash: 13, tackleDur: 0.32, stunDur: 0.55,
  kdDur: 0.9, recDur: 0.35, tackleCD: 0.75,
  slideDur: 0.5, slideDash: 16, slideCD: 1.2,
  shoulderRange: 1.8, shoulderKB: 6,

  // Ball
  ballR: 0.28, friction: 2.8,
  shortPassSpd: 13, drivenPassSpd: 18, throughPassSpd: 15,
  shootMinSpd: 14, shootMaxSpd: 28, ballY: 0.28,

  // Match
  halfTime: 180, goalPause: 2.8, htPause: 3,
  koPause: 1.5, otTime: 60,

  // AI
  aiShootRng: 18, aiPassChance: 0.4, aiTackleRng: 2.2,

  // Meter
  meterMax: 100, meterPassGain: 4, meterComboGain: 2,
  meterTackleGain: 6, meterTrickGain: 3, meterShotGain: 5,
  meterComebackBonus: 8,
  meterPowerTackle: 25, meterPrecisionPass: 20,
  meterPowerShot: 30, meterRecovery: 15, meterSpecial: 40,

  // Combo
  comboTimeout: 4,

  // Tricks
  trickDur: 0.4, trickCD: 0.8, trickSpamCD: 2,

  // GK
  gkDiveSpd: 12, gkDiveDur: 0.6, gkReach: 4.5, gkLineX: 2,

  // Interception
  interceptRange: 1.8, interceptChance: 0.45,

  // Set piece
  spAimSpd: 2.5,

  // Stamina
  staminaMax: 100, staminaDrain: 18, staminaRegen: 12,
  staminaSprintThreshold: 10, staminaExhaustedPen: 0.7,
  staminaTurboCost: 30, turboDashSpd: 18, turboDashDur: 0.25,
} as const;

export type CFGType = typeof CFG;
