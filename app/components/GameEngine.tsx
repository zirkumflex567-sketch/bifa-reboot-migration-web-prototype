"use client"

import { useEffect, useRef } from "react"
import { Game } from "../../src/game/Game"

export default function GameEngine() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    if (!containerRef.current) return
    
    // Instantiate game logic inside the div
    const game = new Game(containerRef.current)
    game.start()
    
    return () => {
      game.destroy()
    }
  }, [])
  
  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 z-0 overflow-hidden" 
      id="game-root"
    />
  )
}
