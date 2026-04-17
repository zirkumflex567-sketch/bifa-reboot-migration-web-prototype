# REDLINE FC — Technical Architecture

## 1. Technical Goals
This architecture is designed for:
- clean modular Unity development
- local multiplayer first
- scalable future online migration
- data-driven balancing
- high iteration speed for gameplay tuning

Core engineering principles:
- SOLID
- separation of concerns
- command-driven input
- state-driven actors
- data-driven tuning via ScriptableObjects
- presentation separated from gameplay rules where practical

## 2. Recommended Stack
- Unity 6 or current production-stable LTS
- URP
- New Input System
- Cinemachine
- Addressables
- TextMeshPro
- Unity Test Framework

## 3. Project Structure
```text
Assets/
  _Project/
    Art/
      Characters/
      Environments/
      UI/
      VFX/
      Materials/
      Animations/
    Audio/
      SFX/
      Music/
      Voice/
    Content/
      ScriptableObjects/
        Characters/
        Teams/
        MatchRules/
        Arenas/
        ChaosModifiers/
        InputProfiles/
    Prefabs/
      Characters/
      Ball/
      UI/
      Cameras/
      Gameplay/
    Scenes/
      Bootstrap/
      Frontend/
      Match/
      Sandbox/
    Scripts/
      Core/
        Domain/
          Match/
          Football/
          Combat/
          Meter/
          Teams/
        Application/
          Commands/
          Services/
          StateMachines/
        Infrastructure/
          UnityAdapters/
          Input/
          Physics/
          Animation/
          Audio/
          VFX/
          Persistence/
        Presentation/
          HUD/
          Cameras/
          Indicators/
          Feedback/
      Shared/
        Utilities/
        Extensions/
        Math/
        Events/
        Logging/
    Settings/
    Tests/
      EditMode/
      PlayMode/
```

## 4. Runtime Modules
### 4.1 Match Module
Responsibilities:
- timer
- score tracking
- half transitions
- overtime
- restart selection
- pause state
- match win condition

### 4.2 Team Module
Responsibilities:
- team membership
- roster ownership
- team meter
- spawn grouping
- team indicators

### 4.3 Player Module
Responsibilities:
- movement state
- action gating
- ball interaction requests
- tackle interaction requests
- animation state sync

### 4.4 Ball Module
Responsibilities:
- ball state machine
- carrier attachment
- pass release
- shot release
- rebound and deflection behavior
- goal detection

### 4.5 Combat Module
Responsibilities:
- tackle queries
- hit resolution
- knockback / knockdown outcomes
- foul classification inputs

### 4.6 Rule / Referee Module
Responsibilities:
- foul classification
- penalty and free kick triggers
- restart selection
- severity escalation

### 4.7 Camera Module
Responsibilities:
- gameplay camera
- set-piece camera
- impact feedback
- target grouping

### 4.8 HUD Module
Responsibilities:
- score
- timer
- team meter
- player indicators
- possession state
- combo / flow chain state
- event callouts

## 5. Player System Design
### 5.1 Entity Split
Recommended split:
- PlayerEntity
- PlayerController
- PlayerActor
- PlayerMotor
- PlayerActionStateMachine

### 5.2 Responsibilities
#### PlayerEntity
- player id
- team id
- character data ref
- current state snapshot
- possession state

#### PlayerController
- consumes commands
- validates legal actions
- coordinates state changes

#### PlayerActor
- MonoBehaviour adapter
- transform
- animator
- colliders
- VFX anchors
- audio refs

#### PlayerMotor
- acceleration / deceleration
- facing rotation
- movement constraints
- sprint modifiers
- ball-control movement modifiers

#### PlayerActionStateMachine
Core states:
- Locomotion
- Receive
- Pass
- Shoot
- Trick
- Tackle
- Stunned
- KnockedDown
- Recovering
- SetPieceControl

