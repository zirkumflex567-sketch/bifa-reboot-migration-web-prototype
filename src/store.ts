import { create } from 'zustand'

export interface GameState {
  // Horde Survival State
  wave: number
  enemiesAlive: number
  health: number
  maxHealth: number
  scrap: number
  level: number
  xpToNextLevel: number
  phase: "Loading" | "WaitingToStart" | "InPlay" | "Extraction" | "GameOver" | "RunSummary" | "UpgradeSelection"
  character: "rixa" | "marek" | null
  
  callout: string | null
  calloutKey: number
  
  // Settings
  polygonMode: boolean
  audioEnabled: boolean
  volume: number

  modifiers: {
    speedMult: number
    damageBonus: number
    fireRateMult: number
    scrapMult: number
  }

  showCallout: (text: string, duration?: number) => void
  setMatchState: (state: Partial<GameState>) => void
  startGame: (character: "rixa" | "marek") => void
  setPolygonMode: (enabled: boolean) => void
  setAudioEnabled: (enabled: boolean) => void
  applyUpgrade: (type: "Armor" | "Turbo" | "Cannons") => void
}

export const useGameStore = create<GameState>((set) => ({
  wave: 1,
  enemiesAlive: 0,
  health: 100,
  maxHealth: 100,
  scrap: 0,
  level: 1,
  xpToNextLevel: 50,
  phase: "Loading",
  character: null,
  callout: null,
  calloutKey: 0,
  
  polygonMode: false,
  audioEnabled: true,
  volume: 0.5,

  modifiers: {
    speedMult: 1.0,
    damageBonus: 0,
    fireRateMult: 1.0,
    scrapMult: 1.0
  },

  showCallout: (text: string, duration = 3000) => {
    set((state) => ({ callout: text, calloutKey: state.calloutKey + 1 }))
    setTimeout(() => {
      set((state) => {
        if (state.callout === text) return { callout: null }
        return state
      })
    }, duration)
  },

  setMatchState: (stateUpdate) => set(stateUpdate),
  
  startGame: (character) => set(() => {
    // Reset base run stats
    const baseModifiers = {
      speedMult: 1.0,
      damageBonus: 0,
      fireRateMult: 1.0,
      scrapMult: 1.0
    }
    let maxHealth = 100
    let health = 100
    
    // Apply character specific skills
    if (character === "rixa") {
      baseModifiers.damageBonus += 5
      baseModifiers.fireRateMult += 0.15
    } else if (character === "marek") {
      baseModifiers.scrapMult += 0.5 // +50% scrap
      maxHealth += 50
      health = maxHealth
    }
    
    return {
      phase: "InPlay",
      character,
      modifiers: baseModifiers,
      maxHealth,
      health,
      scrap: 0,
      level: 1,
      xpToNextLevel: 50,
      enemiesAlive: 0
    }
  }),
  
  setPolygonMode: (enabled) => set({ polygonMode: enabled }),
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
  
  applyUpgrade: (type) => set((state) => {
    const newState = { ...state }
    
    if (type === "Armor") {
      newState.maxHealth += 50
      newState.health = Math.min(newState.health + 50, newState.maxHealth)
    } else if (type === "Turbo") {
      newState.modifiers = { ...state.modifiers, speedMult: state.modifiers.speedMult + 0.1 }
    } else if (type === "Cannons") {
      newState.modifiers = { 
        ...state.modifiers, 
        fireRateMult: state.modifiers.fireRateMult + 0.2,
        damageBonus: state.modifiers.damageBonus + 5
      }
    }
    
    newState.phase = "InPlay"
    return newState
  })
}))
