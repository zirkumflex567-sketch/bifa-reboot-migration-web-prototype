import './style.css'
import { Game } from './game/Game'

const mountNode = document.querySelector<HTMLElement>('#game-root')

if (!mountNode) {
  throw new Error('Game root element #game-root not found.')
}

const game = new Game(mountNode)
game.start()

window.addEventListener('beforeunload', () => {
  game.destroy()
})
