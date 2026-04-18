import './style.css'
import { ARCHETYPES } from './config/archetypes'
import { Game } from './game/Game'
import { initAudio } from './audio/SFX'

const mountNode = document.querySelector<HTMLElement>('#game-root')!
const overlay = document.getElementById('overlay-start')!
const btnStart = document.getElementById('btn-start')!
const btnResultsContinue = document.getElementById('btn-results-continue')!
const btn1p = document.getElementById('btn-1p')!
const btn2p = document.getElementById('btn-2p')!
const btn1pAlt = document.getElementById('btn-1p-alt')
const btn2pAlt = document.getElementById('btn-2p-alt')
const btnAiDemo = document.getElementById('btn-ai-demo')!
const btnMatchmaking = document.getElementById('btn-matchmaking')!
const btnLocal4p = document.getElementById('btn-local-4p')! // New button
const btnViewLeaderboard = document.getElementById('btn-view-leaderboard')!
const btnCloseLeaderboard = document.getElementById('btn-close-leaderboard')!
const btnCancelQueue = document.getElementById('btn-cancel-queue')!
const inputServer = document.getElementById('input-server') as HTMLInputElement
inputServer.value = window.location.host
const inputPlayerName = document.getElementById('input-player-name') as HTMLInputElement
const overlaySearching = document.getElementById('overlay-searching')!
const overlayLeaderboard = document.getElementById('overlay-leaderboard')!
const queueStatus = document.getElementById('queue-status')!
const leaderboardList = document.getElementById('leaderboard-list')!
const scrollA = document.getElementById('captain-scroll-a')!
const infoA = document.getElementById('captain-info-a')!

let selectedCaptainA = 0
let selectedCaptainB = Math.floor(Math.random() * 12)
let localTwoPlayer = false
let localFourPlayer = false // New
let forceAiDemo = false
let gameStarted = false

function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

function setTouchHudVisibility(visible: boolean): void {
  const touchHud = document.getElementById('mobile-touch-controls')
  if (!touchHud) return
  if (visible) touchHud.classList.remove('hidden')
  else touchHud.classList.add('hidden')
}

function resolveServerUrl(raw: string): string {
  const value = raw.trim()
  if (!value) return window.location.origin
  if (value.startsWith('http://') || value.startsWith('https://')) return value
  return `${window.location.protocol}//${value}`
}

function initMenu(): void {
  // Populate Gallery
  scrollA.innerHTML = ''
  ARCHETYPES.forEach((arch, idx) => {
    const card = document.createElement('div')
    card.className = `captain-card ${idx === selectedCaptainA ? 'active' : ''}`
    card.innerHTML = `
      <div class="card-portrait" style="background-image: url('${arch.image}')"></div>
      <div class="card-info">
        <strong>${arch.name.toUpperCase()}</strong>
        <small>${arch.role}</small>
      </div>
    `
    card.onclick = () => selectCaptain(idx)
    scrollA.appendChild(card)
  })
  
  updateCaptainInfo(selectedCaptainA)
}

function selectCaptain(index: number): void {
  selectedCaptainA = index
  const cards = scrollA.querySelectorAll('.captain-card')
  cards.forEach((c, i) => {
    if (i === index) c.classList.add('active')
    else c.classList.remove('active')
  })
  updateCaptainInfo(index)
}

function updateCaptainInfo(index: number): void {
  const arch = ARCHETYPES[index]
  infoA.innerHTML = `
    <div class="stat-row">
      <span>SPEED</span>
      <div class="stat-bar"><div class="stat-fill" style="width: ${arch.spd * 10}%"></div></div>
    </div>
    <div class="stat-row">
      <span>POWER</span>
      <div class="stat-bar"><div class="stat-fill" style="width: ${arch.tpow * 10}%"></div></div>
    </div>
    <p class="special-desc">${arch.spDesc.toUpperCase()}</p>
  `
}

function setModeButtonState(activeIds: string[]): void {
  const modeButtons = [btn1p, btn2p, btn1pAlt, btn2pAlt, btnLocal4p, btnAiDemo].filter(Boolean) as HTMLElement[]
  modeButtons.forEach((button) => {
    if (activeIds.includes(button.id)) button.classList.add('active')
    else button.classList.remove('active')
  })
}

// Mode Selection
btn1p.onclick = () => {
  localTwoPlayer = false; localFourPlayer = false; forceAiDemo = false
  setModeButtonState(['btn-1p', 'btn-1p-alt'])
}
btn2p.onclick = () => {
  localTwoPlayer = true; localFourPlayer = false; forceAiDemo = false
  setModeButtonState(['btn-2p', 'btn-2p-alt'])
}
btnLocal4p.onclick = () => {
  localTwoPlayer = true; localFourPlayer = true; forceAiDemo = false
  setModeButtonState(['btn-local-4p'])
}
btnAiDemo.onclick = () => {
  localTwoPlayer = false; localFourPlayer = false; forceAiDemo = true
  setModeButtonState(['btn-ai-demo'])
}

