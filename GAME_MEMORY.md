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
- Added 11 named stages with unique themes, boss names, boss HP/rewards, mob tuning, and boss skill patterns.
- Added desktop keyboard controls and mobile touch joystick/attack.
- Added localStorage autosave plus JSON Save File / Load File.
- Renamed the game from `Verdant Rush` to `Soul Dominion`; old `verdant-rush-save-v3` data is kept as a slot-1 migration fallback.
- Added three named profile/save slots. Slot 1 defaults to `Rowell`; slots 2 and 3 default to `Player 2` and `Player 3`.
- Added a title-screen profile selector, rename button, and a second `Enter the Dominion` mode screen with Adventure, Stage Mode, Loadout, and Hall of Souls.
- Reworked the first-load UI so opening `index.html` shows a simple title screen with `Start Game`, active soul/profile slots, `Create Soul`, rename, sound, and save/load. Inventory/loadout/Hall are no longer primary first-screen buttons.
- Reworked `Start Game` into a gate lobby: story stage cards for stages 1-9 and boss-only cards for stage 10 `No One` and stage 11 `The One Above`. Story cards start normal waves, while boss-only cards pass a `bossOnly` start flag and spawn the boss immediately.
- Hall of Souls entries now store the profile/champion name, and victory prompts for a champion name.
- Added stage HUD, boss bar, themed overlays, enemy variants, boss hazard telegraphs, and mobile layering fixes.
- Added `GAME_MEMORY.md` as the project handoff file. Future chats should read it first.
- Added Inventory / Loadout screen.
- Added visible equipped weapon and character in the main menu and loadout.
- Increased weapon and character prices so unlocks feel more like prizes.
- Added character skills on hotkeys `1`, `2`, `3`, and `4`, plus clickable/tappable skill HUD buttons.
- Added Green, Red, Yellow, Cyan, Void, God, and starter Blue skill definitions.
- Added original `Void Limit` premium character with blindfold/cloak SVG art, regeneration, a 4.8-second opening Infinity barrier, stronger premium stats, upgraded blue singularity / red reversal / HP-scaling purple erasure abilities, and a full-meter slot-4 `Domain Expansion`.
- `Void Limit` has a Domain meter shown during gameplay. The meter fills slowly from Void skill use, real damage taken, Infinity barrier blocks, and shield blocks. At 100%, slot `4` activates `Domain Expansion` for 14 seconds: a center eye cut-in says `DOMAIN EXPANSION / INFINITE VOID`, the arena turns black, enemies and boss timers slow, Void becomes immune to normal damage, movement becomes much faster without blink teleporting, Void skill cooldowns are shortened, enemies are pulled/damaged periodically, and the domain ends with a radial `VOID ERASURE` burst. Domain is strong but intentionally below The Divine One and does not bypass special one-hit attacks marked as divine/absolute.
- Added Void slot `5`, `Limitless Eclipse`, as a Domain-only eye-open finisher. It is disabled until Domain is active, fires screen-wide blue/red/purple Eclipse beams, and deals a meaningful HP-based chunk to `The One Above` phase 2 so Void has a real but still demanding path to win.
- Improved Void presentation with a darker WebAudio theme, a Domain-active music override, black-violet movement trails, stronger Domain aura, upgraded eye cut-in visuals, and a lightly revised original white-hair/blindfold sprite.
- Added custom God SVG art and five absurd premium God skills.
- Added boss-clear celebration with portal/gate animation before stage clear.
- Added lightweight generated WebAudio music loop plus stronger skill/ultimate/portal sound effects.
- Renamed the premium God character display name to `The Divine One`.
- Added settings buttons for sound on/off in the main menu and pause menu.
- Added visible equipped weapon HUD plus weapon art attached to the player.
- Replaced the old plain circular Palm Strike marker with `assets/weapon-palm.svg` so switching back from other weapons no longer shows an awkward orb/circle on the player or HUD.
- Added weapon upgrade tiers, upgrade costs, and level scaling for damage/range.
- Added Inventory skill/details preview text for characters and weapons.
- Added separate reward-only wing equipment. `Seraph Dominion Wings` are earned by defeating `The One Above`, auto-equip on first victory, persist in the save as `ownedWings/equippedWings`, are visible behind the player, and have their own Loadout tab/card separate from weapons and characters.
- `Seraph Dominion Wings` grant +1 heart, +18 speed, +28 magnet, and a last-miracle revive. Character revives resolve first; if those are unavailable or blocked by `noRevive`, the wings can still revive the player unless a future attack explicitly passes `ignoreWings`. On revive, wings heal to full, grant about 3.2 seconds of real seraph immunity that can protect through The One Above absolute flags, about 8 seconds of shield/speed grace, spawn hearts, play a feather/wing animation, and enter a 90-second cooldown.
- Improved `Hall of Souls` into a richer record view with summary stats, victory/fallen cards, run time, gear, wing relic status, and reward tags. Leaderboard keeps up to 12 runs now.
- Added stage-specific terrain decoration sets.
- Added mini-boss enemy spawns from stage 3 onward.
- Improved stage 10 with more HP and new final-boss skills.
- Added stage 11 `Prime Throne` with superboss `The One Above`.
- `The One Above` now speaks before phase 1 begins, starts with a weaker composed phase, then vanishes during transformation dialogue and jumpscares back in as a dedicated huge winged second phase with a larger logical arena, zoomed-out camera, long dialogue, 96k HP, 48 HP/sec regeneration, delayed beams, wing-sweep beams, a cube prison with a visible directional exit, and `Absolute Decree`, a center-channel one-hit set piece. During `Absolute Decree`, the boss anchors in the arena, charges a huge `CREATION ENDS` blast for 3 seconds, spawns a farther but reachable `RUN HERE / ONLY REFUGE` sanctuary with stronger minimum distance from the player, and has a chance to merge a directional cage whose exit points toward the sanctuary before detonating the arena with radial decree rays. `Absolute Decree` has an active/cooldown lockout so it cannot overlap itself, and the cage is weighted/guaranteed to appear after several non-cage casts.
- When `The One Above` phase 2 drops to 30% HP, he unlocks `Sovereign Wrath` / `The Above All`: the arena and boss shift to red-purple, regeneration rises to 96 HP/sec, contact and skill damage are effectively doubled, skill cadence tightens, `Absolute Decree` is more likely to merge with a cage, and a new `The Above All` beam/hazard/cage skill enters the rotation.
- Added custom `assets/boss-one-above.svg` phase-1 art, `assets/boss-one-above-ascended.svg` phase-2 art, and prime throne terrain/decor.
- Stage 10 is still played before stage 11; losing on stage 11 does not unlock Return Gate directly to stage 11.
- Added `Divine Overdrive`, a 10-second blue-gold aura mode with blink movement, immunity, and all-direction divine beams.
- Swapped The Divine One skills so `Reality Crack` is skill `4` and the more broken `Divine Overdrive` is skill `5`.
- The Divine One has quiet passive immunity only on stages 1-9. Stage 10+ can damage him normally, with the revive/overdrive fantasy still intact; do not use the normal `.invincible` blink for passive divine blocks because it caused stage-10 flicker. The normal invincibility blink was softened to a slower shimmer instead of a harsh strobe.
- The Divine One execute skills use normal boss thresholds on regular bosses, but The One Above phase 2 can only be executed at 8% HP or lower. Against The One Above phase 2, Celestial Verdict direct boss damage is 7.5% max HP and Reality Crack direct boss damage is 9.5% max HP instead of their normal 28%/32% chunks.
- Improved The Divine One music with a separate blue-gold divine theme, overdrive variation, and simple angelic choir-style sine chords.
- Split input constants and audio into separate scripts so future skills/bosses can be expanded more safely.
- Delayed boss-clear gate text until large skill text finishes, reducing the weird mixed-word overlap.
- Revised final-boss wording toward the empty-throne / godlike-anime tone.
- Stage start now applies the stage theme before decoration generation and force-clears night/domain/arena overlays instantly, preventing stage 1 from briefly looking like a night stage after previous runs.
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
- Avoid direct anime copying; keep Void as an original blindfolded spatial mage. He should feel stylish and powerful, but below The Divine One.

