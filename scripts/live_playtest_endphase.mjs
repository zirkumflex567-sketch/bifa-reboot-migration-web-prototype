import path from 'node:path'
import { chromium } from 'playwright'

const baseUrl = 'http://127.0.0.1:4173'
const outDir = path.resolve('artifacts/live-playtest-2026-04-18')
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function run() {
  const browser = await chromium.launch({ headless: false, slowMo: 80 })
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } })

  await page.goto(`${baseUrl}/?qa=1`, { waitUntil: 'networkidle' })
  await wait(1500)
  await page.screenshot({ path: path.join(outDir, '10a_qa_start.png'), fullPage: true })

  // Fast-mode full run window
  await wait(50000)

  if (page.isClosed()) {
    console.log('Page closed before end-state capture.')
    await browser.close()
    return
  }

  await page.screenshot({ path: path.join(outDir, '10b_qa_endstate.png'), fullPage: true })
  const timer = await page.locator('#timer').textContent().catch(() => null)
  const scoreA = await page.locator('#score-a').textContent().catch(() => null)
  const scoreB = await page.locator('#score-b').textContent().catch(() => null)
  const overlayText = await page.locator('#overlay-start').innerText().catch(() => '')
  console.log(JSON.stringify({ timer, scoreA, scoreB, overlayText }, null, 2))

  await wait(1500)
  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