if (btn1pAlt) btn1pAlt.onclick = () => btn1p.click()
if (btn2pAlt) btn2pAlt.onclick = () => btn2p.click()

function startGame(): void {
  if (gameStarted) return
  gameStarted = true
  overlay.classList.add('hidden')
  
  try { initAudio() } catch {}
  setTouchHudVisibility(isTouchDevice())

  const game = new Game(mountNode, {
    localTwoPlayer,
    localFourPlayer,
    teamASelection: selectedCaptainA,
    teamBSelection: selectedCaptainB,
    autoplay: forceAiDemo,
    autoStartKickoff: forceAiDemo,
  })

  // Hook Touch Buttons for Mobile
  const hookBtn = (id: string, action: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.ontouchstart = () => game.input.virtual.triggerButton(action, true)
      el.ontouchend   = () => game.input.virtual.triggerButton(action, false)
    }
  }
  hookBtn('touch-pass', 'pass')
  hookBtn('touch-shoot', 'shoot')
  hookBtn('touch-dash', 'dash')
  hookBtn('touch-special', 'special')

  game.start()
}

btnStart.onclick = startGame
btnResultsContinue.onclick = () => window.location.reload()

/**
 * PRODUCTION MATCHMAKING FLOW
 */
let sharedGame: Game | null = null

btnMatchmaking.onclick = () => {
  const serverUrl = resolveServerUrl(inputServer.value)
  const playerName = inputPlayerName.value || 'UNNAMED_PILOT'
  
  if (!sharedGame) {
    sharedGame = new Game(mountNode, {
      teamASelection: selectedCaptainA,
      matchConfig: { halfDuration: 90 } // Shorter online matches
    })
  }

  sharedGame.network.connect(serverUrl)
  
  // Setup Hooks
  sharedGame.network.onQueueUpdate = (data) => {
    queueStatus.innerText = `${data.count} / 8 PILOTS FOUND`
  }

  sharedGame.network.onMatchFound = () => {
    overlaySearching.classList.add('hidden')
    overlay.classList.add('hidden')
    gameStarted = true
    try { initAudio() } catch {}
    setTouchHudVisibility(isTouchDevice())
    sharedGame?.start()
  }

  // Wait for connection to emit queue entry
  setTimeout(() => {
    sharedGame?.network.enterQueue(playerName, selectedCaptainA)
    overlaySearching.classList.remove('hidden')
  }, 1000)
}

btnCancelQueue.onclick = () => {
  sharedGame?.network.leaveQueue()
  overlaySearching.classList.add('hidden')
}

btnLocal4p.onclick = () => {
  if (gameStarted) return
  gameStarted = true
  overlay.classList.add('hidden')
  try { initAudio() } catch {}
  setTouchHudVisibility(isTouchDevice())
  
  const game = new Game(mountNode, {
    localFourPlayer: true,
    teamASelection: selectedCaptainA,
    teamBSelection: selectedCaptainB
  })
  
  // Hook Touch Buttons
  document.getElementById('touch-pass')!.ontouchstart = () => game.input.virtual.triggerButton('pass', true)
  document.getElementById('touch-pass')!.ontouchend   = () => game.input.virtual.triggerButton('pass', false)
  document.getElementById('touch-shoot')!.ontouchstart = () => game.input.virtual.triggerButton('shoot', true)
  document.getElementById('touch-shoot')!.ontouchend   = () => game.input.virtual.triggerButton('shoot', false)
  document.getElementById('touch-dash')!.ontouchstart = () => game.input.virtual.triggerButton('dash', true)
  document.getElementById('touch-dash')!.ontouchend   = () => game.input.virtual.triggerButton('dash', false)
  document.getElementById('touch-special')!.ontouchstart = () => game.input.virtual.triggerButton('special', true)
  document.getElementById('touch-special')!.ontouchend   = () => game.input.virtual.triggerButton('special', false)

  game.start()
}

btnViewLeaderboard.onclick = () => {
  const serverUrl = resolveServerUrl(inputServer.value)
  if (!sharedGame) {
    sharedGame = new Game(mountNode, {})
    sharedGame.network.connect(serverUrl)
  }
  
  sharedGame.network.onLeaderboardData = (data: any[]) => {
    leaderboardList.innerHTML = data.map((p, idx) => `
      <div class="leaderboard-row">
        <div class="rank">#${idx + 1}</div>
        <div class="name">${p.name}</div>
        <div class="elo">${p.elo} PT</div>
      </div>
    `).join('')
    overlayLeaderboard.classList.remove('hidden')
  }
  
  sharedGame.network.fetchLeaderboard()
}

btnCloseLeaderboard.onclick = () => {
  overlayLeaderboard.classList.add('hidden')
}

window.addEventListener('keydown', (e) => {
  if ((e.key === ' ' || e.key === 'Enter') && !gameStarted) {
    e.preventDefault(); startGame()
  }
})

initMenu()
