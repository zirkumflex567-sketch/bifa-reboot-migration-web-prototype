"use client"

import { useState, useMemo } from "react"
import { useGameStore } from "../../src/store"
import { CHARACTERS } from "../../src/data/CharacterData"
import { SHOP_ITEMS } from "../../src/data/ShopData"
import { BOUNTIES } from "../../src/data/BountyData"
import { CharacterId } from "../../src/save/SaveSchema"
import { SaveManager } from "../../src/save/SaveManager"

type Tab = "pilot" | "garage" | "contracts" | "techlab"

export default function Hub() {
  const { phase, meta, loadout, tryBuyShop, tryRankUpSkill, configureLoadout, startRun, refreshMeta } = useGameStore()
  const [tab, setTab] = useState<Tab>("pilot")
  const [selectedChar, setSelectedChar] = useState<CharacterId>(loadout?.character ?? "rixa")
  const [selectedVehicle, setSelectedVehicle] = useState<string>(loadout?.vehicleId ?? "vehicle_schrotty")
  const [selectedWeapon, setSelectedWeapon] = useState<string>(loadout?.weaponId ?? "weapon_autocannon")
  const [selectedBounties, setSelectedBounties] = useState<string[]>(loadout?.bountyIds ?? [])

  if (phase !== "Hub") return null

  const toggleBounty = (id: string) => {
    setSelectedBounties(cur => cur.includes(id) ? cur.filter(b => b !== id) : (cur.length < 2 ? [...cur, id] : cur))
  }

  const deploy = () => {
    configureLoadout({
      character: selectedChar,
      vehicleId: selectedVehicle,
      weaponId: selectedWeapon,
      bountyIds: selectedBounties,
    })
    startRun()
  }

  const canDeploy = meta.unlockedCharacters.includes(selectedChar)
    && meta.unlockedVehicles.includes(selectedVehicle)
    && meta.unlockedWeapons.includes(selectedWeapon)

  return (
    <div className="fixed inset-0 z-40 bg-[#040810f5] backdrop-blur-md flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <div>
          <div className="text-xs tracking-[0.3em] text-[#00ffaa]">BIFA // THE AUTOBALLER</div>
          <h1 className="font-bebas text-5xl text-white tracking-wide leading-none">THE GARAGE</h1>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <div className="text-xs text-white/50 tracking-widest">SCRAP</div>
            <div className="font-bebas text-3xl text-[#00ffaa]">{meta.totalScrap}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 tracking-widest">TECH</div>
            <div className="font-bebas text-3xl text-[#c9b7ff]">{meta.totalTech}</div>
          </div>
          <div>
            <div className="text-xs text-white/50 tracking-widest">RUNS</div>
            <div className="font-bebas text-3xl text-white">{meta.runsCompleted}</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 px-8 py-3 border-b border-white/10">
        {(["pilot","garage","contracts","techlab"] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-md font-bebas tracking-widest text-sm border transition ${
              tab === t ? "bg-[#00ffaa]/20 border-[#00ffaa] text-[#00ffaa]"
                        : "bg-white/5 border-white/10 text-white/60 hover:text-white"
            }`}
          >
            {t === "pilot" && "PILOT"}
            {t === "garage" && "SHOP"}
            {t === "contracts" && "CONTRACTS"}
            {t === "techlab" && "TECH-LAB"}
          </button>
        ))}
      </nav>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {tab === "pilot" && (
          <PilotTab
            selectedChar={selectedChar} setSelectedChar={setSelectedChar}
            selectedVehicle={selectedVehicle} setSelectedVehicle={setSelectedVehicle}
            selectedWeapon={selectedWeapon} setSelectedWeapon={setSelectedWeapon}
            unlockedVehicles={meta.unlockedVehicles}
            unlockedWeapons={meta.unlockedWeapons}
          />
        )}
        {tab === "garage" && (
          <ShopTab
            meta={meta}
            onBuy={(id) => { tryBuyShop(id); refreshMeta() }}
          />
        )}
        {tab === "contracts" && (
          <ContractsTab
            selected={selectedBounties}
            toggle={toggleBounty}
            meta={meta}
          />
        )}
        {tab === "techlab" && (
          <TechLabTab
            selectedChar={selectedChar}
            setSelectedChar={setSelectedChar}
            onRankUp={(nodeId) => { tryRankUpSkill(selectedChar, nodeId); refreshMeta() }}
            meta={meta}
          />
        )}
      </div>

      {/* Footer deploy bar */}
      <footer className="px-8 py-5 border-t border-white/10 flex justify-between items-center bg-black/40">
        <div className="text-white/70 text-sm">
          <div><span className="text-white/40">PILOT:</span> {CHARACTERS[selectedChar].displayName} <span className="text-white/40">· VEHICLE:</span> {selectedVehicle.replace("vehicle_","")} <span className="text-white/40">· WEAPON:</span> {selectedWeapon.replace("weapon_","")}</div>
          <div className="text-xs text-white/40 mt-1">CONTRACTS: {selectedBounties.length === 0 ? "none" : selectedBounties.map(id => id.replace("bounty_","")).join(", ")}</div>
        </div>
        <button
          onClick={deploy}
          disabled={!canDeploy}
          className="px-8 py-3 bg-[#00ffaa] text-black font-bebas text-2xl tracking-[0.2em] rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
        >
          DEPLOY
        </button>
      </footer>
    </div>
  )
}

// ---------------- PILOT TAB ----------------

function PilotTab(props: {
  selectedChar: CharacterId
  setSelectedChar: (c: CharacterId) => void
  selectedVehicle: string
  setSelectedVehicle: (v: string) => void
  selectedWeapon: string
  setSelectedWeapon: (w: string) => void
  unlockedVehicles: string[]
  unlockedWeapons: string[]
}) {
  const { selectedChar, setSelectedChar, selectedVehicle, setSelectedVehicle, selectedWeapon, setSelectedWeapon, unlockedVehicles, unlockedWeapons } = props
  const char = CHARACTERS[selectedChar]

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Character select */}
      <div className="col-span-1 space-y-3">
        <SectionHeader>PILOT</SectionHeader>
        {(["rixa","marek"] as CharacterId[]).map(id => {
          const c = CHARACTERS[id]
          const active = selectedChar === id
          return (
            <button
              key={id}
              onClick={() => setSelectedChar(id)}
              className={`w-full text-left p-4 rounded-lg border transition ${
                active ? "border-[#00ffaa] bg-[#00ffaa]/10" : "border-white/10 bg-white/5 hover:border-white/30"
              }`}
            >
              <div className="font-bebas text-2xl text-white tracking-widest">{c.displayName}</div>
              <div className="text-xs text-white/50">{c.title}</div>
              <div className="text-xs text-[#00ffaa] mt-2">{c.passiveTrait.name}</div>
            </button>
          )
        })}
      </div>

      {/* Middle: Character details */}
      <div className="col-span-1">
        <SectionHeader>PROFILE</SectionHeader>
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <p className="text-white/80 text-sm">{char.description}</p>
          <p className="text-white/50 text-xs italic">{char.shortLore}</p>
          <div className="mt-4 space-y-1 text-xs text-white/70">
            <Stat k="Max Hull" v={`${char.baseStats.maxHealth} HP`} />
            <Stat k="Armor" v={`${char.baseStats.armor}`} />
            <Stat k="Move Speed" v={`${sign(char.baseStats.moveSpeedPercent)}%`} />
            <Stat k="Crit Chance" v={`${sign(char.baseStats.critChancePercent)}%`} />
            <Stat k="Pickup Radius" v={`${sign(char.baseStats.pickupRadiusPercent)}%`} />
          </div>
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="font-bebas text-[#00ffaa] tracking-widest text-lg">{char.passiveTrait.name}</div>
            <div className="text-xs text-white/70">{char.passiveTrait.description}</div>
          </div>
        </div>
      </div>

      {/* Right: Vehicle + Weapon select */}
      <div className="col-span-1 space-y-6">
        <div>
          <SectionHeader>VEHICLE</SectionHeader>
          <div className="space-y-2">
            {SHOP_ITEMS.filter(i => i.category === "Vehicle").map(v => {
              const owned = unlockedVehicles.includes(v.id)
              const active = selectedVehicle === v.id
              return (
                <button
                  key={v.id}
                  disabled={!owned}
                  onClick={() => owned && setSelectedVehicle(v.id)}
                  className={`w-full text-left p-3 rounded-md border text-sm transition ${
                    active ? "border-[#00ffaa] bg-[#00ffaa]/10" :
                    owned ? "border-white/10 bg-white/5 hover:border-white/30" :
                            "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between"><span className="font-bold text-white">{v.displayName}</span>{!owned && <span className="text-white/40 text-xs">LOCKED</span>}</div>
                  <div className="text-xs text-white/50">{v.description}</div>
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <SectionHeader>WEAPON</SectionHeader>
          <div className="space-y-2">
            {SHOP_ITEMS.filter(i => i.category === "Weapon").map(w => {
              const owned = unlockedWeapons.includes(w.id)
              const active = selectedWeapon === w.id
              return (
                <button
                  key={w.id}
                  disabled={!owned}
                  onClick={() => owned && setSelectedWeapon(w.id)}
                  className={`w-full text-left p-3 rounded-md border text-sm transition ${
                    active ? "border-[#00ffaa] bg-[#00ffaa]/10" :
                    owned ? "border-white/10 bg-white/5 hover:border-white/30" :
                            "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
                  }`}
                >
                  <div className="flex justify-between"><span className="font-bold text-white">{w.displayName}</span>{!owned && <span className="text-white/40 text-xs">LOCKED</span>}</div>
                  <div className="text-xs text-white/50">{w.description}</div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------- SHOP TAB ----------------

function ShopTab({ meta, onBuy }: { meta: ReturnType<typeof SaveManager.getMeta>; onBuy: (id: string) => void }) {
  const grouped = useMemo(() => {
    const g: Record<string, typeof SHOP_ITEMS> = {}
    for (const it of SHOP_ITEMS) { (g[it.category] ??= []).push(it) }
    return g
  }, [])

  const ownedSet = new Set<string>([
    ...meta.unlockedWeapons, ...meta.unlockedVehicles,
    ...meta.unlockedUpgrades, ...meta.unlockedCosmetics,
  ])

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <SectionHeader>{cat.toUpperCase()}S</SectionHeader>
          <div className="grid grid-cols-3 gap-3">
            {items.map(it => {
              const owned = ownedSet.has(it.id)
              const canAfford = meta.totalScrap >= it.scrapCost && meta.totalTech >= it.techCost
              return (
                <div key={it.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex flex-col gap-2">
                  <div className="font-bold text-white">{it.displayName}</div>
                  <div className="text-xs text-white/60 flex-1">{it.description}</div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs">
                      <span className="text-[#00ffaa]">{it.scrapCost} S</span>
                      {it.techCost > 0 && <span className="text-[#c9b7ff] ml-2">{it.techCost} T</span>}
                    </div>
                    {owned ? (
                      <span className="text-xs text-white/50 tracking-widest">OWNED</span>
                    ) : (
                      <button
                        onClick={() => onBuy(it.id)}
                        disabled={!canAfford}
                        className="px-3 py-1 bg-[#00ffaa] text-black rounded text-xs font-bold disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed"
                      >
                        BUY
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------- CONTRACTS TAB ----------------

function ContractsTab({ selected, toggle, meta }: { selected: string[]; toggle: (id: string) => void; meta: ReturnType<typeof SaveManager.getMeta> }) {
  return (
    <div>
      <SectionHeader>CONTRACTS (MAX 2)</SectionHeader>
      <p className="text-xs text-white/50 mb-4">Contracts add risk-reward modifiers to the next run.</p>
      <div className="grid grid-cols-2 gap-3">
        {BOUNTIES.map(b => {
          const active = selected.includes(b.id)
          const unlocked = b.unlockCost === 0 || meta.unlockedBounties.includes(b.id) || meta.totalScrap >= b.unlockCost
          return (
            <button
              key={b.id}
              disabled={!unlocked}
              onClick={() => toggle(b.id)}
              className={`p-4 rounded-lg border text-left transition ${
                active ? "border-[#ffaa00] bg-[#ffaa00]/10" :
                unlocked ? "border-white/10 bg-white/5 hover:border-white/30" :
                           "border-white/5 bg-white/5 opacity-40 cursor-not-allowed"
              }`}
            >
              <div className="font-bebas text-xl text-white tracking-wider">{b.displayName}</div>
              <div className="text-xs text-white/70 mb-2">{b.description}</div>
              <div className="text-[10px] text-white/40">Reward: {b.rewardScrap}S / {b.rewardTech}T</div>
              {b.unlockCost > 0 && !meta.unlockedBounties.includes(b.id) && (
                <div className="text-[10px] text-[#ffaa00] mt-1">Unlock at {b.unlockCost} scrap total</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ---------------- TECH-LAB TAB ----------------

function TechLabTab({ selectedChar, setSelectedChar, onRankUp, meta }: {
  selectedChar: CharacterId
  setSelectedChar: (c: CharacterId) => void
  onRankUp: (nodeId: string) => void
  meta: ReturnType<typeof SaveManager.getMeta>
}) {
  const char = CHARACTERS[selectedChar]
  const ranks = meta.skillTech[selectedChar] ?? {}

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["rixa","marek"] as CharacterId[]).map(id => (
          <button
            key={id}
            onClick={() => setSelectedChar(id)}
            className={`px-4 py-2 rounded-md text-sm font-bebas tracking-widest border ${
              selectedChar === id ? "border-[#c9b7ff] bg-[#c9b7ff]/10 text-[#c9b7ff]"
                                   : "border-white/10 bg-white/5 text-white/60"
            }`}
          >
            {CHARACTERS[id].displayName}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {char.branches.map(branch => (
          <div key={branch.id} className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="font-bebas text-xl text-[#c9b7ff] tracking-widest">{branch.name}</div>
            <div className="text-xs text-white/50 mb-4">{branch.theme}</div>
            <div className="space-y-2">
              {branch.nodes.map(n => {
                const rank = ranks[n.id] ?? 0
                const maxed = rank >= n.maxRanks
                const affordable = meta.totalTech >= n.techCost
                return (
                  <div key={n.id} className={`p-3 rounded border text-xs ${n.tier === 4 ? "border-[#ffaa00]/60 bg-[#ffaa00]/5" : "border-white/10 bg-black/20"}`}>
                    <div className="flex justify-between items-center">
                      <span className={`font-bold ${n.tier === 4 ? "text-[#ffaa00]" : "text-white"}`}>
                        {n.tier === 4 ? "★ " : `T${n.tier} · `}{n.name}
                      </span>
                      <span className="text-white/50">{rank}/{n.maxRanks}</span>
                    </div>
                    <div className="text-white/60 mt-1 leading-relaxed">{n.description}</div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[#c9b7ff]">{n.techCost} T</span>
                      <button
                        onClick={() => onRankUp(n.id)}
                        disabled={maxed || !affordable}
                        className="px-3 py-1 rounded bg-[#c9b7ff] text-black font-bold text-[10px] disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed"
                      >
                        {maxed ? "MAX" : "RANK UP"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------- HELPERS ----------------

function SectionHeader({ children }: { children: React.ReactNode }) {
  return <div className="text-xs font-bold tracking-[0.3em] text-white/50 uppercase mb-3">{children}</div>
}

function Stat({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between"><span className="text-white/40">{k}</span><span className="text-white">{v}</span></div>
}

function sign(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}
