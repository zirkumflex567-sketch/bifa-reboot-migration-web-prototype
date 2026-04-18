const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { nanoid } = require('nanoid');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

const TICKS_PER_SECOND = 20;
const TICK_RATE = 1000 / TICKS_PER_SECOND;
const PLAYERS_PER_MATCH = 8; // 4v4

/**
 * PRODUCTION ECOSYSTEM STATE
 */
const rooms = {};
let matchmakingQueue = [];

io.on('connection', (socket) => {
  console.log('User Connected:', socket.id);

  // 1. Leaderboard Request
  socket.on('fetch_leaderboard', async () => {
    try {
      const top = await db.getTopPlayers(10);
      socket.emit('leaderboard_data', top);
    } catch (err) {
      console.error('DB Error:', err);
    }
  });

  // 2. Matchmaking Queue
  socket.on('enter_queue', async (data) => {
    const { playerName, captainIndex } = data;
    
    // Check if already in queue
    if (matchmakingQueue.find(p => p.socketId === socket.id)) return;

    matchmakingQueue.push({
      socketId: socket.id,
      name: playerName,
      captain: captainIndex
    });

    console.log(`Queue updated: ${matchmakingQueue.length} players searching...`);
    io.emit('queue_update', { count: matchmakingQueue.length });

    if (matchmakingQueue.length >= PLAYERS_PER_MATCH) {
      startNewMatch();
    }
  });

  socket.on('leave_queue', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: matchmakingQueue.length });
  });

  // 3. Match Input
  socket.on('player_input', (data) => {
    const { roomId, moveX, moveY, sprint, dash, pass, shoot } = data;
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    const speed = sprint ? 0.45 : 0.3;
    player.vx = moveX * speed;
    player.vz = moveY * speed;
    player.input = { dash, pass, shoot };
  });

  socket.on('disconnect', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: matchmakingQueue.length });

    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        io.to(roomId).emit('player_left', socket.id);
      }
    }
  });
});

/**
 * INITIALIZE 4v4 MATCH
 */
function startNewMatch() {
  const roomId = nanoid(10);
  const matchPlayers = matchmakingQueue.splice(0, PLAYERS_PER_MATCH);
  
  rooms[roomId] = {
    id: roomId,
    players: {},
    ball: { x: 0, z: 0, vx: 0, vz: 0 },
    score: { a: 0, b: 0 },
    phase: 'InPlay'
  };

  matchPlayers.forEach((p, idx) => {
    const team = idx < 4 ? 'A' : 'B';
    const room = rooms[roomId];
    const playerSocket = io.sockets.sockets.get(p.socketId);
    if (playerSocket) {
      playerSocket.join(roomId);
    }
    room.players[p.socketId] = {
      id: p.socketId,
      name: p.name,
      team: team,
      captain: p.captain,
      x: team === 'A' ? -25 : 25,
      z: (idx % 4) * 8 - 12,
      vx: 0, vz: 0,
      hasBall: false
    };

    // Notify client to start local game
    io.to(p.socketId).emit('match_found', {
      roomId,
      team,
      players: room.players
    });
  });

  console.log(`NEW 4v4 MATCH STARTED: Room ${roomId}`);
}

/**
 * AUTHORITATIVE LOOP
 */
setInterval(() => {
  for (const roomId in rooms) {
    const room = rooms[roomId];
    if (Object.keys(room.players).length === 0) {
      delete rooms[roomId]; continue;
    }

    // Ball Physics
    room.ball.x += room.ball.vx;
    room.ball.z += room.ball.vz;
    room.ball.vx *= 0.94;
    room.ball.vz *= 0.94;

    // Boundary check / Goal check
    if (Math.abs(room.ball.x) > 50) {
       if (room.ball.x > 0) room.score.a++; else room.score.b++;
       room.ball.x = 0; room.ball.z = 0; room.ball.vx = 0; room.ball.vz = 0;
    }

    // Player Physics
    for (const id in room.players) {
      const p = room.players[id];
      p.x += p.vx;
      p.z += p.vz;
      
      const dist = Math.sqrt((p.x - room.ball.x)**2 + (p.z - room.ball.z)**2);
      if (dist < 1.6 && !p.hasBall) {
        for (const pid in room.players) room.players[pid].hasBall = false;
        p.hasBall = true;
      }

      if (p.hasBall) {
        room.ball.x = p.x + (p.vx * 1.5);
        room.ball.z = p.z + (p.vz * 1.5);
        if (p.input?.shoot) {
          p.hasBall = false;
          room.ball.vx = p.vx * 12;
          room.ball.vz = p.vz * 12;
        }
      }
    }

    const statePayload = {
      players: room.players,
      ball: room.ball,
      score: room.score,
      phase: room.phase
    };

    for (const playerSocketId in room.players) {
      io.to(playerSocketId).emit('match_state', statePayload);
    }
  }
}, TICK_RATE);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`REDLINE FC MAINSERVER RUNNING ON PORT ${PORT}`);
});
