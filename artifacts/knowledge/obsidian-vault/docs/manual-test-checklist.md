# REDLINE FC Web — Manuelle Test-Checkliste

Stand: 2026-04-17

## A) Smoke / Start
1. Seite laden -> Startscreen sichtbar.
2. 1P anklicken -> Match startet.
3. 2P anklicken -> Match startet.
4. Keine JS-Errors in Browser-Console beim Start.

## B) Core Controls (P1)
1. WASD Bewegung in alle Richtungen.
2. Shift Sprint spürbar schneller als normal.
3. Ctrl Dash triggert Kurz-Burst.
4. Space Pass funktioniert mit Ballbesitz.
5. E Shoot funktioniert mit Ballbesitz.
6. Q Tackle triggert Animation/Interaktion.

## C) Solo-Teamkontrolle (1P)
1. Tab wechselt kontrollierten blauen Spieler zyklisch.
2. Kontrollring folgt dem aktuell gesteuerten Spieler.
3. Bei Ballgewinn im eigenen Team folgt die Kontrolle dem Ballträger (Auto-Follow).
4. AI übernimmt den aktuell gesteuerten Spieler nicht.

## D) Pause-Overlay
1. ESC pausiert InPlay und zeigt Pause-Menü.
2. W/S und Pfeil hoch/runter wechseln Menüeintrag.
3. Enter/Space bestätigt Auswahl.
4. Resume setzt Match fort.
5. Restart startet Match neu (Score/Flow reset korrekt).
6. Back to Setup lädt Startscreen neu.

## E) Match-Flow
1. Kickoff startet nach kurzem Setup.
2. Tor erhöht den korrekten Score.
3. Nach Tor: Restart/Kickoff-Flow läuft.
4. Halbzeit-Übergang sichtbar.
5. Full-Time Overlay erscheint am Ende.

## F) HUD / Lesbarkeit
1. Score + Timer jederzeit sichtbar.
2. Possession-Anzeige wechselt korrekt.
3. Stamina-Bar P1 aktualisiert sich dynamisch.
4. In 2P: P2-Stamina-Bar sichtbar und aktualisiert.
5. Controls-Hinweise überdecken zentrale Gameplay-Zone nicht.

## G) Audio
1. Vuvuzela startet nach Matchstart.
2. Vuvuzela läuft durchgehend.
3. Vuvuzela kann nicht per UI abgeschaltet werden.
4. SFX (Pass/Schuss/Tackle etc.) weiterhin hörbar.

## H) Responsive / Viewports
Mindestens prüfen in:
- 1920x1080
- 1366x768
- 1024x768
- 390x844

Pro Viewport prüfen:
- Overlay passt ohne abgeschnittene Buttons.
- HUD überlappt keine kritischen UI-Elemente.
- Pause-Menü bleibt bedienbar.

## I) Release-Gate (manuell)
1. npm run lint -> grün
2. npm run test -> grün
3. npm run build -> grün
4. npm run preview + HTTP 200 check
