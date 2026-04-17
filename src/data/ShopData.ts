import { UnlockType } from "../save/SaveSchema"

export interface ShopItem {
  id: string
  unlockType: UnlockType
  displayName: string
  description: string
  scrapCost: number
  techCost: number
  category: "Weapon" | "Vehicle" | "Cosmetic"
}

export const SHOP_ITEMS: ShopItem[] = [
  // Weapons
  { id: "weapon_autocannon", unlockType: "Weapon", category: "Weapon", displayName: "Autocannon", description: "Reliable auto-firing cannon. Starter.", scrapCost: 0, techCost: 0 },
  { id: "weapon_shotgun", unlockType: "Weapon", category: "Weapon", displayName: "Scrap Shotgun", description: "Short range, wide cone, heavy impact.", scrapCost: 500, techCost: 0 },
  { id: "weapon_rail", unlockType: "Weapon", category: "Weapon", displayName: "Rail Lance", description: "Long-range piercing tracer.", scrapCost: 1200, techCost: 2 },
  { id: "weapon_swarm", unlockType: "Weapon", category: "Weapon", displayName: "Swarm Launcher", description: "Homing micro-missiles.", scrapCost: 2500, techCost: 5 },

  // Vehicles
  { id: "vehicle_schrotty", unlockType: "Vehicle", category: "Vehicle", displayName: "Schrotty", description: "Starter chassis. Balanced.", scrapCost: 0, techCost: 0 },
  { id: "vehicle_hornet", unlockType: "Vehicle", category: "Vehicle", displayName: "Hornet", description: "Light buggy, +20% top speed, -20% HP.", scrapCost: 800, techCost: 0 },
  { id: "vehicle_mammoth", unlockType: "Vehicle", category: "Vehicle", displayName: "Mammoth", description: "Heavy tank, +50% HP, -15% speed.", scrapCost: 1500, techCost: 1 },
  { id: "vehicle_dragoon", unlockType: "Vehicle", category: "Vehicle", displayName: "Dragoon", description: "Experimental frame. +10% all stats.", scrapCost: 5000, techCost: 10 },

  // Cosmetics
  { id: "cos_neon_trail", unlockType: "Cosmetic", category: "Cosmetic", displayName: "Neon Trail", description: "Cyan exhaust particles.", scrapCost: 300, techCost: 0 },
  { id: "cos_chrome_paint", unlockType: "Cosmetic", category: "Cosmetic", displayName: "Chrome Paint", description: "Polished reflective hull.", scrapCost: 750, techCost: 0 },
]

export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(i => i.id === id)
}
