import { ARCHETYPES, type Archetype } from '../config/archetypes'

const LINEUP_SIZE = 3
const LINEUP_SLOTS = ['Captain', 'Support', 'Anchor'] as const

export interface LineupPreviewEntry {
  slot: typeof LINEUP_SLOTS[number]
  name: string
  role: string
  color: number
}

export function buildLineup(selectedIndex: number): Archetype[] {
  const safeIndex = Number.isInteger(selectedIndex) && selectedIndex >= 0 && selectedIndex < ARCHETYPES.length
    ? selectedIndex
    : 0

  const lineup: Archetype[] = [ARCHETYPES[safeIndex]]

  for (let offset = 1; lineup.length < LINEUP_SIZE; offset += 1) {
    const next = ARCHETYPES[(safeIndex + offset) % ARCHETYPES.length]
    if (!lineup.includes(next)) lineup.push(next)
  }

  return lineup
}

export function buildLineupPreview(selectedIndex: number): LineupPreviewEntry[] {
  return buildLineup(selectedIndex).map((archetype, index) => ({
    slot: LINEUP_SLOTS[index],
    name: archetype.name,
    role: archetype.role,
    color: archetype.color,
  }))
}
