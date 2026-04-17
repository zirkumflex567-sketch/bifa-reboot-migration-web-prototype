import { describe, expect, it } from 'vitest'
import { ARCHETYPES } from '../config/archetypes'
import { buildLineup, buildLineupPreview } from './teamSelection'

describe('buildLineup', () => {
  it('puts the selected archetype first for the lineup', () => {
    const lineup = buildLineup(4)

    expect(lineup[0].name).toBe(ARCHETYPES[4].name)
  })

  it('always returns three unique archetypes', () => {
    const lineup = buildLineup(10)

    expect(lineup).toHaveLength(3)
    expect(new Set(lineup.map((p) => p.name)).size).toBe(3)
  })

  it('falls back to the first archetype when selection is out of range', () => {
    const lineup = buildLineup(999)

    expect(lineup[0].name).toBe(ARCHETYPES[0].name)
  })
})

describe('buildLineupPreview', () => {
  it('marks the selected captain as the first preview entry', () => {
    const preview = buildLineupPreview(2)

    expect(preview[0].slot).toBe('Captain')
    expect(preview[0].name).toBe(ARCHETYPES[2].name)
  })

  it('keeps role and color information for rendering the setup screen', () => {
    const preview = buildLineupPreview(7)

    expect(preview[1].role).toBeTruthy()
    expect(preview[1].color).toBe(ARCHETYPES[8].color)
  })
})