## 6. State Machine Rules
Every gameplay state should expose:
- Enter()
- Tick()
- Exit()
- CanInterrupt()
- HandleCommand()

Rules:
- no monolithic player god class
- action states own timing windows
- interruption rules are explicit and testable
- animation reacts to state, not vice versa

## 7. Input Architecture
Use the New Input System with command abstraction.

### Action maps
#### Global
- Navigate
- Submit
- Cancel
- Pause

#### Match
- Move
- Aim
- Sprint
- Pass
- ThroughPass
- Shoot
- Tackle
- Trick
- Special

#### SetPiece
- Aim
- Confirm
- Fake
- Shoot

### Input strategy
- PlayerInputManager for hot join
- device pairing per local user
- input converted to domain commands

Command examples:
- MoveCommand
- SprintCommand
- PassCommand
- ThroughPassCommand
- ShootCommand
- TackleCommand
- TrickCommand
- SpecialCommand

## 8. Ball System
### 8.1 Ball State Machine
States:
- Carried
- FreeRolling
- AirbornePass
- AirborneShot
- Deflected
- Rebounding
- OutOfBounds
- GoalScored
- RestartAttach

### 8.2 Ownership Tracking
Track explicitly:
- current controller player
- last toucher
- possession team
- pass origin
- shot origin
- pending target

### 8.3 Ball Simulation Strategy
Use hybrid simulation:
- authored velocity curves for pass/shot feel
- selective physics-based collision and rebound logic
- avoid pure simulation as primary control model

### 8.4 Ball API
Core operations:
- AttachToCarrier(player)
- ReleaseAsPass(params)
- ReleaseAsShot(params)
- Deflect(contact)
- Bounce(surface)
- ResetToRestart(anchor)

## 9. Match Flow System
### 9.1 Match State Machine
Top-level states:
- Bootstrapping
- TeamIntro
- KickoffSetup
- InPlay
- FoulStopped
- SetPieceSetup
- GoalScored
- HalfTime
- FullTime
- Overtime
- Paused

### 9.2 RestartDirector
A dedicated service determines:
- restart type
- ball placement
- player placement
- control lock duration
- camera mode
- whistle timing

## 10. Camera System
### Gameplay camera requirements
- keep ball and nearby actors visible
- bias in direction of play
- widen near goal pressure
- avoid aggressive zoom oscillation
- prioritize readability over spectacle

### Camera stack
- Main gameplay camera
- Set-piece camera
- Goal celebration camera
- Impact feedback layer

Use Cinemachine with target groups and weighted framing.

## 11. Data-Driven Content
### Recommended ScriptableObjects
- CharacterData
- TeamData
- MatchRulesetData
- ArenaData
- CameraProfileData
- BallTuningData
- PassTuningData
- TackleTuningData
- ChaosModifierData
- AudioEventCatalog
- VFXCatalog

### CharacterData suggested fields
- DisplayName
- RoleArchetype
- Stats
- Trait
- ModelPrefab
- Portrait
- AnimatorController
- SFX set
- Celebration set

## 12. Test Strategy
### EditMode tests
- pass resolution logic
- tackle legality classification
- meter gain rules
- restart selection rules
- combo break conditions

### PlayMode tests
- kickoff flow
- goal reset flow
- penalty setup flow
- local join flow
- camera target framing sanity

## 13. Performance and Scalability Notes
- avoid heavy per-frame allocations
- prefer explicit event dispatch over broad scene searches
- keep runtime GC low during active match
- build systems with future network determinism in mind where practical
- keep simulation decisions centralized and inspectable

## 14. Recommended First Implementation Order
1. Bootstrap scene and systems root
2. Local player join and input routing
3. Player locomotion and facing
4. Ball attachment and release
5. Short pass and receive loop
6. Goal scoring and restart loop
7. Tackles and dispossession
8. Fouls and set pieces
9. Meter and combo bonuses
10. HUD and feedback polish
