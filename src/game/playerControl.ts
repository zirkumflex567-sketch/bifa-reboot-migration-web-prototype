export interface ControlledPlayerSnapshot {
  x: number
  z: number
  hasBall: boolean
}

export interface BallSnapshot {
  x: number
  z: number
}

export function nextControlledPlayerIndex(currentIndex: number, teamSize: number): number {
  if (teamSize <= 0) return currentIndex
  return (currentIndex + 1) % teamSize
}

export function chooseAutoControlledPlayerIndex(
  players: ControlledPlayerSnapshot[],
  ball: BallSnapshot,
  currentIndex: number,
): number {
  if (players.length === 0) return currentIndex

  const carrierIndex = players.findIndex((player) => player.hasBall)
  if (carrierIndex >= 0) return carrierIndex

  let bestIndex = 0
  let bestDistance = Number.POSITIVE_INFINITY

  players.forEach((player, index) => {
    const dx = player.x - ball.x
    const dz = player.z - ball.z
    const distanceSq = dx * dx + dz * dz
    if (distanceSq < bestDistance) {
      bestDistance = distanceSq
      bestIndex = index
    }
  })

  return bestIndex
}
