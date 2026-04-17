import './style.css'
import { Game } from './game/Game'

/* ═══════════════════════════════════════════════════════════════
   Entry point — handles mode selection then boots the Game
   ═══════════════════════════════════════════════════════════════ */

const mountNode = document.querySelector<HTMLElement>('#game-root')!

// ── Mode selection ──
let localTwoPlayer = false

const btn1p = document.getElementById('btn-1p')!
const btn2p = document.getElementById('btn-2p')!

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
  game = new Game(mountNode, { localTwoPlayer })
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
