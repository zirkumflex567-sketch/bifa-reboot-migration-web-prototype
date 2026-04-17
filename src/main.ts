import './style.css'
import { ARCHETYPES } from './config/archetypes'
import { Game } from './game/Game'
import { buildLineupPreview } from './game/teamSelection'
import { initAudio, startUnstoppableVuvuzela } from './audio/SFX'

/* ═══════════════════════════════════════════════════════════════
   Entry point — handles mode selection then boots the Game
   ═══════════════════════════════════════════════════════════════ */

const mountNode = document.querySelector<HTMLElement>('#game-root')!

// ── Mode selection ──
let localTwoPlayer = false

const btn1p = document.getElementById('btn-1p')!
const btn2p = document.getElementById('btn-2p')!
const captainA = document.getElementById('captain-a') as HTMLSelectElement
const captainB = document.getElementById('captain-b') as HTMLSelectElement
const lineupA = document.getElementById('lineup-a') as HTMLDivElement
const lineupB = document.getElementById('lineup-b') as HTMLDivElement

function populateCaptainSelect(el: HTMLSelectElement, defaultIndex: number): void {
  el.innerHTML = ''
  ARCHETYPES.forEach((archetype, index) => {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = `${archetype.name} — ${archetype.role}`
    el.appendChild(option)
  })
  el.value = String(defaultIndex)
}

function renderLineupPreview(container: HTMLDivElement, selectedIndex: number): void {
  const preview = buildLineupPreview(selectedIndex)
  container.innerHTML = preview.map((entry) => {
    const color = `#${entry.color.toString(16).padStart(6, '0')}`
    return `
      <article class="lineup-card">
        <span class="lineup-slot">${entry.slot}</span>
        <div class="lineup-identity">
          <span class="lineup-swatch" style="background:${color}"></span>
          <div>
            <strong>${entry.name}</strong>
            <small>${entry.role}</small>
          </div>
        </div>
      </article>
    `
  }).join('')
}

populateCaptainSelect(captainA, 0)
populateCaptainSelect(captainB, 7)
renderLineupPreview(lineupA, Number(captainA.value))
renderLineupPreview(lineupB, Number(captainB.value))

captainA.addEventListener('change', () => {
  renderLineupPreview(lineupA, Number(captainA.value))
})

captainB.addEventListener('change', () => {
  renderLineupPreview(lineupB, Number(captainB.value))
})

btn1p.addEventListener('click', () => {
  localTwoPlayer = false
  btn1p.classList.add('active')
  btn2p.classList.remove('active')
})

btn2p.addEventListener('click', () => {
  localTwoPlayer = true
  btn2p.classList.add('active')
  btn1p.classList.remove('active')
  // Auto-start on 2P click
  startGame()
})

// Space or btn click starts game
window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
    // Only start from title screen (game not yet created)
    if (!gameStarted) {
      e.preventDefault()
      startGame()
    }
  }
})

let game: Game | null = null
let gameStarted = false

function startGame(): void {
  if (gameStarted) return
  gameStarted = true
  initAudio()
  startUnstoppableVuvuzela()
  game = new Game(mountNode, {
    localTwoPlayer,
    teamASelection: Number(captainA.value),
    teamBSelection: Number(captainB.value),
  })
  game.start()
}

// Also allow clicking either mode button text to start
btn1p.addEventListener('click', () => {
  // Slight delay so active state is visible
  setTimeout(startGame, 80)
})

window.addEventListener('beforeunload', () => {
  game?.destroy()
})
