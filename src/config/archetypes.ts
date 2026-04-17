/**
 * REDLINE FC — Character Archetypes, Trick Types & Chaos Modifiers
 * 12 unique character slots for MVP roster.
 */

export interface Archetype {
  name: string;
  role: string;
  spd: number; acc: number; pas: number; sht: number;
  ctrl: number; bal: number; tpow: number; disc: number;
  rec: number; styl: number; color: number;
  h: number; bulk: number; hat: string;
  special: string; spDesc: string;
}

export const ARCHETYPES: Archetype[] = [
  { name: 'Blitz', role: 'Street Striker', spd: 8, acc: 9, pas: 6, sht: 8, ctrl: 7, bal: 5, tpow: 4, disc: 5, rec: 6, styl: 8, color: 0x22ccff, h: 1.75, bulk: 0.35,
    hat: 'mohawk', special: 'flashStep', spDesc: 'Flash Step — short teleport dash' },
  { name: 'Tank', role: 'Bruiser Defender', spd: 5, acc: 4, pas: 5, sht: 4, ctrl: 4, bal: 9, tpow: 9, disc: 4, rec: 7, styl: 3, color: 0x225588, h: 1.9, bulk: 0.5,
    hat: 'flat', special: 'ironWall', spDesc: 'Iron Wall — unshakeable for 3s' },
  { name: 'Pixel', role: 'Nimble Playmaker', spd: 7, acc: 8, pas: 9, sht: 5, ctrl: 9, bal: 4, tpow: 3, disc: 7, rec: 5, styl: 9, color: 0x44ddaa, h: 1.65, bulk: 0.3,
    hat: 'cap', special: 'laserPass', spDesc: 'Laser Pass — perfect long pass' },
  { name: 'Bolt', role: 'Flash Winger', spd: 9, acc: 9, pas: 7, sht: 6, ctrl: 6, bal: 4, tpow: 3, disc: 6, rec: 5, styl: 7, color: 0xffaa22, h: 1.78, bulk: 0.32,
    hat: 'visor', special: 'afterburner', spDesc: 'Afterburner — 2x sprint 4s' },
  { name: 'Sarge', role: 'Veteran Enforcer', spd: 5, acc: 5, pas: 6, sht: 5, ctrl: 5, bal: 8, tpow: 8, disc: 3, rec: 8, styl: 4, color: 0x556633, h: 1.85, bulk: 0.48,
    hat: 'helmet', special: 'warCry', spDesc: 'War Cry — stun nearby enemies' },
  { name: 'Dynamo', role: 'Midfield Engine', spd: 7, acc: 7, pas: 7, sht: 7, ctrl: 7, bal: 6, tpow: 6, disc: 7, rec: 6, styl: 6, color: 0x7766dd, h: 1.8, bulk: 0.38,
    hat: 'band', special: 'perpetual', spDesc: 'Perpetual — no sprint penalty 5s' },
  { name: 'Phantom', role: 'Masked Trickster', spd: 7, acc: 7, pas: 8, sht: 6, ctrl: 9, bal: 3, tpow: 3, disc: 6, rec: 4, styl: 10, color: 0x9933cc, h: 1.72, bulk: 0.33,
    hat: 'mask', special: 'ghostPhase', spDesc: 'Ghost Phase — invisible 3s' },
  { name: 'Hammer', role: 'Power Finisher', spd: 6, acc: 5, pas: 5, sht: 10, ctrl: 5, bal: 7, tpow: 7, disc: 5, rec: 6, styl: 5, color: 0xcc3333, h: 1.88, bulk: 0.46,
    hat: 'spike', special: 'meteorShot', spDesc: 'Meteor Shot — unstoppable shot' },
  { name: 'Flex', role: 'Acrobat', spd: 8, acc: 8, pas: 6, sht: 7, ctrl: 8, bal: 5, tpow: 4, disc: 6, rec: 5, styl: 8, color: 0x33cccc, h: 1.7, bulk: 0.31,
    hat: 'headband', special: 'contortion', spDesc: 'Contortion — auto-dodge next tackle' },
  { name: 'Spike', role: 'Punk Speedster', spd: 10, acc: 9, pas: 5, sht: 6, ctrl: 6, bal: 3, tpow: 4, disc: 4, rec: 4, styl: 7, color: 0xff33aa, h: 1.73, bulk: 0.3,
    hat: 'punk', special: 'nitroDash', spDesc: 'Nitro Dash — explosive dash' },
  { name: 'Noble', role: 'Elegant Captain', spd: 6, acc: 6, pas: 8, sht: 7, ctrl: 8, bal: 7, tpow: 5, disc: 9, rec: 7, styl: 7, color: 0xddbb44, h: 1.82, bulk: 0.4,
    hat: 'crown', special: 'captainCall', spDesc: "Captain's Call — full team meter" },
  { name: 'Wreck', role: 'Wildcard Brawler', spd: 6, acc: 6, pas: 4, sht: 6, ctrl: 4, bal: 8, tpow: 10, disc: 2, rec: 8, styl: 5, color: 0x885522, h: 1.92, bulk: 0.52,
    hat: 'horns', special: 'rampage', spDesc: 'Rampage — 3 rapid tackles' },
];

