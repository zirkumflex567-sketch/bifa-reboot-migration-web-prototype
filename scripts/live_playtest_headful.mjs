import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = 'http://127.0.0.1:4173'
const outDir = path.resolve('artifacts/live-playtest-2026-04-18')

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function ensureDir() {
  await fs.mkdir(outDir, { recursive: true })
}

async function shot(page, name) {
  const target = path.join(outDir, `${name}.png`)
  await page.screenshot({ path: target, fullPage: true })
  console.log(`screenshot: ${target}`)
}

async function pulseMovement(page, ms = 1200) {
  await page.keyboard.down('Shift')
  await page.keyboard.down('KeyW')
  await wait(ms)
  await page.keyboard.up('KeyW')
  await page.keyboard.press('KeyD')
  await page.keyboard.press('Control')
  await page.keyboard.press('Space')
  await page.keyboard.press('KeyE')
  await page.keyboard.press('KeyQ')
  await page.keyboard.press('Tab')
  await page.keyboard.up('Shift')
}

async function run() {
  await ensureDir()
  const browser = await chromium.launch({ headless: false, slowMo: 120 })
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } })
  const page = await context.newPage()

  // Pass 1: Menu + interactive controls + pause menu
  await page.goto(`${baseUrl}/?fast=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await shot(page, '01_setup_screen')

  await page.selectOption('#captain-a', { index: 2 })
  await page.selectOption('#captain-b', { index: 5 })
  await page.waitForTimeout(500)
  await shot(page, '02_captain_lineup_changed')

  await page.click('#btn-1p')
  await page.waitForTimeout(2000)
  await shot(page, '03_match_started_hud')

  for (let i = 0; i < 5; i += 1) {
    await pulseMovement(page, 900)
    await page.waitForTimeout(400)
  }
  await shot(page, '04_inplay_controls_exercised')

  await page.keyboard.press('Escape')
  await page.waitForTimeout(900)
  await shot(page, '05_pause_menu')

  await page.keyboard.press('Enter') // resume
  await page.waitForTimeout(900)
  await shot(page, '06_resumed_after_pause')

  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter') // restart
  await page.waitForTimeout(1200)
  await shot(page, '07_restart_from_pause')

  await page.keyboard.press('Escape')
  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('ArrowDown')
  await page.keyboard.press('Enter') // back to setup
  await page.waitForTimeout(1200)
  await shot(page, '08_back_to_setup')

  // Pass 2: full match flow in QA autoplay mode
  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1200)
  await shot(page, '09_qa_autoboot')

  // Let full fast match run (half=12s, OT=8s). 70s is enough for most outcomes.
  await page.waitForTimeout(70000)
  await shot(page, '10_full_match_end_state')

  const timer = await page.locator('#timer').textContent()
  const scoreA = await page.locator('#score-a').textContent()
  const scoreB = await page.locator('#score-b').textContent()
  const overlayText = await page.locator('#overlay-start').innerText().catch(() => '')
  console.log(JSON.stringify({ timer, scoreA, scoreB, overlayText }, null, 2))

  await page.waitForTimeout(2000)
  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
