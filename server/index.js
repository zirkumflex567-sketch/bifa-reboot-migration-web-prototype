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
const MIN_PLAYERS_TO_START = 2;
const MATCHMAKING_DELAY_MS = 2200;
let aiCounter = 0;

/**
 * PRODUCTION ECOSYSTEM STATE
 */
const rooms = {};
let matchmakingQueue = [];
let matchmakingStartTimer = null;

function maybeScheduleMatchStart() {
  if (matchmakingQueue.length < MIN_PLAYERS_TO_START) {
    if (matchmakingStartTimer) {
      clearTimeout(matchmakingStartTimer);
      matchmakingStartTimer = null;
    }
    return;
  }

  if (matchmakingStartTimer) return;

  matchmakingStartTimer = setTimeout(() => {
    matchmakingStartTimer = null;
    if (matchmakingQueue.length >= MIN_PLAYERS_TO_START) {
      startNewMatch();
    }
  }, MATCHMAKING_DELAY_MS);
}

function createAiPlayer(team, slotIndex) {
  aiCounter += 1;
  const z = (slotIndex % 4) * 8 - 12;
  return {
    id: `ai_${Date.now()}_${aiCounter}`,
    name: `AI_${aiCounter}`,
    team,
    captain: 0,
    x: team === 'A' ? -25 : 25,
    z,
    vx: 0,
    vz: 0,
    lastMoveX: team === 'A' ? 1 : -1,
    lastMoveY: 0,
    possessionLockUntil: 0,
    hasBall: false,
    isAI: true,
    input: { dash: false, pass: false, shoot: false }
  };
}

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
    maybeScheduleMatchStart();
  });

  socket.on('leave_queue', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: matchmakingQueue.length });
    maybeScheduleMatchStart();
  });

  // 3. Match Input
  socket.on('player_input', (data) => {
    const { roomId, moveX, moveY, sprint, dash, pass, shoot } = data;
    const room = rooms[roomId];
    if (!room) return;

    const player = room.players[socket.id];
    if (!player) return;

    const dashBoost = dash ? 1.65 : 1;
    const speed = (sprint ? 0.45 : 0.3) * dashBoost;
    player.vx = moveX * speed;
    player.vz = moveY * speed;
    player.lastMoveX = moveX;
    player.lastMoveY = moveY;
    player.input = { dash, pass, shoot };
  });

  socket.on('disconnect', () => {
    matchmakingQueue = matchmakingQueue.filter(p => p.socketId !== socket.id);
    io.emit('queue_update', { count: matchmakingQueue.length });
    maybeScheduleMatchStart();

    for (const roomId in rooms) {
      if (rooms[roomId].players[socket.id]) {
        const disconnectedPlayer = rooms[roomId].players[socket.id];
        delete rooms[roomId].players[socket.id];
        rooms[roomId].humanSocketIds = (rooms[roomId].humanSocketIds || []).filter((id) => id !== socket.id);
        const replacement = createAiPlayer(disconnectedPlayer.team, Object.keys(rooms[roomId].players).length);
        rooms[roomId].players[replacement.id] = replacement;
        for (const humanId of rooms[roomId].humanSocketIds || []) {
          io.to(humanId).emit('player_left', socket.id);
        }
      }
    }
  });
});

/**
 * INITIALIZE 4v4 MATCH
 */
function startNewMatch() {
  const roomId = nanoid(10);
  const humanCount = Math.min(PLAYERS_PER_MATCH, matchmakingQueue.length);
  const matchPlayers = matchmakingQueue.splice(0, humanCount);
  
  rooms[roomId] = {
    id: roomId,
    humanSocketIds: [],
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
    room.humanSocketIds.push(p.socketId);
    room.players[p.socketId] = {
      id: p.socketId,
      name: p.name,
      team: team,
      captain: p.captain,
      x: team === 'A' ? -25 : 25,
      z: (idx % 4) * 8 - 12,
      vx: 0, vz: 0,
      lastMoveX: team === 'A' ? 1 : -1,
      lastMoveY: 0,
      possessionLockUntil: 0,
      hasBall: false
    };

  });

  // Fill roster with AI to always run 4v4.
  while (Object.keys(rooms[roomId].players).length < PLAYERS_PER_MATCH) {
    const slot = Object.keys(rooms[roomId].players).length;
    const team = slot < PLAYERS_PER_MATCH / 2 ? 'A' : 'B';
    const aiPlayer = createAiPlayer(team, slot);
    rooms[roomId].players[aiPlayer.id] = aiPlayer;
  }

  // Notify clients only after the full room roster is assembled.
  matchPlayers.forEach((p, idx) => {
    const team = idx < 4 ? 'A' : 'B';
    io.to(p.socketId).emit('match_found', {
      roomId,
      team,
      players: rooms[roomId].players
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
    let currentHolderId = Object.keys(room.players).find((pid) => room.players[pid].hasBall) || null;
    for (const id in room.players) {
      const p = room.players[id];

      if (p.isAI) {
        const targetX = room.ball.x - p.x;
        const targetZ = room.ball.z - p.z;
        const targetLen = Math.hypot(targetX, targetZ) || 1;
        const aiSpeed = 0.26;
        p.vx = (targetX / targetLen) * aiSpeed;
        p.vz = (targetZ / targetLen) * aiSpeed;
        const shootChance = p.hasBall ? 0.045 : 0;
        const passChance = p.hasBall ? 0.03 : 0;
        p.input = {
          dash: false,
          pass: Math.random() < passChance,
          shoot: Math.random() < shootChance
        };
      }

      p.x += p.vx;
      p.z += p.vz;
      
      const dist = Math.sqrt((p.x - room.ball.x)**2 + (p.z - room.ball.z)**2);
      if (dist < 1.6 && !p.hasBall) {
        if (currentHolderId) {
          const holder = room.players[currentHolderId];
          if (holder && holder.possessionLockUntil > Date.now()) {
            continue;
          }
        }
        for (const pid in room.players) room.players[pid].hasBall = false;
        p.hasBall = true;
        p.possessionLockUntil = Date.now() + 320;
        currentHolderId = id;
      }

      if (p.hasBall) {
        room.ball.x = p.x + (p.vx * 1.5);
        room.ball.z = p.z + (p.vz * 1.5);

        const dirXRaw = Math.abs(p.vx) + Math.abs(p.vz) > 0.001 ? p.vx : (p.lastMoveX ?? 0);
        const dirZRaw = Math.abs(p.vx) + Math.abs(p.vz) > 0.001 ? p.vz : (p.lastMoveY ?? 0);
        const dirLen = Math.hypot(dirXRaw, dirZRaw) || 1;
        const dirX = dirXRaw / dirLen;
        const dirZ = dirZRaw / dirLen;

        if (p.input?.shoot) {
          p.hasBall = false;
          p.possessionLockUntil = 0;
          room.ball.vx = dirX * 12;
          room.ball.vz = dirZ * 12;
        } else if (p.input?.pass) {
          p.hasBall = false;
          p.possessionLockUntil = 0;
          room.ball.vx = dirX * 7.5;
          room.ball.vz = dirZ * 7.5;
        }
      }

      if (p.input) {
        p.input.pass = false;
        p.input.shoot = false;
      }
    }

    const statePayload = {
      players: room.players,
      ball: room.ball,
      score: room.score,
      phase: room.phase
    };

    for (const playerSocketId of room.humanSocketIds || []) {
      io.to(playerSocketId).emit('match_state', statePayload);
    }
  }
}, TICK_RATE);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`REDLINE FC MAINSERVER RUNNING ON PORT ${PORT}`);
});
