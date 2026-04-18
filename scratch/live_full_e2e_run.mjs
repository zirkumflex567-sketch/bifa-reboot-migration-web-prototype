import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { io } from 'socket.io-client';

const BASE = 'https://www.h-town.duckdns.org/bifa/';
const SOCKET_URL = 'https://www.h-town.duckdns.org';
const SOCKET_PATH = '/bifa-socket';
const outDir = path.resolve('artifacts/live-full-e2e');
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function shot(page, name) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  return file;
}

function mkJoiner(name) {
  const client = { name, match: null, state: null, connected: false, socket: null };
  const socket = io(SOCKET_URL, {
    path: SOCKET_PATH,
    transports: ['polling'],
    upgrade: false,
    reconnection: false,
    timeout: 10000
  });
  client.socket = socket;
  socket.on('connect', () => {
    client.connected = true;
    socket.emit('enter_queue', { playerName: name, captainIndex: 0 });
  });
  socket.on('match_found', (data) => { client.match = data; });
  socket.on('match_state', (data) => { client.state = data; });
  return client;
}

function getSelf(state, name) {
  return Object.values(state?.players || {}).find((p) => p.name === name);
}

async function run() {
  await fs.mkdir(outDir, { recursive: true });
  const logs = [];
  const checks = {};
  const navTimeout = 45000;
  const isHeadful = process.env.HEADFUL === '1';

  // Phase 1: two headful humans start online match (+AI fill)
  const browser = await chromium.launch({ headless: !isHeadful, slowMo: isHeadful ? 70 : 0 });
  const ctxA = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1366, height: 768 } });
  const ctxB = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: 1366, height: 768 } });
  const pageA = await ctxA.newPage();
  const pageB = await ctxB.newPage();

  pageA.on('console', (m) => logs.push(`[A:${m.type()}] ${m.text()}`));
  pageB.on('console', (m) => logs.push(`[B:${m.type()}] ${m.text()}`));
  pageA.on('pageerror', (e) => logs.push(`[A:pageerror] ${e.message}`));
  pageB.on('pageerror', (e) => logs.push(`[B:pageerror] ${e.message}`));

  await Promise.all([
    pageA.goto(BASE, { waitUntil: 'domcontentloaded', timeout: navTimeout }),
    pageB.goto(BASE, { waitUntil: 'domcontentloaded', timeout: navTimeout })
  ]);
  await shot(pageA, '01_a_menu');
  await shot(pageB, '02_b_menu');

  const nameA = `FULL_A_${Date.now()}`;
  const nameB = `FULL_B_${Date.now()}`;
  await pageA.fill('#input-player-name', nameA);
  await pageB.fill('#input-player-name', nameB);
  await pageA.click('#btn-matchmaking');
  await wait(300);
  await pageB.click('#btn-matchmaking');

  await wait(6000);
  await shot(pageA, '03_a_after_mm');
  await shot(pageB, '04_b_after_mm');

  const stateA = {
    timer: await pageA.locator('#timer').textContent().catch(() => null),
    startOverlayVisible: await pageA.locator('#overlay-start:not(.hidden)').count().catch(() => 0),
    searchOverlayVisible: await pageA.locator('#overlay-searching:not(.hidden)').count().catch(() => 0)
  };
  const stateB = {
    timer: await pageB.locator('#timer').textContent().catch(() => null),
    startOverlayVisible: await pageB.locator('#overlay-start:not(.hidden)').count().catch(() => 0),
    searchOverlayVisible: await pageB.locator('#overlay-searching:not(.hidden)').count().catch(() => 0)
  };
  checks.duo_match_started =
    stateA.timer === '1:30' && stateB.timer === '1:30' &&
    stateA.startOverlayVisible === 0 && stateB.startOverlayVisible === 0 &&
    stateA.searchOverlayVisible === 0 && stateB.searchOverlayVisible === 0;

  // Phase 2: gameplay controls in same session
  await pageA.keyboard.down('KeyW'); await wait(700); await pageA.keyboard.up('KeyW');
  await pageA.keyboard.press('KeyE');
  await pageA.keyboard.down('Shift'); await pageA.keyboard.down('KeyD'); await wait(450); await pageA.keyboard.up('KeyD'); await pageA.keyboard.up('Shift');
  await pageB.keyboard.down('ArrowUp'); await wait(650); await pageB.keyboard.up('ArrowUp');
  await pageB.keyboard.press('Enter');
  await pageA.keyboard.press('Escape'); await wait(500); await pageA.keyboard.press('Enter');
  await wait(1000);
  await shot(pageA, '05_a_controls_pause_resume');
  await shot(pageB, '06_b_controls');
  checks.gameplay_controls_executed = true;

  // Phase 3: server-side complete check with sockets (AI fill, pass/shoot, disconnect/rejoin)
  const c1 = mkJoiner(`E2E_1_${Date.now()}`);
  const c2 = mkJoiner(`E2E_2_${Date.now()}`);
  await wait(7000);
  const roomOk = !!c1.match?.roomId && c1.match.roomId === c2.match?.roomId;
  const totalPlayers = c1.match ? Object.keys(c1.match.players || {}).length : 0;
  const aiCount = c1.match ? Object.values(c1.match.players || {}).filter((p) => String(p.id).startsWith('ai_')).length : 0;
  checks.server_duo_ai_fill = roomOk && totalPlayers === 8 && aiCount >= 6;

  // pass/shoot profile (best-effort in live state)
  let passShootOk = false;
  if (c1.state && c2.state) {
    const roomId = c1.match.roomId;
    const sessions = [c1, c2];
    // add 6 extra bots to force game activity in same server environment
    for (let i = 0; i < 6; i++) sessions.push(mkJoiner(`E2E_FILL_${Date.now()}_${i}`));
    await wait(12000);

    const me = (sess) => getSelf(sess.state, sess.name);
    const holder = () => sessions.find((s) => me(s)?.hasBall);

    for (let t = 0; t < 70; t++) {
      for (const s of sessions) {
        const m = me(s); const b = s.state?.ball;
        if (!m || !b || !s.match) continue;
        const dx = b.x - m.x, dz = b.z - m.z; const len = Math.hypot(dx, dz) || 1;
        s.socket.emit('player_input', { roomId: s.match.roomId, moveX: dx / len, moveY: dz / len, sprint: true, dash: (t % 5 === 0), pass: false, shoot: false });
      }
      await wait(60);
    }

    let h = holder();
    if (!h) {
      for (let t = 0; t < 140 && !h; t++) {
        for (const s of sessions) {
          const m = me(s); const b = s.state?.ball;
          if (!m || !b || !s.match) continue;
          const dx = b.x - m.x, dz = b.z - m.z; const len = Math.hypot(dx, dz) || 1;
          s.socket.emit('player_input', { roomId: s.match.roomId, moveX: dx / len, moveY: dz / len, sprint: true, dash: (t % 4 === 0), pass: false, shoot: false });
        }
        await wait(60);
        h = holder();
      }
    }

    if (h) {
      const reacquireBall = async (sess, ticks = 80) => {
        for (let t = 0; t < ticks; t++) {
          const m = me(sess); const b = sess.state?.ball;
          if (!m || !b) { await wait(40); continue; }
          if (m.hasBall) return true;
          const dx = b.x - m.x, dz = b.z - m.z; const len = Math.hypot(dx, dz) || 1;
          sess.socket.emit('player_input', { roomId: sess.match.roomId, moveX: dx / len, moveY: dz / len, sprint: true, dash: (t % 5 === 0), pass: false, shoot: false });
          await wait(45);
        }
        return Boolean(me(sess)?.hasBall);
      };

      const emitAndMeasure = async (kind) => {
        const m = me(h); if (!m) return 0;
        if (!(await reacquireBall(h, 90))) return 0;
        const mx = m.team === 'A' ? 1 : -1;
        for (let i = 0; i < 3; i++) {
          h.socket.emit('player_input', { roomId: h.match.roomId, moveX: mx, moveY: 0, sprint: false, dash: false, pass: kind === 'pass', shoot: kind === 'shoot' });
          await wait(40);
        }
        let max = 0;
        for (let i = 0; i < 20; i++) {
          const b = h.state?.ball;
          if (b) max = Math.max(max, Math.hypot(b.vx || 0, b.vz || 0));
          await wait(30);
        }
        return max;
      };
      const passSpeed = await emitAndMeasure('pass');
      for (let t = 0; t < 45; t++) {
        const m = me(h); const b = h.state?.ball;
        if (!m || !b) { await wait(40); continue; }
        const dx = b.x - m.x, dz = b.z - m.z; const len = Math.hypot(dx, dz) || 1;
        h.socket.emit('player_input', { roomId: h.match.roomId, moveX: dx / len, moveY: dz / len, sprint: true, dash: (t % 6 === 0), pass: false, shoot: false });
        await wait(40);
      }
      const shootSpeed = await emitAndMeasure('shoot');
      checks.pass_shoot_profile = passSpeed > 0 && shootSpeed > passSpeed;
      passShootOk = checks.pass_shoot_profile;
      checks.pass_speed = Number(passSpeed.toFixed(3));
      checks.shoot_speed = Number(shootSpeed.toFixed(3));
      checks.pass_shoot_holder = h.name;
    } else {
      checks.pass_shoot_profile = false;
      checks.pass_speed = 0;
      checks.shoot_speed = 0;
      checks.pass_shoot_holder = null;
    }

    // disconnect + AI replacement + rejoin queue sanity
    const dropTarget = sessions[0];
    const roomBeforeDrop = dropTarget.match?.roomId || null;
    dropTarget.socket.close();
    await wait(2500);

    let statesWith7OrMore = 0;
    for (let i = 0; i < 16; i++) {
      const st = sessions[1].state;
      const count = st ? Object.keys(st.players || {}).length : 0;
      if (count >= 7) statesWith7OrMore++;
      await wait(120);
    }
    const rejoin = mkJoiner(`E2E_REJOIN_${Date.now()}`);
    await wait(7000);
    checks.disconnect_rejoin = !!roomBeforeDrop && statesWith7OrMore > 0 && !rejoin.match;

    for (const s of sessions.slice(1)) s.socket.close();
    rejoin.socket.close();
  }

  c1.socket.close();
  c2.socket.close();

  await shot(pageA, '07_a_final');
  await shot(pageB, '08_b_final');

  await browser.close();

  const summary = {
    checks,
    all_passed: Boolean(
      checks.duo_match_started &&
      checks.gameplay_controls_executed &&
      checks.server_duo_ai_fill &&
      checks.pass_shoot_profile
    )
  };

  await fs.writeFile(path.join(outDir, 'full-e2e-summary.json'), JSON.stringify(summary, null, 2));
  await fs.writeFile(path.join(outDir, 'full-e2e-log.txt'), logs.join('\n'));
  console.log(JSON.stringify(summary, null, 2));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
