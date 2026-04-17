import * as THREE from 'three'
import { PITCH } from './World'
import { Player } from './Player'
import type { Ball } from './Ball'
import { BallState } from './Ball'

/* ═══════════════════════════════════════════════════════════════════════
   AI  —  simple state-based behaviour for non-human players
   ═══════════════════════════════════════════════════════════════════════ */

enum AIMode {
  ChaseBall,
  SupportAttack,
  Defend,
  ReturnToPosition
}

const AI_PASS_CHANCE    = 0.35   // probability per-second while carrying
const AI_SHOOT_RANGE    = Math.max(16, PITCH.length * 0.24)
const AI_TACKLE_RANGE   = 2.0
const AI_SUPPORT_DIST   = Math.max(10, PITCH.length * 0.16)

export function updateAI(
  player: Player,
  ball: Ball,
  teammates: Player[],
  opponents: Player[],
  delta: number
): void {
  if (player.isHuman || player.isActionLocked) {
    player.moveDir.set(0, 0, 0)
    return
  }

  const mode = decideMode(player, ball, teammates)

  switch (mode) {
    case AIMode.ChaseBall:
      chaseBall(player, ball, opponents, delta)
      break
    case AIMode.SupportAttack:
      supportAttack(player, ball, teammates, delta)
      break
    case AIMode.Defend:
      defend(player, ball, delta)
      break
    case AIMode.ReturnToPosition:
      returnToPosition(player, delta)
      break
  }

  player.sprinting = mode === AIMode.ChaseBall
}

function decideMode(player: Player, ball: Ball, teammates: Player[]): AIMode {
  // If I have the ball -> handled in chaseBall (will pass/shoot)
  if (player.hasBall) return AIMode.ChaseBall

  // If ball is free and I'm closest on my team -> chase
  if (ball.isFree || ball.state === BallState.AirbornePass || ball.state === BallState.AirborneShot) {
    const myDist = player.position.distanceTo(ball.position)
    const closerTeammate = teammates.some(
      t => !t.isActionLocked && t.position.distanceTo(ball.position) < myDist * 0.8
    )
    if (!closerTeammate) return AIMode.ChaseBall
  }

  // If my team has ball -> support
  if (ball.state === BallState.Carried && ball.possessionTeam === player.team) {
    return AIMode.SupportAttack
  }

  // Opponent has ball -> defend
  if (ball.state === BallState.Carried && ball.possessionTeam !== player.team) {
    return AIMode.Defend
  }

  return AIMode.ReturnToPosition
}

function chaseBall(player: Player, ball: Ball, opponents: Player[], delta: number): void {
  if (player.hasBall) {
    handleCarrier(player, ball, opponents, delta)
    return
  }

  // Move toward ball
  const dir = new THREE.Vector3()
    .subVectors(ball.position, player.position)
  dir.y = 0
  player.moveDir.copy(dir)
}

function handleCarrier(player: Player, ball: Ball, _opponents: Player[], delta: number): void {
  // Determine goal direction
  const goalX = player.team === 'A' ? PITCH.halfLength : -PITCH.halfLength
  const toGoal = new THREE.Vector3(goalX, 0, 0).sub(player.position)
  const distToGoal = toGoal.length()

  // Shoot if close to goal
  if (distToGoal < AI_SHOOT_RANGE) {
    const shootDir = toGoal.clone().normalize()
    // Add slight randomness
    shootDir.z += (Math.random() - 0.5) * 0.3
    ball.releaseAsShot(shootDir)
    return
  }

  // Random pass decision
  if (Math.random() < AI_PASS_CHANCE * delta) {
    // Look for teammate ahead
    const passDir = toGoal.clone().normalize()
    passDir.z += (Math.random() - 0.5) * 0.5
    ball.releaseAsPass(passDir)
    return
  }

  // Otherwise dribble toward goal
  player.moveDir.copy(toGoal.normalize())
}

function supportAttack(player: Player, ball: Ball, _teammates: Player[], delta: number): void {
  // Position ahead of ball but offset to side
  const goalX = player.team === 'A' ? PITCH.halfLength : -PITCH.halfLength
  const forward = Math.sign(goalX)
  const targetX = ball.position.x + forward * AI_SUPPORT_DIST * (0.5 + player.index * 0.3)
  const targetZ = (player.index - 1) * 8 + (Math.sin(Date.now() * 0.001 + player.index) * 3)

  const target = new THREE.Vector3(
    THREE.MathUtils.clamp(targetX, -PITCH.halfLength + 5, PITCH.halfLength - 5),
    0,
    THREE.MathUtils.clamp(targetZ, -PITCH.halfWidth + 3, PITCH.halfWidth - 3)
  )

  const dir = target.sub(player.position)
  dir.y = 0

  if (dir.length() > 1.5) {
    player.moveDir.copy(dir)
  } else {
    player.moveDir.set(0, 0, 0)
  }
  void delta
}

function defend(player: Player, ball: Ball, delta: number): void {
  // Move toward ball but stay between ball and own goal
  const ownGoalX = player.team === 'A' ? -PITCH.halfLength : PITCH.halfLength
  const midX = (ball.position.x + ownGoalX) * 0.5
  const targetX = midX + (player.index - 1) * 4
  const targetZ = ball.position.z * 0.6 + (player.index - 1) * 5

  const target = new THREE.Vector3(
    THREE.MathUtils.clamp(targetX, -PITCH.halfLength + 3, PITCH.halfLength - 3),
    0,
    THREE.MathUtils.clamp(targetZ, -PITCH.halfWidth + 3, PITCH.halfWidth - 3)
  )

  const dir = target.sub(player.position)
  dir.y = 0
  player.moveDir.copy(dir)

  // Attempt tackle if close to ball carrier
  if (ball.carrier && ball.carrier.team !== player.team) {
    const dist = player.position.distanceTo(ball.carrier.position)
    if (dist < AI_TACKLE_RANGE && player.canTackle && Math.random() < 0.5 * delta * 60) {
      player.triggerTackle()
    }
  }
  void delta
}

function returnToPosition(player: Player, delta: number): void {
  const homeX = player.team === 'A'
    ? -8 + player.index * 5
    : 8 - player.index * 5
  const homeZ = (player.index - 1) * 8

  const dir = new THREE.Vector3(homeX, 0, homeZ).sub(player.position)
  dir.y = 0

  if (dir.length() > 2) {
    player.moveDir.copy(dir)
  } else {
    player.moveDir.set(0, 0, 0)
  }
  void delta
}
