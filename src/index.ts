/**
 * REDLINE FC — Module Index
 * Central barrel export for all game modules.
 */

// Config
export { CFG } from './config/tuning';
export { ARCHETYPES, TRICKS, CHAOS_MODS } from './config/archetypes';
export type { Archetype, Trick, ChaosMod, GameState } from './config/archetypes';

// Audio
export { SFX, initAudio, setVolume } from './audio/SFX';

// Input
export { initInput, isDown, wasP, wasR, updateHoldTimes, getHoldTime, endFrame, readGamepad } from './input/Input';
export type { GamepadState } from './input/Input';

// Match
export { MP, BS, S } from './match/MatchState';
export type { MatchState, MatchStats } from './match/MatchState';
