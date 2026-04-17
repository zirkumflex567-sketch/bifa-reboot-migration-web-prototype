/**
 * REDLINE FC — Match State Machine
 * Phases, score tracking, and set-piece management.
 */

export const MP = {
  WAIT: 0, KICKOFF: 1, PLAY: 2, GOAL: 3,
  HT: 4, FT: 5, SETPIECE: 6, PAUSED: 7,
} as const;

export const BS = {
  FREE: 0, CARRY: 1, PASS: 2, SHOT: 3,
  GOAL: 4, THROUGH: 5, OOB: 6, DEFLECT: 7,
} as const;

export const S = {
  LOCO: 0, TACKLE: 1, SLIDE: 2, STUN: 3,
  KD: 4, REC: 5, TRICK: 6, SHOOT: 7,
  DIVE: 8, SETPIECE: 9,
} as const;

export interface MatchStats {
  possA: number;
  possB: number;
  shotsA: number;
  shotsB: number;
}

export interface MatchState {
  phase: number;
  sA: number;
  sB: number;
  half: number;
  clock: number;
  overtime: boolean;
  stats: MatchStats;
  setPieceType: string | null;
  setPieceTeam: string | null;
  setPiecePos: { x: number; y: number; z: number } | null;
  start: () => void;
  restart: () => void;
  tick: (dt: number) => string[];
  registerGoal: (side: number) => void;
  triggerSetPiece: (type: string, team: string, pos: { x: number; y: number; z: number }) => void;
}
