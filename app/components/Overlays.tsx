"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "../../src/store"

export default function Overlays() {
  const { phase, scrap, level } = useGameStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || phase === "InPlay") return null

  let content = null

  if (phase === "Loading") {
    content = (
      <>
        <div className="inline-block px-3 py-1 border-2 border-ac rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-ac mb-3 animate-pulse">LOADING ASSETS</div>
        <h1 className="font-bebas text-[clamp(2rem,6vw,4rem)] tracking-wide leading-none mb-3 text-white">INITIALIZING ARENA...</h1>
      </>
    )
  }

  if (phase === "WaitingToStart") {
    content = (
      <>
        <div className="inline-block px-3 py-1 border-2 border-ac rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-ac mb-3">VEHICLE ARENA</div>
        <h1 className="font-bebas text-[clamp(3rem,10vw,7rem)] tracking-wide leading-none mb-6 bg-gradient-to-br from-white to-ac text-transparent bg-clip-text">HORDE SURVIVAL</h1>
        <p className="text-xl text-secondary-text leading-relaxed font-bebas tracking-wider mb-6">SELECT YOUR PILOT</p>
        <div className="flex gap-4 justify-center">
          <button onClick={() => useGameStore.getState().startGame("rixa")} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
            <h3 className="font-bebas text-3xl text-white group-hover:text-[#00ffaa] mb-2 tracking-widest">RIXA</h3>
            <p className="text-white/60 text-sm italic mb-2">Offensive Specialist</p>
            <ul className="text-[#00ffaa]/80 text-sm list-disc pl-4 space-y-1">
              <li>+5 Base Damage</li>
              <li>+15% Fire Rate</li>
            </ul>
          </button>
          <button onClick={() => useGameStore.getState().startGame("marek")} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
            <h3 className="font-bebas text-3xl text-white group-hover:text-[#00ffaa] mb-2 tracking-widest">MAREK</h3>
            <p className="text-white/60 text-sm italic mb-2">Utility & Survivalist</p>
            <ul className="text-[#00ffaa]/80 text-sm list-disc pl-4 space-y-1">
              <li>+50 Max Hull Integrity</li>
              <li>+50% Elite Scrap Drops</li>
            </ul>
          </button>
        </div>
      </>
    )
  }

  if (phase === "UpgradeSelection") {
    content = (
      <div className="w-[800px] max-w-[90vw]">
        <div className="inline-block px-3 py-1 border-2 border-[#00ffaa] rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-[#00ffaa] mb-3">LEVEL UP!</div>
        <h1 className="font-bebas text-[clamp(2rem,6vw,4rem)] tracking-wide leading-none mb-8 text-white">CHOOSE UPGRADE</h1>
        <div className="flex gap-4 justify-center">
          <button onClick={() => useGameStore.getState().applyUpgrade("Armor")} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
            <h3 className="font-bold text-xl text-white group-hover:text-[#00ffaa] mb-2">Armor Plating</h3>
            <p className="text-white/60 text-sm">Heal 50 HP and increase Max HP.</p>
          </button>
          <button onClick={() => useGameStore.getState().applyUpgrade("Turbo")} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
            <h3 className="font-bold text-xl text-white group-hover:text-[#00ffaa] mb-2">Turbo Charger</h3>
            <p className="text-white/60 text-sm">+10% Top Speed and Acceleration.</p>
          </button>
          <button onClick={() => useGameStore.getState().applyUpgrade("Cannons")} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
            <h3 className="font-bold text-xl text-white group-hover:text-[#00ffaa] mb-2">Dual Cannons</h3>
            <p className="text-white/60 text-sm">Fire rate +20% and Damage +5.</p>
          </button>
        </div>
      </div>
    )
  }

  if (phase === "RunSummary" || phase === "GameOver") {
    content = (
      <>
        <div className={`inline-block px-3 py-1 border-2 rounded-full font-bebas text-sm tracking-[0.14em] uppercase mb-3 ${phase === "GameOver" ? "border-red-500 text-red-500" : "border-[#00ffaa] text-[#00ffaa]"}`}>
          {phase === "GameOver" ? "VEHICLE DESTROYED" : "EXTRACTION SUCCESS"}
        </div>
        <h1 className="font-bebas text-[clamp(3rem,8vw,6rem)] tracking-wide leading-none mb-3 text-white">RUN SUMMARY</h1>
        <div className="text-left bg-white/5 border border-white/10 p-6 rounded-lg mb-6">
          <p className="flex justify-between items-center mb-2"><span className="text-white/60">Level Reached</span><span className="font-bold">{level}</span></p>
          <p className="flex justify-between items-center mb-2"><span className="text-white/60">Scrap Collected</span><span className="font-bold">{scrap}</span></p>
        </div>
        <button onClick={() => window.location.reload()} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">
          RETURN TO HUB
        </button>
      </>
    )
  }
  
  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040810e0] backdrop-blur-md pointer-events-auto">
      <div className="text-center p-8">
        {content}
      </div>
    </div>
  )
}
