import './style.css'
import { ARCHETYPES } from './config/archetypes'
import { Game } from './game/Game'
import { buildLineupPreview } from './game/teamSelection'
import { initAudio, startUnstoppableVuvuzela } from './audio/SFX'

const mountNode = document.querySelector<HTMLElement>('#game-root')!
const searchParams = new URLSearchParams(window.location.search)
const qaMode = searchParams.get('qa') === '1'
const aiDemoMode = searchParams.get('aivsa') === '1' || searchParams.get('demo') === '1'
const fastMode = searchParams.get('fast') === '1' || qaMode
const autoBoot = searchParams.get('autoboot') === '1' || qaMode || aiDemoMode

// mode selection
let localTwoPlayer = false
let forceAiDemo = aiDemoMode

const btn1p = document.getElementById('btn-1p')!
const btn2p = document.getElementById('btn-2p')!
const btnAiDemo = document.getElementById('btn-ai-demo')!
const captainA = document.getElementById('captain-a') as HTMLSelectElement
const captainB = document.getElementById('captain-b') as HTMLSelectElement
const lineupA = document.getElementById('lineup-a') as HTMLDivElement
const lineupB = document.getElementById('lineup-b') as HTMLDivElement

function populateCaptainSelect(el: HTMLSelectElement, defaultIndex: number): void {
  el.innerHTML = ''
  ARCHETYPES.forEach((archetype, index) => {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = `${archetype.name} - ${archetype.role}`
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
  forceAiDemo = false
  btn1p.classList.add('active')
  btn2p.classList.remove('active')
  btnAiDemo.classList.remove('active')
})

btn2p.addEventListener('click', () => {
  localTwoPlayer = true
  forceAiDemo = false
  btn2p.classList.add('active')
  btn1p.classList.remove('active')
  btnAiDemo.classList.remove('active')
  setTimeout(startGame, 80)
})

btnAiDemo.addEventListener('click', () => {
  localTwoPlayer = false
  forceAiDemo = true
  btnAiDemo.classList.add('active')
  btn1p.classList.remove('active')
  btn2p.classList.remove('active')
  setTimeout(startGame, 80)
})

window.addEventListener('keydown', (e) => {
  if (e.key === ' ' || e.key === 'Enter') {
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
  try {
    initAudio()
    startUnstoppableVuvuzela()
  } catch {
    // ignore audio init issues in automated environments
  }

  game = new Game(mountNode, {
    localTwoPlayer,
    teamASelection: Number(captainA.value),
    teamBSelection: Number(captainB.value),
    autoplay: qaMode || forceAiDemo,
    autoStartKickoff: autoBoot || forceAiDemo,
    matchConfig: fastMode
      ? {
          halfDuration: 12,
          overtimeDuration: 8,
          goalPause: 1.1,
          halftimePause: 1.2,
          kickoffPause: 0.8,
        }
      : undefined,
  })
  game.start()
}

btn1p.addEventListener('click', () => {
  setTimeout(startGame, 80)
})

window.addEventListener('beforeunload', () => {
  game?.destroy()
})

if (autoBoot) {
  startGame()
}
