import { Player, PlayerState } from './Player'
import type { Ball } from './Ball'

/* ═══════════════════════════════════════════════════════════════════════
   Combat  —  tackle resolution and foul detection
   ═══════════════════════════════════════════════════════════════════════ */

export interface CombatResult {
  attacker: Player
  victim: Player
  dispossessed: boolean
  foul: boolean
  knockdown: boolean
}

const TACKLE_RANGE = 2.2
const FOUL_BEHIND_THRESHOLD = -0.3  // dot product for "from behind"

export function resolveCombat(
  players: Player[],
  ball: Ball
): CombatResult[] {
  const results: CombatResult[] = []

  for (const attacker of players) {
    if (attacker.state !== PlayerState.Tackle) continue

    for (const victim of players) {
      if (victim === attacker) continue
      if (victim.team === attacker.team) continue
      if (victim.state === PlayerState.KnockedDown || victim.state === PlayerState.Recovering) continue

      const dist = attacker.position.distanceTo(victim.position)
      if (dist > TACKLE_RANGE) continue

      // Determine angle
      const toVictim = victim.position.clone().sub(attacker.position).normalize()
      const victimFacing = victim.facingDir
      const dot = victimFacing.dot(toVictim)

      // From behind = foul
      const isFoul = dot < FOUL_BEHIND_THRESHOLD
      const dispossessed = victim.hasBall
      const knockdown = Math.random() < 0.35 || isFoul

      if (dispossessed) {
        ball.forceRelease()
        // Give small push to ball
        ball.velocity.copy(toVictim).multiplyScalar(5)
      }

      if (knockdown) {
        victim.applyKnockdown()
      } else {
        victim.applyStun()
      }

      // Attacker finishes tackle
      attacker.state = PlayerState.Locomotion

      results.push({ attacker, victim, dispossessed, foul: isFoul, knockdown })
    }
  }

  return results
}
