import { useGameStore } from '../store'

export class HUD {
  update(wave: number, enemies: number, health: number, phase: any): void {
    useGameStore.getState().setMatchState({
      wave,
      enemiesAlive: enemies,
      health,
      phase
    })
  }

  showCallout(text: string, duration = 2000): void {
    useGameStore.getState().showCallout(text, duration)
  }
}
