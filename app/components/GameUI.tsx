"use client"

import HUD from "./HUD"
import Overlays from "./Overlays"
import Hub from "./Hub"

export default function GameUI() {
  return (
    <>
      <HUD />
      <Hub />
      <Overlays />
    </>
  )
}
