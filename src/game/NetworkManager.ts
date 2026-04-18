import { io, Socket } from 'socket.io-client'

export interface NetworkPlayer {
  id: string
  name: string
  team: 'A' | 'B'
  x: number
  z: number
  vx: number
  vz: number
  hasBall: boolean
}

export interface NetworkState {
  players: Record<string, NetworkPlayer>
  ball: { x: number, z: number, vx: number, vz: number }
  score: { a: number, b: number }
  phase: string
}

export class NetworkManager {
  socket: Socket | null = null
  roomId: string = ''
  isConnecting = false
  isConnected = false
  
  onMatchFound: ((data: any) => void) | null = null
  onQueueUpdate: ((data: any) => void) | null = null
  onLeaderboardData: ((data: any) => void) | null = null

  // Current authoritative state from server
  state: NetworkState | null = null

  connect(url: string): void {
    if (this.socket) this.socket.disconnect()

    this.isConnecting = true
    const target = new URL(url, window.location.origin)
    const isSameHost = target.host === window.location.host
    const socketPath = isSameHost ? '/bifa-socket' : '/socket.io'

    this.socket = io(target.origin, {
      path: socketPath,
      transports: ['polling'],
      upgrade: false
    })

    this.socket.on('connect', () => {
      this.isConnected = true
      this.isConnecting = false
      console.log('Mainserver Connection Established:', this.socket?.id)
    })

    this.socket.on('match_found', (data: any) => {
      this.roomId = data.roomId
      if (this.onMatchFound) this.onMatchFound(data)
    })

    this.socket.on('queue_update', (data: any) => {
      if (this.onQueueUpdate) this.onQueueUpdate(data)
    })

    this.socket.on('leaderboard_data', (data: any) => {
      if (this.onLeaderboardData) this.onLeaderboardData(data)
    })

    this.socket.on('match_state', (newState: NetworkState) => {
      this.state = newState
    })

    this.socket.on('disconnect', () => {
      this.isConnected = false
    })
  }

  enterQueue(playerName: string, captainIndex: number): void {
    this.socket?.emit('enter_queue', { playerName, captainIndex })
  }

  leaveQueue(): void {
    this.socket?.emit('leave_queue')
  }

  fetchLeaderboard(): void {
    this.socket?.emit('fetch_leaderboard')
  }

  sendInput(input: any): void {
    if (this.socket && this.isConnected && this.roomId) {
      this.socket.emit('player_input', {
        roomId: this.roomId,
        ...input
      })
    }
  }
}
