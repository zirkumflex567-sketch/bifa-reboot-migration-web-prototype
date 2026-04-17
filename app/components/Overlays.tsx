"use client"

import { useState, useEffect } from "react"
import { useGameStore } from "../../src/store"
import { CHARACTERS } from "../../src/data/CharacterData"
import { computeBankedResources } from "../../src/save/SaveManager"
import { defaultRunData } from "../../src/save/SaveSchema"

export default function Overlays() {
  const { phase, scrap, tech, level, wave, enemiesKilledThisRun, runStartMs, character, loadout, bootFromSave, enterHub, applyUpgrade } = useGameStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    bootFromSave()
    // After boot, if we're still Loading, route to Hub as primary entry point
    const cur = useGameStore.getState().phase
    if (cur === "Loading" || cur === "WaitingToStart") enterHub()
  }, [bootFromSave, enterHub])

  if (!mounted || phase === "InPlay" || phase === "Hub") return null

  let content = null

  if (phase === "Loading") {
    content = (
      <>
        <div className="inline-block px-3 py-1 border-2 border-[#00ffaa] rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-[#00ffaa] mb-3 animate-pulse">LOADING ASSETS</div>
        <h1 className="font-bebas text-[clamp(2rem,6vw,4rem)] tracking-wide leading-none mb-3 text-white">INITIALIZING ARENA...</h1>
      </>
    )
  }

  if (phase === "WaitingToStart") {
    // Legacy fallback: should not normally show because we re-route to Hub
    content = (
      <>
        <div className="inline-block px-3 py-1 border-2 border-[#00ffaa] rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-[#00ffaa] mb-3">PREPARING</div>
        <h1 className="font-bebas text-[clamp(3rem,10vw,7rem)] tracking-wide leading-none mb-6 bg-gradient-to-br from-white to-[#00ffaa] text-transparent bg-clip-text">ENTERING ARENA</h1>
        <button onClick={enterHub} className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors">BACK TO HUB</button>
      </>
    )
  }

  if (phase === "UpgradeSelection") {
    const { offeredUpgrades } = useGameStore.getState()
    content = (
      <div className="w-[800px] max-w-[90vw]">
        <div className="inline-block px-3 py-1 border-2 border-[#00ffaa] rounded-full font-bebas text-sm tracking-[0.14em] uppercase text-[#00ffaa] mb-3">LEVEL UP!</div>
        <h1 className="font-bebas text-[clamp(2rem,6vw,4rem)] tracking-wide leading-none mb-8 text-white">CHOOSE UPGRADE</h1>
        <div className="flex gap-4 justify-center">
          {offeredUpgrades.map(u => (
            <UpgradeCard key={u.id} title={u.name} desc={u.description} onClick={() => applyUpgrade(u.id)} />
          ))}
        </div>
      </div>
    )
  }

  if (phase === "RunSummary" || phase === "GameOver") {
    // Build a transient RunData snapshot from current store to compute banked values
    const run = {
      ...defaultRunData(),
      scrapEarned: scrap,
      techEarned: tech,
      outcome: phase === "GameOver" ? "Died" as const : "Extracted" as const,
      wave,
      enemiesKilled: enemiesKilledThisRun,
      durationSeconds: runStartMs ? Math.max(0, (Date.now() - runStartMs) / 1000) : 0,
    }
    const banked = computeBankedResources(run)
    const charDisplay = loadout ? CHARACTERS[loadout.character].displayName : (character ? CHARACTERS[character].displayName : "—")

    content = (
      <>
        <div className={`inline-block px-3 py-1 border-2 rounded-full font-bebas text-sm tracking-[0.14em] uppercase mb-3 ${phase === "GameOver" ? "border-red-500 text-red-500" : "border-[#00ffaa] text-[#00ffaa]"}`}>
          {phase === "GameOver" ? "VEHICLE DESTROYED" : "EXTRACTION SUCCESS"}
        </div>
        <h1 className="font-bebas text-[clamp(3rem,8vw,6rem)] tracking-wide leading-none mb-3 text-white">RUN SUMMARY</h1>
        <div className="text-left bg-white/5 border border-white/10 p-6 rounded-lg mb-6 min-w-[420px]">
          <SumRow k="Pilot" v={charDisplay} />
          <SumRow k="Wave Reached" v={`${wave}`} />
          <SumRow k="Level Reached" v={`${level}`} />
          <SumRow k="Enemies Killed" v={`${enemiesKilledThisRun}`} />
          <SumRow k="Duration" v={`${run.durationSeconds.toFixed(1)}s`} />
          <div className="border-t border-white/10 my-3" />
          <SumRow k="Scrap Earned" v={`${scrap}`} />
          <SumRow k="Tech Earned" v={`${tech}`} />
          <div className="border-t border-white/10 my-3" />
          <SumRow k="Scrap Banked" v={`+${banked.scrap}`} color="text-[#00ffaa]" />
          <SumRow k="Tech Banked" v={`+${banked.tech}`} color="text-[#c9b7ff]" />
          {phase === "GameOver" && (
            <>
              <SumRow k="Scrap Lost" v={`-${banked.scrapLost}`} color="text-red-400" />
              <SumRow k="Tech Lost" v={`-${banked.techLost}`} color="text-red-400" />
            </>
          )}
        </div>
        <button onClick={enterHub} className="px-6 py-3 bg-[#00ffaa] text-black font-bebas text-2xl tracking-[0.2em] rounded-lg hover:bg-white transition-colors">
          RETURN TO GARAGE
        </button>
      </>
    )
  }

  if (!content) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040810e0] backdrop-blur-md pointer-events-auto">
      <div className="text-center p-8">{content}</div>
    </div>
  )
}

function UpgradeCard({ title, desc, onClick }: { title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex-1 bg-[#111827] border border-white/20 hover:border-[#00ffaa] p-6 rounded-lg transition-all text-left group">
      <h3 className="font-bold text-xl text-white group-hover:text-[#00ffaa] mb-2">{title}</h3>
      <p className="text-white/60 text-sm">{desc}</p>
    </button>
  )
}

function SumRow({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <p className="flex justify-between items-center mb-1 text-sm">
      <span className="text-white/60">{k}</span>
      <span className={`font-bold ${color ?? "text-white"}`}>{v}</span>
    </p>
  )
}
