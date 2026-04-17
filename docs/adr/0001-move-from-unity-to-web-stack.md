# ADR 0001 – Wechsel von Unity auf TypeScript + Three.js + Vite

- **Status:** angenommen
- **Datum:** 2026-04-16

## Kontext

Das bisherige Projekt war auf Unity ausgerichtet. Für die nächste Iteration ist jedoch entscheidend, dass sehr schnell testbare Prototypen entstehen:

- ohne Unity-Editor-Overhead
- ohne schwere Projektstruktur
- ohne plattformspezifische Builds als ersten Schritt
- mit sauberem Arbeiten in Git-Branches

## Entscheidung

Wir migrieren den Prototypen auf einen Browser-Stack:

- **TypeScript** als Sprache
- **Three.js** als Render-Engine
- **Vite** als lokale Entwicklungs- und Build-Umgebung

## Begründung

1. **Kurzer Weg zur ersten Szene**
   Three.js ist schnell installierbar und sofort browserfähig.

2. **Kurzer Feedback-Loop**
   Vite ist auf schnelle lokale Entwicklung und HMR ausgelegt.

3. **Saubere Git-Arbeit**
   Textbasierte Projektstruktur ist branch-freundlicher als ein Unity-zentrierter Asset-/Meta-Workflow.

4. **Zielsystem Browser**
   Ein browserbasierter Prototyp ist leicht zu teilen, leicht zu deployen und reduziert Reibung.

5. **Ausbaubar**
   Der Stack ist klein genug für Prototyping und groß genug, um später Physik, Networking oder React-basierte Oberflächen zu ergänzen.

## Konsequenzen

### Positiv

- schnellere Startzeit für neue Ideen
- weniger Editor- und Import-Reibung
- leichtere Reviewbarkeit in Pull Requests
- direkter Weg zu Web-Demos

### Negativ

- kein Unity-Ökosystem mehr
- manche Komfortfunktionen müssen modular selbst gewählt werden
- bestehende Unity-Szenen müssen konzeptionell statt 1:1 portiert werden

## Nicht gewählt

### PlayCanvas

Sehr schnell, besonders für visuelle Browser-Projekte, aber für einen lokalen Branch-Reset weniger neutral als ein klassisches TypeScript-Repo.

### Babylon.js

Gute Alternative, aber in diesem Projekt gewinnt Three.js durch Minimalität und breite Anschlussfähigkeit.

### Java-Stacks

Nicht optimal für den schnellsten Prototyping-Loop.

### Godot 4 mit C#

Für browsernahe Prototypen unattraktiver, weil C#-Web-Export in Godot 4 weiterhin eingeschränkt ist.