export interface Trick {
  name: string;
  key: number;
  spd: number;
  successBase: number;
  meterBonus: number;
}

export const TRICKS: Trick[] = [
  { name: 'Spin Move', key: 0, spd: 7, successBase: 0.65, meterBonus: 3 },
  { name: 'Side Cut', key: 1, spd: 8, successBase: 0.70, meterBonus: 3 },
  { name: 'Burst Touch', key: 2, spd: 10, successBase: 0.55, meterBonus: 4 },
  { name: 'Fake Shot', key: 3, spd: 5, successBase: 0.75, meterBonus: 4 },
  { name: 'Fake Pass', key: 4, spd: 5, successBase: 0.80, meterBonus: 2 },
];

export interface GameState {
  chaosDoubleScore: boolean;
  chaosBallSpeed: number;
  chaosFriction: number;
  chaosMeterMult: number;
  chaosBallScale: number;
  chaosPlayerScale: number;
  chaosSpeedMult: number;
  chaosGlassCannon: boolean;
  goalCelebTimer: number;
  prevPossTeam: string | null;
}

export interface ChaosMod {
  name: string;
  desc: string;
  duration: number;
  apply: (g: GameState) => void;
  remove: (g: GameState) => void;
}

export const CHAOS_MODS: ChaosMod[] = [
  { name: 'DOUBLE SCORE', desc: 'Goals count ×2!', duration: 30, apply: (g) => { g.chaosDoubleScore = true; }, remove: (g) => { g.chaosDoubleScore = false; } },
  { name: 'TURBO BALL', desc: 'Ball speed ×2!', duration: 25, apply: (g) => { g.chaosBallSpeed = 2; }, remove: (g) => { g.chaosBallSpeed = 1; } },
  { name: 'SLIPPERY PITCH', desc: 'Low friction!', duration: 30, apply: (g) => { g.chaosFriction = 0.8; }, remove: (g) => { g.chaosFriction = 1; } },
  { name: 'POWER SURGE', desc: 'Meter fills 3× faster!', duration: 25, apply: (g) => { g.chaosMeterMult = 3; }, remove: (g) => { g.chaosMeterMult = 1; } },
  { name: 'GIANT BALL', desc: 'Ball is huge!', duration: 20, apply: (g) => { g.chaosBallScale = 2.5; }, remove: (g) => { g.chaosBallScale = 1; } },
  { name: 'MINI PLAYERS', desc: 'Everyone shrinks!', duration: 20, apply: (g) => { g.chaosPlayerScale = 0.6; }, remove: (g) => { g.chaosPlayerScale = 1; } },
  { name: 'SPEED DEMONS', desc: 'Everyone is fast!', duration: 25, apply: (g) => { g.chaosSpeedMult = 1.6; }, remove: (g) => { g.chaosSpeedMult = 1; } },
  { name: 'GLASS CANNON', desc: 'One-hit knockdowns!', duration: 20, apply: (g) => { g.chaosGlassCannon = true; }, remove: (g) => { g.chaosGlassCannon = false; } },
];
