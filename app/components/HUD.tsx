"use client"

import { useGameStore } from "../../src/store"

export default function HUD() {
  const { 
    wave, 
    enemiesAlive, 
    health, 
    maxHealth, 
    scrap, 
    level, 
    xpToNextLevel,
    callout, 
    calloutKey,
    phase 
  } = useGameStore()

  if (phase === "WaitingToStart" || phase === "RunSummary" || phase === "GameOver" || phase === "UpgradeSelection") return null

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100))
  const xpPercent = Math.max(0, Math.min(100, (scrap / xpToNextLevel) * 100))

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between">
      {/* Top Bar HUD */}
      <div className="w-full flex justify-between items-start p-6">
        
        {/* Left: Health & Level */}
        <div className="flex flex-col gap-2 w-64">
          {/* Level Info */}
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur border border-white/20 px-4 py-2 rounded-lg">
            <span className="font-bebas text-3xl text-white">LVL {level}</span>
            <div className="flex-1 h-2 bg-black/60 rounded-full overflow-hidden">
              <div className="h-full bg-[#00ffaa] transition-all duration-300" style={{ width: `${xpPercent}%` }} />
            </div>
            <span className="text-white/60 text-xs font-bold">{scrap}/{xpToNextLevel}</span>
          </div>

          {/* Health Info */}
          <div className="bg-black/40 backdrop-blur border border-white/20 px-4 py-2 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 bg-red-500/20" style={{ width: `${healthPercent}%` }} />
            <div className="relative flex justify-between items-center z-10">
              <span className="font-bebas text-2xl text-red-400 tracking-wider">HULL INTEGRITY</span>
              <span className="font-bold text-white">{Math.ceil(health)}</span>
            </div>
          </div>
        </div>

        {/* Right: Wave Info */}
        <div className="flex flex-col items-end gap-2 w-48">
          <div className="bg-black/60 backdrop-blur border border-[#ffaa00]/50 px-6 py-3 rounded-lg text-right">
            <div className="text-[0.65rem] font-bold tracking-[0.3em] uppercase text-[#ffaa00] mb-1">HORDE SURVIVAL</div>
            <div className="font-bebas text-4xl text-white tracking-widest leading-none">WAVE {wave}</div>
            <div className="text-sm font-bold text-white/50 mt-1">{enemiesAlive} HOSTILES ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Callout Message */}
      {callout && (
        <div 
          key={calloutKey} 
          className="fixed top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 font-bebas text-[clamp(4rem,10vw,8rem)] tracking-tighter uppercase text-white animate-[cpulse_0.5s_cubic-bezier(0.17,0.89,0.32,1.27)_forwards]"
          style={{ textShadow: '0 0 40px rgba(0,255,170,0.5)' }}
        >
          {callout}
        </div>
      )}

      {/* Controls Bar */}
      <div className="mb-6 mx-auto flex gap-4 bg-black/40 backdrop-blur-sm border border-white/10 rounded-full px-6 py-2.5 text-[0.65rem] font-bold text-white/50 transition-opacity duration-500 hover:opacity-100">
        <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 bg-white/10 rounded min-w-[20px] text-center">WASD</kbd> DRIVE</span>
        <span className="flex items-center gap-1.5 px-3 border-l border-white/10 text-white/40">AUTO-WEAPON ENGAGED</span>
      </div>
    </div>
  )
}
