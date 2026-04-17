"use client"

import dynamic from "next/dynamic"
import GameUI from "./components/GameUI"

// Initialize game engine on client side only to avoid SSR issues with canvas and window
const GameEngine = dynamic(() => import("./components/GameEngine"), { 
  ssr: false,
})

export default function Home() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-background relative">
      <GameEngine />
      <GameUI />
    </main>
  )
}
