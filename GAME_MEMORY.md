# Soul Dominion Project Memory

Use this file as the handoff note for future Codex conversations. If continuing the game later, read this first, then inspect the live files before editing.

## Project

- Folder: `D:\React_ONLY_2026\GAME\Tag_with_a_twist`
- Type: static browser game using vanilla HTML/CSS/JS.
- No build step is required. It can run from a simple static server or by opening `index.html`, though a local server is better for browser testing.
- Current architecture:
  - `index.html` contains the game screens and HUD.
  - `style.css` contains all UI, entity, animation, mobile, and stage theme styling.
  - `scripts/content.js` contains weapons, characters, stage catalog, powers, tuning, and default save.
  - `scripts/save.js` handles localStorage autosave plus JSON import/export.
  - `scripts/input.js` contains keyboard/input constants such as available skill slots.
  - `scripts/audio.js` contains WebAudio music and SFX.
  - `scripts/game.js` contains runtime logic, combat, bosses, shop, rendering, and effects.

## Completed

- Removed difficulty modes. The game now has one tuned progression mode.
- Added 10 named stages with unique themes, boss names, boss HP/rewards, mob tuning, and boss skill patterns.
- Added desktop keyboard controls and mobile touch joystick/attack.
- Added localStorage autosave plus JSON Save File / Load File.
- Renamed the game from `Verdant Rush` to `Soul Dominion`; old `verdant-rush-save-v3` data is kept as a slot-1 migration fallback.
- Added three named profile/save slots. Slot 1 defaults to `Rowell`; slots 2 and 3 default to `Player 2` and `Player 3`.
- Added a title-screen profile selector, rename button, and a second `Enter the Dominion` mode screen with Adventure, Stage Mode, Loadout, and Hall of Souls.
- Hall of Souls entries now store the profile/champion name, and victory prompts for a champion name.
- Added stage HUD, boss bar, themed overlays, enemy variants, boss hazard telegraphs, and mobile layering fixes.
- Added `GAME_MEMORY.md` as the project handoff file. Future chats should read it first.
- Added Inventory / Loadout screen.
- Added visible equipped weapon and character in the main menu and loadout.
- Increased weapon and character prices so unlocks feel more like prizes.
- Added character skills on hotkeys `1`, `2`, `3`, and `4`, plus clickable/tappable skill HUD buttons.
- Added Green, Red, Yellow, Cyan, Void, God, and starter Blue skill definitions.
- Added original `Void` premium character with blindfold/cloak SVG art and gravity/repel/purple-collapse abilities.
- Added custom God SVG art and four absurd premium God skills.
- Added boss-clear celebration with portal/gate animation before stage clear.
- Added lightweight generated WebAudio music loop plus stronger skill/ultimate/portal sound effects.
- Renamed the premium God character display name to `The Divine One`.
- Added settings buttons for sound on/off in the main menu and pause menu.
- Added visible equipped weapon HUD plus weapon art attached to the player.
- Added weapon upgrade tiers, upgrade costs, and level scaling for damage/range.
- Added Inventory skill/details preview text for characters and weapons.
- Added stage-specific terrain decoration sets.
- Added mini-boss enemy spawns from stage 3 onward.
- Improved stage 10 with more HP and new final-boss skills.
- Added `Divine Overdrive`, a 10-second blue-gold aura mode with blink movement, immunity, and all-direction divine beams.
- Swapped The Divine One skills so `Reality Crack` is skill `4` and the more broken `Divine Overdrive` is skill `5`.
- Improved The Divine One music with a separate blue-gold divine theme, overdrive variation, and simple angelic choir-style sine chords.
- Split input constants and audio into separate scripts so future skills/bosses can be expanded more safely.
- Delayed boss-clear gate text until large skill text finishes, reducing the weird mixed-word overlap.
- Revised final-boss wording toward the empty-throne / godlike-anime tone.
- Verified with syntax checks and headless Edge smoke tests.

## Current Design Direction

- Keep it funny, flashy, and absurd, but still simple enough for a relative to open and play.
- Prefer portable SVG/CSS/JS assets over heavy dependencies.
- Make premium characters expensive and broken in a satisfying way.
- Keep the code split cleanly. Put new data in `content.js`, new persistence in `save.js`, and runtime behavior in `game.js`.

## Recent Feature Direction

- `Space` or `J`: basic weapon attack.
- `1`, `2`, `3`, `4`: character skills.
- The Divine One uses `4` for `Reality Crack` and `5` for `Divine Overdrive`.
- God and Void should remain expensive and intentionally broken.
- Avoid direct anime copying; keep Void as an original blindfolded void mage.

## Good Next Ideas

- Add a character preview animation in Loadout.
- Add real terrain obstacles or stage portals that affect movement, not only visual decoration.
- Add a manual test/dev shortcut only in development, not visible to players, for quickly spawning bosses.
- Add more absurd endgame content after playtesting: an Absolute Being boss, higher weapon tiers, and more cinematic finisher cut-ins.
- Balance coin costs, stage 10 HP, and premium character damage after a few real runs.

## Verification Checklist

- Run syntax checks:
  - `node --check scripts\content.js`
  - `node --check scripts\save.js`
  - `node --check scripts\input.js`
  - `node --check scripts\audio.js`
  - `node --check scripts\game.js`
- Serve locally for browser checks:
  - `npx.cmd -y http-server -p 5178 -a 127.0.0.1 .`
- Verify:
  - start menu opens
  - shop opens
  - inventory/loadout opens
  - profile slots switch active saves and rename works
  - Start Game opens the mode screen
  - Adventure starts at stage 1
  - Stage Mode starts from `bestStage`
  - sound button toggles
  - weapon upgrades persist
  - weapon/character equip is visible
  - desktop movement and attack work
  - `1/2/3/4/5` skills work and show cooldowns
  - The Divine One `4` skill shows compact `REALITY CRACK` and creates reality-cut beams
  - The Divine One `5` skill shows compact `DIVINE OVERDRIVE`, keeps the aura active, and fires omnibeams
  - mobile joystick/attack/skill buttons show above sprites
  - boss clear creates portal/celebration
  - no stale test screenshots are left unless intentionally updated
