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
const FOUL_BEHIND_THRESHOLD = -0.2
const FOUL_LATE_CONTACT_DISTANCE = 1.4

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

      const fromBehind = dot < FOUL_BEHIND_THRESHOLD
      const lateContact = !victim.hasBall && dist < FOUL_LATE_CONTACT_DISTANCE
      const recklessImpact = attacker.isDashing || attacker.sprinting
      const isFoul = fromBehind || lateContact || (recklessImpact && dot < 0.2)
      const dispossessed = victim.hasBall
      const highImpactTackle = recklessImpact || dot < 0 || dist < 1.2
      const knockdown = isFoul || (dispossessed && highImpactTackle)

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