## Good Next Ideas

- Add a character preview animation in Loadout.
- Add real terrain obstacles or stage portals that affect movement, not only visual decoration.
- Add a manual test/dev shortcut only in development, not visible to players, for quickly spawning bosses.
- Add more absurd endgame content after playtesting: the two remaining planned superbosses, higher weapon tiers, and more cinematic finisher cut-ins.
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
  - start menu opens as the simplified title screen with `Start Game`, profile slots, and `Create Soul`
  - Start Game opens the gate lobby with story stage cards and boss-only cards
  - story stage cards start normal stages; boss-only stage 10 starts directly at `No One`; boss-only stage 11 starts directly at `The One Above`
  - shop opens
  - inventory/loadout opens
  - profile slots switch active saves and rename works
  - gate lobby Loadout and Hall of Souls buttons return correctly
  - Adventure starts at stage 1
  - Return Gate starts from the best cleared/unlocked stage and does not skip No One just because stage 11 was attempted
  - sound button toggles
  - weapon upgrades persist
  - weapon/character equip is visible
  - Seraph Dominion Wings unlock after defeating The One Above, auto-equip, persist after reload, appear in Loadout > Wings, and render behind the player
  - wing revive triggers after character revives are unavailable, works against The One Above `noRevive` attacks, grants immunity/haste/shield/hearts, then enters long cooldown
  - desktop movement and attack work
  - `1/2/3/4/5` skills work and show cooldowns
  - Void Limit shows Domain meter during gameplay, regenerates HP over time, fills Domain slowly from skills/damage/blocks, and slot `4` only activates at 100%
  - Void Domain Expansion lasts about 14 seconds, shows the eye cut-in, black domain field, faster no-blink movement, lower Void cooldowns, enemy slow/pull/damage, immunity to normal hits, and final Void Erasure burst
  - Void slot `5` stays locked outside Domain, becomes usable inside Domain, shows the Eclipse cut-in/beams, and meaningfully damages The One Above phase 2 without deleting him instantly
  - The Divine One `4` skill shows compact `REALITY CRACK` and creates reality-cut beams
  - The Divine One `5` skill shows compact `DIVINE OVERDRIVE`, keeps the aura active, and fires omnibeams
  - mobile joystick/attack/skill buttons show above sprites
  - boss clear creates portal/celebration
  - Hall of Souls shows stats, ranked cards, gear/wings, run time, and reward tags
  - stage 11 starts directly with The One Above
  - The One Above gives a short pre-fight speech before phase 1 attacks start
  - The One Above phase 1 death transforms into phase 2 instead of ending the game
  - The One Above hides during transformation dialogue, then summons back with the ascended art, enlarged logical arena, and zoomed-out world scale
  - The One Above dialogue overlay has no extra label and stays full-size during the zoomed arena
  - Absolute Decree shows a warning overlay, labels the safe spot, and can one-hit even The Divine One if missed
  - The One Above cage has a clearly labeled right-side exit and releases the player when they reach it
  - no stale test screenshots are left unless intentionally updated
