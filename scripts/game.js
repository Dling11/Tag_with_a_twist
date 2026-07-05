(() => {
  "use strict";

  const {
    gameTuning,
    weapons,
    characters,
    stageCatalog,
    powerDefinitions,
    defaultSave
  } = window.VerdantRushContent;
  const saveStore = window.VerdantRushStorage;

  const $ = (id) => document.getElementById(id);
  const gameWrap = $("gameWrap");
  const playerEl = $("player");
  const nightOverlay = $("nightOverlay");
  const decorLayer = $("decorLayer");
  const pickupLayer = $("pickupLayer");
  const enemyLayer = $("enemyLayer");
  const effectLayer = $("effectLayer");
  const powerStatus = $("powerStatus");
  const scoreValue = $("scoreValue");
  const bestValue = $("bestValue");
  const stageValue = $("stageValue");
  const areaValue = $("areaValue");
  const timeValue = $("timeValue");
  const heartsEl = $("hearts");
  const bossBar = $("bossBar");
  const bossNameEl = $("bossName");
  const bossFill = $("bossFill");
  const damageVignette = $("damageVignette");
  const shopGrid = $("shopGrid");
  const walletValue = $("walletValue");
  const leaderboardList = $("leaderboardList");
  const saveInput = $("saveInput");
  const nextStagePreview = $("nextStagePreview");
  const nextBossPreview = $("nextBossPreview");
  const equippedWeaponValue = $("equippedWeaponValue");
  const equippedCharacterValue = $("equippedCharacterValue");
  const loadoutWeaponValue = $("loadoutWeaponValue");
  const loadoutCharacterValue = $("loadoutCharacterValue");
  const loadoutWalletValue = $("loadoutWalletValue");
  const weaponLoadoutGrid = $("weaponLoadoutGrid");
  const characterLoadoutGrid = $("characterLoadoutGrid");
  const skillDetails = $("skillDetails");
  const skillHud = $("skillHud");
  const weaponStatus = $("weaponStatus");
  const touchControls = $("touchControls");
  const joystick = $("joystick");
  const stick = $("stick");
  const touchAttackBtn = $("touchAttackBtn");

  const screens = {
    start: $("startScreen"),
    instructions: $("instructionsScreen"),
    shop: $("shopScreen"),
    inventory: $("inventoryScreen"),
    leaderboard: $("leaderboardScreen"),
    stageClear: $("stageClearScreen"),
    pause: $("pauseScreen"),
    gameOver: $("gameOverScreen"),
    credits: $("creditsScreen")
  };

  const buttons = {
    start: $("startBtn"),
    instructions: $("instructionsBtn"),
    back: $("backBtn"),
    shop: $("shopBtn"),
    inventory: $("inventoryBtn"),
    inventoryBack: $("inventoryBackBtn"),
    shopBack: $("shopBackBtn"),
    leaderboard: $("leaderboardBtn"),
    leaderboardBack: $("leaderboardBackBtn"),
    settings: $("settingsBtn"),
    settingsPause: $("settingsPauseBtn"),
    save: $("saveBtn"),
    load: $("loadBtn"),
    pause: $("pauseBtn"),
    resume: $("resumeBtn"),
    restartPause: $("restartPauseBtn"),
    menuPause: $("menuPauseBtn"),
    nextStage: $("nextStageBtn"),
    shopStage: $("shopStageBtn"),
    inventoryStage: $("inventoryStageBtn"),
    menuStage: $("menuStageBtn"),
    restart: $("restartBtn"),
    menu: $("menuBtn"),
    creditsMenu: $("creditsMenuBtn")
  };

  const state = {
    mode: "menu",
    width: 1200,
    height: 800,
    lastTime: 0,
    elapsed: 0,
    stage: 1,
    phase: "mobs",
    stageKills: 0,
    killGoal: 8,
    runCoins: 0,
    bankedThisRun: 0,
    health: 5,
    maxHealth: 5,
    renderedHealth: -1,
    renderedMaxHealth: -1,
    invincibleUntil: 0,
    lowHealthActive: false,
    nextEnemyAt: 0,
    nextCoinAt: 0,
    nextHeartAt: 0,
    nextPowerAt: 0,
    nextMiniBossAt: 0,
    activePowers: {},
    renderedPowers: "",
    shieldCharges: 0,
    rageUntil: 0,
    revivesLeft: 0,
    lastAttackAt: 0,
    attackQueued: false,
    touchAttackHeld: false,
    skillCooldowns: {},
    renderedSkillSignature: "",
    divineOverdriveUntil: 0,
    nextDivineBeamAt: 0,
    lastBlinkAt: 0,
    screenEffectUntil: 0,
    loadoutReturn: "start",
    enemyHasteUntil: 0,
    nightActive: false,
    boss: null,
    save: defaultSave(),
    player: { x: 600, y: 400, r: 22, speed: 255, vx: 0, vy: 0, facing: 1, aimX: 1, aimY: 0 },
    enemies: [],
    pickups: [],
    projectiles: [],
    hazards: [],
    particles: [],
    floatingText: [],
    decorations: [],
    timers: [],
    touchMove: { active: false, x: 0, y: 0 }
  };

  const keys = new Set();
  let audioContext = null;
  let animationId = 0;
  let musicTimer = 0;
  let musicStep = 0;

  boot();

  function boot() {
    state.save = saveStore.loadSave();
    resize();
    generateDecorations();
    bindEvents();
    renderShop();
    renderLoadout();
    renderLeaderboard();
    updateHud();
    updateStartPreview();
    updateEquippedSummary();
    updateSettingsButtons();
    updatePlayerSkin();
    updatePlayerElement();
    showScreen("start");
  }

  function bindEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
    buttons.start.addEventListener("click", () => { playSound("click"); startRun(1); });
    buttons.instructions.addEventListener("click", () => { playSound("click"); showScreen("instructions"); });
    buttons.back.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.shop.addEventListener("click", () => openShop("start"));
    buttons.inventory.addEventListener("click", () => openInventory("start"));
    buttons.inventoryBack.addEventListener("click", () => closeInventory());
    buttons.shopBack.addEventListener("click", () => closeShop());
    buttons.leaderboard.addEventListener("click", () => { playSound("click"); renderLeaderboard(); showScreen("leaderboard"); });
    buttons.leaderboardBack.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.settings.addEventListener("click", toggleSound);
    buttons.settingsPause.addEventListener("click", toggleSound);
    buttons.save.addEventListener("click", exportSaveFile);
    buttons.load.addEventListener("click", () => saveInput.click());
    saveInput.addEventListener("change", importSaveFile);
    buttons.pause.addEventListener("click", pauseGame);
    buttons.resume.addEventListener("click", resumeGame);
    buttons.restartPause.addEventListener("click", () => { playSound("click"); startRun(state.stage); });
    buttons.menuPause.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.nextStage.addEventListener("click", () => { playSound("click"); startStage(Math.min(gameTuning.maxStage, state.stage + 1)); });
    buttons.shopStage.addEventListener("click", () => openShop("stageClear"));
    buttons.inventoryStage.addEventListener("click", () => openInventory("stageClear"));
    buttons.menuStage.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.restart.addEventListener("click", () => { playSound("click"); startRun(1); });
    buttons.menu.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.creditsMenu.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    document.querySelectorAll(".loadout-tab").forEach((button) => {
      button.addEventListener("click", () => switchLoadoutTab(button.dataset.loadoutTab));
    });
    bindTouchControls();
  }

  function resize() {
    const rect = gameWrap.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    clampPlayer();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "j", "1", "2", "3", "4"].includes(key)) {
      event.preventDefault();
    }
    if (key === "escape") {
      if (state.mode === "playing") pauseGame();
      else if (state.mode === "paused") resumeGame();
      return;
    }
    if ((key === " " || key === "j") && state.mode === "playing") {
      state.attackQueued = true;
    }
    if (["1", "2", "3", "4"].includes(key) && state.mode === "playing") {
      useSkill(Number(key));
      return;
    }
    keys.add(key);
  }

  function bindTouchControls() {
    if (!touchControls || !joystick || !stick || !touchAttackBtn) return;

    const resetStick = () => {
      state.touchMove.active = false;
      state.touchMove.x = 0;
      state.touchMove.y = 0;
      stick.style.transform = "translate3d(-50%, -50%, 0)";
    };

    const moveStick = (event) => {
      const rect = joystick.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const max = rect.width * .34;
      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);
      const limited = Math.min(max, distance);
      const nx = distance ? dx / distance : 0;
      const ny = distance ? dy / distance : 0;

      state.touchMove.active = true;
      state.touchMove.x = nx * (limited / max);
      state.touchMove.y = ny * (limited / max);
      stick.style.transform = `translate3d(calc(-50% + ${nx * limited}px), calc(-50% + ${ny * limited}px), 0)`;
    };

    joystick.addEventListener("pointerdown", (event) => {
      joystick.setPointerCapture(event.pointerId);
      moveStick(event);
    });
    joystick.addEventListener("pointermove", (event) => {
      if (state.touchMove.active) moveStick(event);
    });
    joystick.addEventListener("pointerup", resetStick);
    joystick.addEventListener("pointercancel", resetStick);
    joystick.addEventListener("lostpointercapture", resetStick);
    touchAttackBtn.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      state.touchAttackHeld = true;
      state.attackQueued = state.mode === "playing";
      touchAttackBtn.classList.add("pressed");
    });
    touchAttackBtn.addEventListener("pointerup", () => {
      state.touchAttackHeld = false;
      touchAttackBtn.classList.remove("pressed");
    });
    touchAttackBtn.addEventListener("pointercancel", () => {
      state.touchAttackHeld = false;
      touchAttackBtn.classList.remove("pressed");
    });
  }

  function startRun(stage) {
    state.runCoins = 0;
    state.bankedThisRun = 0;
    startMusic();
    startStage(stage);
  }

  function startStage(stage) {
    resize();
    clearDynamicElements();
    const stageInfo = getStageInfo(stage);
    generateDecorations(stageInfo);
    const character = getCharacter();
    state.mode = "playing";
    state.stage = stageInfo.id;
    state.phase = "mobs";
    state.elapsed = 0;
    state.stageKills = 0;
    state.killGoal = stageInfo.killGoal;
    state.maxHealth = Math.max(2, 4 + gameTuning.healthBonus + character.health);
    state.health = state.maxHealth;
    state.renderedHealth = -1;
    state.invincibleUntil = 0;
    state.nextEnemyAt = 350;
    state.nextCoinAt = 200;
    state.nextHeartAt = 9000;
    state.nextPowerAt = 7000;
    state.nextMiniBossAt = stageInfo.id >= 3 ? 10500 : 0;
    state.activePowers = {};
    state.renderedPowers = "";
    state.shieldCharges = 0;
    state.rageUntil = 0;
    state.revivesLeft = character.revives || 0;
    state.lastAttackAt = 0;
    state.attackQueued = false;
    state.enemyHasteUntil = 0;
    state.skillCooldowns = {};
    state.divineOverdriveUntil = 0;
    state.nextDivineBeamAt = 0;
    state.lastBlinkAt = 0;
    state.screenEffectUntil = 0;
    state.nightActive = false;
    state.boss = null;
    state.touchMove.active = false;
    state.touchMove.x = 0;
    state.touchMove.y = 0;
    state.touchAttackHeld = false;
    if (stick) stick.style.transform = "translate3d(-50%, -50%, 0)";
    if (touchAttackBtn) touchAttackBtn.classList.remove("pressed");
    state.player.x = state.width / 2;
    state.player.y = state.height / 2;
    state.player.vx = 0;
    state.player.vy = 0;
    updatePlayerSkin();
    renderSkillHud(true);
    playerEl.classList.remove("invincible", "boosted", "shielded", "low-health", "divine-overdrive");
    nightOverlay.classList.remove("active");
    bossBar.classList.remove("active");
    applyStageTheme(stageInfo);
    updateHud();
    showScreen(null);
    spawnEnemy();
    spawnEnemy();
    spawnCoin();
    floatText(stageInfo.name.toUpperCase(), state.player.x, state.player.y - 70);
    state.lastTime = performance.now();
    cancelAnimationFrame(animationId);
    animationId = requestAnimationFrame(loop);
  }

  function pauseGame() {
    if (state.mode !== "playing") return;
    playSound("click");
    state.mode = "paused";
    showScreen("pause");
  }

  function resumeGame() {
    if (state.mode !== "paused") return;
    playSound("click");
    state.mode = "playing";
    showScreen(null);
    state.lastTime = performance.now();
    animationId = requestAnimationFrame(loop);
  }

  function returnToMenu() {
    state.mode = "menu";
    cancelAnimationFrame(animationId);
    stopMusic();
    clearDynamicElements();
    bossBar.classList.remove("active");
    showScreen("start");
    updateHud();
  }

  function loop(now) {
    if (state.mode !== "playing") return;
    const dt = Math.min((now - state.lastTime) / 1000, 0.033);
    state.lastTime = now;
    state.elapsed += dt * 1000;
    update(dt);
    render();
    animationId = requestAnimationFrame(loop);
  }

  function update(dt) {
    movePlayer(dt);
    if (state.touchAttackHeld) state.attackQueued = true;
    if (state.attackQueued) tryAttack();
    updateSpawns();
    updateEnemies(dt);
    updateProjectiles(dt);
    updateHazards();
    updatePickups();
    updatePowers();
    updateStageAtmosphere();
    updateDivineOverdrive();
    updateParticles(dt);
    updateFloatingText();
    if (performance.now() > state.invincibleUntil) playerEl.classList.remove("invincible");
    updateLowHealthWarning();
    updatePowerClasses();
    renderSkillHud();
    updateHud();
  }

  function movePlayer(dt) {
    const left = keys.has("a") || keys.has("arrowleft");
    const right = keys.has("d") || keys.has("arrowright");
    const up = keys.has("w") || keys.has("arrowup");
    const down = keys.has("s") || keys.has("arrowdown");
    let dx = Number(right) - Number(left);
    let dy = Number(down) - Number(up);
    if (state.touchMove.active) {
      dx += state.touchMove.x;
      dy += state.touchMove.y;
    }
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      state.player.aimX = dx;
      state.player.aimY = dy;
    }
    const character = getCharacter();
    const speedBoost = getPowerTimeLeft("boost") > 0 ? 1.34 : 1;
    const divineBoost = performance.now() < state.divineOverdriveUntil ? 1.42 : 1;
    const targetVx = dx * (state.player.speed + character.speed) * speedBoost * divineBoost;
    const targetVy = dy * (state.player.speed + character.speed) * speedBoost * divineBoost;
    const smoothing = 1 - Math.pow(0.0009, dt);
    state.player.vx += (targetVx - state.player.vx) * smoothing;
    state.player.vy += (targetVy - state.player.vy) * smoothing;
    state.player.x += state.player.vx * dt;
    state.player.y += state.player.vy * dt;
    if (performance.now() < state.divineOverdriveUntil && Math.hypot(dx, dy) > .1 && performance.now() - state.lastBlinkAt > 520) {
      state.lastBlinkAt = performance.now();
      const oldX = state.player.x;
      const oldY = state.player.y;
      state.player.x += dx * 34;
      state.player.y += dy * 34;
      clampPlayer();
      createBlinkTrail(oldX, oldY, state.player.x, state.player.y);
    }
    if (Math.abs(state.player.vx) > 8) state.player.facing = state.player.vx >= 0 ? 1 : -1;
    clampPlayer();
  }

  function clampPlayer() {
    const pad = state.player.r + 8;
    state.player.x = clamp(state.player.x, pad, state.width - pad);
    state.player.y = clamp(state.player.y, pad + 60, state.height - pad);
  }

  function tryAttack() {
    state.attackQueued = false;
    const now = performance.now();
    const weapon = getWeapon();
    const character = getCharacter();
    const god = character.god;
    const cooldown = god ? Math.max(150, weapon.cooldown * .55 * character.attackSpeed) : weapon.cooldown * (character.attackSpeed || 1);
    if (now - state.lastAttackAt < cooldown) return;
    state.lastAttackAt = now;
    playSound("attack");
    if (god) createGodWaves();
    if (state.save.equippedWeapon === "bow") fireProjectile("arrow", weapon.damage, 620, weapon.range);
    else if (state.save.equippedWeapon === "shuriken") fireShurikenVolley(weapon);
    else meleeAttack(weapon);
  }

  function meleeAttack(weapon) {
    const damage = getAttackDamage(weapon.damage);
    const dir = normalizedAim();
    const center = {
      x: state.player.x + dir.x * weapon.range * .55,
      y: state.player.y + dir.y * weapon.range * .55
    };
    createSlash(center.x, center.y, Math.atan2(dir.y, dir.x));
    for (const enemy of [...state.enemies]) {
      const dist = Math.hypot(enemy.x - center.x, enemy.y - center.y);
      const facingDot = ((enemy.x - state.player.x) * dir.x + (enemy.y - state.player.y) * dir.y);
      if (dist < weapon.range && facingDot > -10) damageEnemy(enemy, damage);
    }
  }

  function fireProjectile(kind, damage, speed, range, angleOffset = 0) {
    const aim = normalizedAim();
    const angle = Math.atan2(aim.y, aim.x) + angleOffset;
    const element = document.createElement("div");
    element.className = `projectile ${kind}`;
    effectLayer.appendChild(element);
    state.projectiles.push({
      kind,
      x: state.player.x + Math.cos(angle) * 28,
      y: state.player.y + Math.sin(angle) * 28,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      damage: getAttackDamage(damage),
      range,
      traveled: 0,
      r: kind === "arrow" ? 12 : 16,
      element,
      rot: angle
    });
  }

  function fireShurikenVolley(weapon) {
    fireProjectile("shuriken", weapon.damage, 430, weapon.range, -0.24);
    fireProjectile("shuriken", weapon.damage, 470, weapon.range, 0);
    fireProjectile("shuriken", weapon.damage, 430, weapon.range, 0.24);
  }

  function createGodWaves() {
    for (let i = 0; i < 10; i += 1) {
      const angle = (Math.PI * 2 * i) / 10;
      const element = document.createElement("div");
      element.className = "god-wave";
      element.style.setProperty("--x", `${state.player.x + Math.cos(angle) * 82}px`);
      element.style.setProperty("--y", `${state.player.y + Math.sin(angle) * 82}px`);
      element.style.setProperty("--rot", `${angle + Math.PI / 2}rad`);
      effectLayer.appendChild(element);
      setTimeout(() => element.remove(), 700);
    }
    for (const enemy of [...state.enemies]) {
      if (Math.hypot(enemy.x - state.player.x, enemy.y - state.player.y) < 260) damageEnemy(enemy, 70);
    }
  }

  function activateDivineOverdrive() {
    const now = performance.now();
    state.divineOverdriveUntil = now + 10000;
    state.nextDivineBeamAt = now + 420;
    state.activePowers.boost = Math.max(state.activePowers.boost || 0, now + 10000);
    state.activePowers.shield = Math.max(state.activePowers.shield || 0, now + 10000);
    state.shieldCharges = 1;
    playerEl.classList.add("divine-overdrive");
    createShockwave(state.player.x, state.player.y, 580, "god", "BLUE-GOLD AURA");
  }

  function updateDivineOverdrive() {
    const now = performance.now();
    const active = now < state.divineOverdriveUntil;
    playerEl.classList.toggle("divine-overdrive", active);
    if (!active || state.mode !== "playing") return;
    if (now >= state.nextDivineBeamAt) {
      state.nextDivineBeamAt = now + 850;
      fireOmniDivineBeams(8, 640, 62, 110, 240);
      damageEnemiesInRadius(state.player.x, state.player.y, 240, 65, 120);
    }
  }

  function fireOmniDivineBeams(count, length, width, damage, bossDamage) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      createBeamAt(state.player.x, state.player.y, "divine-omni", angle, length, width, 620, "");
      damageEnemiesInBeamFrom(state.player.x, state.player.y, dir, length, width, damage, bossDamage);
    }
  }

  function useSkill(slot) {
    const character = getCharacter();
    const skill = character.skills?.find((item) => item.slot === slot);
    if (!skill) {
      floatText("LOCKED", state.player.x, state.player.y - 54);
      playSound("click");
      return;
    }

    const now = performance.now();
    const readyAt = state.skillCooldowns[slot] || 0;
    if (now < readyAt) {
      floatText(`${Math.ceil((readyAt - now) / 1000)}s`, state.player.x, state.player.y - 54);
      return;
    }

    state.skillCooldowns[slot] = now + skill.cooldown;
    performSkill(skill.effect, skill);
    renderSkillHud(true);
  }

  function performSkill(effect, skill) {
    const now = performance.now();
    const aim = normalizedAim();

    if (effect === "blueSpark") {
      createShockwave(state.player.x, state.player.y, 220, "blue", skill.name);
      pushEnemies(state.player.x, state.player.y, 220, 85, 220);
      playSound("skill");
    } else if (effect === "greenHeal") {
      const heal = Math.max(1, Math.ceil(state.maxHealth * .5));
      state.health = Math.min(state.maxHealth, state.health + heal);
      state.activePowers.shield = now + 2500;
      state.shieldCharges = 1;
      createShockwave(state.player.x, state.player.y, 210, "green", skill.name);
      burst(state.player.x, state.player.y, 34, ["#ffffff", "#77f090", "#35c75a"]);
      floatText(`+${heal} HP`, state.player.x, state.player.y - 60);
      playSound("heal");
    } else if (effect === "redBurst") {
      state.rageUntil = now + 6500;
      createShockwave(state.player.x, state.player.y, 330, "red", skill.name);
      damageEnemiesInRadius(state.player.x, state.player.y, 300, 95, 130);
      shake();
      playSound("skill");
    } else if (effect === "yellowHaste") {
      state.activePowers.boost = now + 6500;
      state.player.vx += aim.x * 720;
      state.player.vy += aim.y * 720;
      createBeam("yellow", aim, 420, 86, 380, "FLASH STEP");
      damageEnemiesInBeam(aim, 420, 92, 58, 70);
      playSound("power");
    } else if (effect === "cyanVacuum") {
      createShockwave(state.player.x, state.player.y, 360, "cyan", skill.name);
      for (const pickup of [...state.pickups]) {
        if (pickup.type === "coin") {
          pickup.x = state.player.x + random(-18, 18);
          pickup.y = state.player.y + random(-18, 18);
        }
      }
      pullEnemies(state.player.x, state.player.y, 360, 95, 42);
      damageEnemiesInRadius(state.player.x, state.player.y, 340, 38, 52);
      playSound("coin");
    } else if (effect === "voidBlue") {
      const point = {
        x: clamp(state.player.x + aim.x * 170, 80, state.width - 80),
        y: clamp(state.player.y + aim.y * 170, 130, state.height - 80)
      };
      createBeam("void-blue", aim, 560, 150, 520, "GRAVITY BLUE");
      pullEnemies(point.x, point.y, 520, 260, 110);
      damageEnemiesInBeam(aim, 560, 160, 86, 120);
      createShockwave(point.x, point.y, 260, "void-blue", "BLUE");
      playSound("skill");
    } else if (effect === "voidRed") {
      createShockwave(state.player.x, state.player.y, 430, "void-red", "REPULSE RED");
      pushEnemies(state.player.x, state.player.y, 430, 310, 150);
      damageEnemiesInRadius(state.player.x, state.player.y, 410, 135, 210);
      shake();
      playSound("skill");
    } else if (effect === "voidPurple") {
      createScreenEffect("void-purple", "VOID PURPLE");
      createBeam("void-purple", aim, Math.max(state.width, state.height) * 1.35, 230, 1100, "VOID PURPLE");
      damageEnemiesInBeam(aim, Math.max(state.width, state.height) * 1.35, 250, 520, 720);
      shake();
      queueTimer(() => shake(), 260);
      playSound("ultimate");
    } else if (effect === "godShockwave") {
      createScreenEffect("god-flash compact", "DIVINE PULSE");
      createShockwave(state.player.x, state.player.y, 520, "god", "DIVINE PULSE");
      damageEnemiesInRadius(state.player.x, state.player.y, 500, 170, 260);
      state.activePowers.shield = now + 3600;
      state.shieldCharges = 1;
      shake();
      playSound("skill");
    } else if (effect === "godJudgment") {
      createScreenEffect("god-flash", "JUDGMENT RAIN");
      for (let i = 0; i < 8; i += 1) {
        queueTimer(() => {
          const point = randomOpenPoint(0);
          createBeamAt(point.x, point.y, "god-column", -Math.PI / 2, state.height, 72, 540);
          damageEnemiesInRadius(point.x, point.y, 130, 120, 190);
        }, i * 90);
      }
      damageEnemiesInRadius(state.player.x, state.player.y, 9999, 90, 160);
      shake();
      playSound("skill");
    } else if (effect === "godFinisher") {
      createScreenEffect("god-finisher compact", "CELESTIAL VERDICT");
      const boss = state.boss;
      if (boss) {
        const execute = boss.hp <= boss.maxHp * .45;
        createBeam("god", aim, Math.max(state.width, state.height) * 1.2, 180, 950, execute ? "ABSOLUTE VERDICT" : "DIVINE CUT");
        damageEnemy(boss, execute ? boss.hp + 1 : Math.max(420, boss.maxHp * .28));
      }
      damageEnemiesInRadius(state.player.x, state.player.y, 9999, 999, 280);
      shake();
      playSound("ultimate");
    } else if (effect === "godReality") {
      createScreenEffect("divine-overdrive compact", "DIVINE OVERDRIVE");
      activateDivineOverdrive();
      fireOmniDivineBeams(14, 820, 118, 260, 520);
      state.health = state.maxHealth;
      state.invincibleUntil = now + 10000;
      playerEl.classList.add("invincible");
      shake();
      queueTimer(() => shake(), 220);
      queueTimer(() => shake(), 520);
      playSound("ultimate");
    }
  }

  function damageEnemiesInRadius(x, y, radius, amount, bossAmount = amount) {
    for (const enemy of [...state.enemies]) {
      if (Math.hypot(enemy.x - x, enemy.y - y) <= radius + enemy.r) {
        damageEnemy(enemy, enemy === state.boss ? bossAmount : amount);
      }
    }
  }

  function damageEnemiesInBeam(dir, length, width, amount, bossAmount = amount) {
    for (const enemy of [...state.enemies]) {
      const dx = enemy.x - state.player.x;
      const dy = enemy.y - state.player.y;
      const forward = dx * dir.x + dy * dir.y;
      const side = Math.abs(dx * -dir.y + dy * dir.x);
      if (forward > -70 && forward < length && side < width / 2 + enemy.r) {
        damageEnemy(enemy, enemy === state.boss ? bossAmount : amount);
      }
    }
  }

  function damageEnemiesInBeamFrom(x, y, dir, length, width, amount, bossAmount = amount) {
    for (const enemy of [...state.enemies]) {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const forward = dx * dir.x + dy * dir.y;
      const side = Math.abs(dx * -dir.y + dy * dir.x);
      if (forward > -50 && forward < length && side < width / 2 + enemy.r) {
        damageEnemy(enemy, enemy === state.boss ? bossAmount : amount);
      }
    }
  }

  function pullEnemies(x, y, radius, force, damage = 0) {
    for (const enemy of [...state.enemies]) {
      const dx = x - enemy.x;
      const dy = y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > radius) continue;
      const power = (1 - distance / radius) * force;
      enemy.x += (dx / distance) * power;
      enemy.y += (dy / distance) * power;
      if (damage) damageEnemy(enemy, enemy === state.boss ? damage * 1.4 : damage);
    }
  }

  function pushEnemies(x, y, radius, force, damage = 0) {
    for (const enemy of [...state.enemies]) {
      const dx = enemy.x - x;
      const dy = enemy.y - y;
      const distance = Math.hypot(dx, dy) || 1;
      if (distance > radius) continue;
      const power = (1 - distance / radius) * force;
      enemy.x = clamp(enemy.x + (dx / distance) * power, enemy.r, state.width - enemy.r);
      enemy.y = clamp(enemy.y + (dy / distance) * power, enemy.r + 62, state.height - enemy.r);
      if (damage) damageEnemy(enemy, enemy === state.boss ? damage * 1.35 : damage);
    }
  }

  function createShockwave(x, y, size, className, label) {
    const element = document.createElement("div");
    element.className = `skill-shockwave ${className}`;
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.setProperty("--size", `${size}px`);
    element.textContent = label || "";
    effectLayer.appendChild(element);
    setTimeout(() => element.remove(), 850);
  }

  function createBeam(className, dir, length, width, duration, label) {
    const angle = Math.atan2(dir.y, dir.x);
    createBeamAt(state.player.x + dir.x * 36, state.player.y + dir.y * 36, className, angle, length, width, duration, label);
  }

  function createBeamAt(x, y, className, angle, length, width, duration, label = "") {
    const element = document.createElement("div");
    element.className = `skill-beam ${className}`;
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.setProperty("--rot", `${angle}rad`);
    element.style.setProperty("--length", `${length}px`);
    element.style.setProperty("--width", `${width}px`);
    element.textContent = label;
    effectLayer.appendChild(element);
    setTimeout(() => element.remove(), duration);
  }

  function createScreenEffect(className, label) {
    effectLayer.querySelectorAll(".screen-effect").forEach((item) => item.remove());
    const element = document.createElement("div");
    element.className = `screen-effect ${className}`;
    element.textContent = label;
    effectLayer.appendChild(element);
    state.screenEffectUntil = performance.now() + 1200;
    setTimeout(() => element.remove(), 1200);
  }

  function createBlinkTrail(fromX, fromY, toX, toY) {
    const element = document.createElement("div");
    element.className = "blink-trail";
    element.style.setProperty("--x1", `${fromX}px`);
    element.style.setProperty("--y1", `${fromY}px`);
    element.style.setProperty("--x2", `${toX}px`);
    element.style.setProperty("--y2", `${toY}px`);
    element.style.setProperty("--rot", `${Math.atan2(toY - fromY, toX - fromX)}rad`);
    effectLayer.appendChild(element);
    setTimeout(() => element.remove(), 360);
  }

  function createSlash(x, y, angle) {
    const element = document.createElement("div");
    element.className = "attack-arc";
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.setProperty("--rot", `${angle - .7}rad`);
    effectLayer.appendChild(element);
    setTimeout(() => element.remove(), 220);
  }

  function updateProjectiles(dt) {
    for (let i = state.projectiles.length - 1; i >= 0; i -= 1) {
      const p = state.projectiles[i];
      if (p.kind === "shuriken") steerProjectile(p, dt);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const step = Math.hypot(p.vx * dt, p.vy * dt);
      p.traveled += step;
      let hit = false;
      for (const enemy of [...state.enemies]) {
        if (Math.hypot(enemy.x - p.x, enemy.y - p.y) < enemy.r + p.r) {
          damageEnemy(enemy, p.damage);
          hit = true;
          break;
        }
      }
      p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) rotate(${p.rot}rad)`;
      if (hit || p.traveled > p.range || p.x < -40 || p.y < -40 || p.x > state.width + 40 || p.y > state.height + 40) {
        p.element.remove();
        state.projectiles.splice(i, 1);
      }
    }
  }

  function steerProjectile(p, dt) {
    const target = findNearestEnemy(p.x, p.y, 260);
    if (!target) return;
    const dx = target.x - p.x;
    const dy = target.y - p.y;
    const len = Math.hypot(dx, dy) || 1;
    const speed = Math.hypot(p.vx, p.vy);
    p.vx += ((dx / len) * speed - p.vx) * Math.min(1, dt * 4.4);
    p.vy += ((dy / len) * speed - p.vy) * Math.min(1, dt * 4.4);
    p.rot = Math.atan2(p.vy, p.vx);
  }

  function updateSpawns() {
    const stageInfo = getStageInfo();
    const t = state.elapsed;
    if (state.phase === "mobs" && t >= state.nextEnemyAt) {
      spawnEnemy();
      state.nextEnemyAt = t + getSpawnDelay(stageInfo) + random(0, 240);
    }
    if (t >= state.nextCoinAt) {
      spawnCoin();
      state.nextCoinAt = t + random(800, 1350);
    }
    if (t >= state.nextHeartAt) {
      if (state.health < state.maxHealth) spawnHeart();
      state.nextHeartAt = t + random(10000, 15000);
    }
    if (t >= state.nextPowerAt) {
      maybeSpawnPower();
      state.nextPowerAt = t + random(10000, 15000);
    }
    if (state.phase === "mobs" && state.stage >= 3 && t >= state.nextMiniBossAt) {
      spawnEnemy(false, "miniBoss");
      state.nextMiniBossAt = t + random(16000, 24000);
    }
    if (state.phase === "mobs" && state.stageKills >= state.killGoal) spawnBoss();
  }

  function updateEnemies(dt) {
    const stageInfo = getStageInfo();
    const freezeFactor = getPowerTimeLeft("freeze") > 0 ? .18 : 1;
    const hasteFactor = performance.now() < state.enemyHasteUntil ? 1.34 : 1;
    for (const enemy of [...state.enemies]) {
      const dx = state.player.x - enemy.x;
      const dy = state.player.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      let moveX = dx / distance;
      let moveY = dy / distance;
      if (enemy.type === "boss" || enemy.type === "final") {
        enemy.skillTimer -= dt * 1000;
        if (enemy.skillTimer <= 0) {
          bossSkill(enemy);
          enemy.skillTimer = enemy.type === "final" ? 1050 : 2200;
        }
      } else if (enemy.variant === "miniBoss") {
        enemy.skillTimer -= dt * 1000;
        if (enemy.skillTimer <= 0) {
          createHazard(state.player.x, state.player.y, 52, 540, 320, 1, "mini");
          enemy.skillTimer = random(2400, 3600);
        }
      }
      for (const other of state.enemies) {
        if (enemy === other) continue;
        const ox = enemy.x - other.x;
        const oy = enemy.y - other.y;
        const od = Math.hypot(ox, oy) || 1;
        if (od < enemy.r + other.r + 8) {
          const push = (enemy.r + other.r + 8 - od) / (enemy.r + other.r + 8);
          moveX += (ox / od) * push;
          moveY += (oy / od) * push;
        }
      }
      const len = Math.hypot(moveX, moveY) || 1;
      const bossFactor = enemy.type === "boss" || enemy.type === "final" ? .58 : 1;
      const ghostFactor = enemy.type === "ghost" ? .7 : 1;
      const speed = getEnemySpeed(stageInfo) * enemy.speedMultiplier * bossFactor * ghostFactor * freezeFactor * hasteFactor;
      enemy.x += (moveX / len) * speed * dt;
      enemy.y += (moveY / len) * speed * dt;
      enemy.x = clamp(enemy.x, enemy.r, state.width - enemy.r);
      enemy.y = clamp(enemy.y, enemy.r + 62, state.height - enemy.r);
      enemy.facing = moveX >= 0 ? 1 : -1;
      if (distance < enemy.r + state.player.r) {
        if (getPowerTimeLeft("vulnerable") > 0 && enemy.type !== "boss" && enemy.type !== "final") damageEnemy(enemy, 999);
        else if (enemy.type === "ghost") stealCoins(enemy);
        else damagePlayer(enemy.damage || gameTuning.damage);
      }
    }
  }

  function bossSkill(boss) {
    if (boss.type === "final") {
      finalBossSkill(boss);
      return;
    }
    const skill = boss.skill === "noOne" ? randomBossSkill() : boss.skill;

    if (skill === "rootTrap") {
      spawnEnemy(true);
      createHazard(state.player.x, state.player.y, 66, 650, 360, 1, "root");
      floatText("ROOTS", boss.x, boss.y - 70);
    } else if (skill === "emberRing") {
      createHazardRing(boss.x, boss.y, 5, 145, 48, "ember");
      floatText("EMBER RING", boss.x, boss.y - 70);
    } else if (skill === "tideLines") {
      createHazard(state.player.x - 92, state.player.y, 44, 520, 420, 1, "tide");
      createHazard(state.player.x, state.player.y, 44, 650, 420, 1, "tide");
      createHazard(state.player.x + 92, state.player.y, 44, 780, 420, 1, "tide");
      floatText("TIDE CUT", boss.x, boss.y - 70);
    } else if (skill === "quake") {
      createHazard(boss.x, boss.y, 172, 720, 420, 1, "iron");
      spawnEnemy(true);
      shake();
      floatText("QUAKE", boss.x, boss.y - 70);
    } else if (skill === "splinters") {
      for (let i = 0; i < 2; i += 1) spawnEnemy(true, "runner");
      createHazard(state.player.x, state.player.y, 58, 560, 380, 1, "glass");
      floatText("SPLINTERS", boss.x, boss.y - 70);
    } else if (skill === "stormStrike") {
      for (let i = 0; i < 3; i += 1) {
        queueTimer(() => {
          const point = randomNearPlayer(130);
          createHazard(point.x, point.y, 54, 420, 320, 1, "storm");
        }, i * 180);
      }
      floatText("STORM", boss.x, boss.y - 70);
    } else if (skill === "haunt") {
      spawnEnemy(true, "ghost");
      spawnEnemy(true, "ghost");
      createHazard(state.player.x, state.player.y, 76, 700, 500, 1, "grave");
      floatText("HAUNT", boss.x, boss.y - 70);
    } else if (skill === "mirrorStep") {
      const oldX = boss.x;
      const oldY = boss.y;
      const point = randomOpenPoint(220);
      boss.x = point.x;
      boss.y = point.y;
      createHazard(oldX, oldY, 58, 360, 320, 1, "mirror");
      createHazard(boss.x, boss.y, 58, 560, 320, 1, "mirror");
      spawnEnemy(true, "runner");
      floatText("MIRROR STEP", boss.x, boss.y - 70);
    } else if (skill === "haste") {
      state.enemyHasteUntil = performance.now() + 3800;
      spawnEnemy(true);
      spawnEnemy(true, "runner");
      floatText("FAST FORWARD", boss.x, boss.y - 70);
    }

  }

  function finalBossSkill(boss) {
    const skill = randomFinalSkill();
    if (skill === "emptyCross") {
      createBeamAt(0, boss.y, "void-purple", 0, state.width, 96, 780, "EMPTY CROSS");
      createBeamAt(boss.x, 64, "void-purple", Math.PI / 2, state.height, 96, 780, "");
      if (Math.abs(state.player.y - boss.y) < 70 || Math.abs(state.player.x - boss.x) < 70) damagePlayer(2);
      shake();
    } else if (skill === "voidCollapse") {
      createHazard(state.player.x, state.player.y, 150, 820, 560, 2, "void");
      pullEnemies(state.player.x, state.player.y, 360, 120, 0);
      floatText("COLLAPSE", boss.x, boss.y - 92);
    } else if (skill === "echoCourt") {
      spawnEnemy(true, "miniBoss");
      spawnEnemy(true, "ghost");
      spawnEnemy(true, "runner");
      createScreenEffect("void-purple compact", "ECHO COURT");
    } else {
      for (let i = 0; i < 5; i += 1) {
        queueTimer(() => {
          const point = randomNearPlayer(210);
          createHazard(point.x, point.y, 64, 380, 340, 1, "void");
        }, i * 160);
      }
      floatText("THE VOID COMMANDS", boss.x, boss.y - 92);
    }
  }

  function randomFinalSkill() {
    const skills = ["emptyCross", "voidCollapse", "echoCourt", "emptyRain"];
    return skills[Math.floor(random(0, skills.length))];
  }

  function randomBossSkill() {
    const skills = ["rootTrap", "emberRing", "tideLines", "quake", "splinters", "stormStrike", "haunt", "mirrorStep", "haste"];
    return skills[Math.floor(random(0, skills.length))];
  }

  function createHazardRing(x, y, count, distance, radius, className) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + random(-.18, .18);
      createHazard(x + Math.cos(angle) * distance, y + Math.sin(angle) * distance, radius, 560 + i * 70, 360, 1, className);
    }
  }

  function createHazard(x, y, radius, delay, duration, damage, className) {
    const element = document.createElement("div");
    element.className = `hazard ${className}`;
    element.style.setProperty("--x", `${clamp(x, radius, state.width - radius)}px`);
    element.style.setProperty("--y", `${clamp(y, radius + 68, state.height - radius)}px`);
    element.style.setProperty("--r", `${radius * 2}px`);
    effectLayer.appendChild(element);
    const now = performance.now();
    state.hazards.push({
      x: clamp(x, radius, state.width - radius),
      y: clamp(y, radius + 68, state.height - radius),
      r: radius,
      damage,
      element,
      armedAt: now + delay,
      removeAt: now + delay + duration,
      hit: false
    });
  }

  function updateHazards() {
    const now = performance.now();
    for (let i = state.hazards.length - 1; i >= 0; i -= 1) {
      const hazard = state.hazards[i];
      if (now >= hazard.armedAt) {
        hazard.element.classList.add("armed");
        if (!hazard.hit && Math.hypot(state.player.x - hazard.x, state.player.y - hazard.y) < state.player.r + hazard.r * .72) {
          hazard.hit = true;
          damagePlayer(hazard.damage);
        }
      }
      if (now >= hazard.removeAt) {
        hazard.element.remove();
        state.hazards.splice(i, 1);
      }
    }
  }

  function randomNearPlayer(radius) {
    const angle = random(0, Math.PI * 2);
    const distance = random(20, radius);
    return {
      x: clamp(state.player.x + Math.cos(angle) * distance, 58, state.width - 58),
      y: clamp(state.player.y + Math.sin(angle) * distance, 130, state.height - 58)
    };
  }

  function damageEnemy(enemy, amount) {
    enemy.hp -= amount;
    enemy.element.classList.remove("hit");
    void enemy.element.offsetWidth;
    enemy.element.classList.add("hit");
    burst(enemy.x, enemy.y, enemy.type === "normal" ? 5 : 10, ["#fff", "#ffbd3e", "#f04452"]);
    if (enemy.hp <= 0) killEnemy(enemy);
  }

  function killEnemy(enemy) {
    const index = state.enemies.indexOf(enemy);
    if (index === -1) return;
    const reward = enemy.reward || 8;
    state.runCoins += reward;
    state.stageKills += enemy.type === "miniBoss" ? 2 : enemy.type === "normal" || enemy.type === "ghost" ? 1 : 0;
    floatText(`+${reward}`, enemy.x, enemy.y - 24);
    burst(enemy.x, enemy.y, enemy.type === "final" ? 42 : 18, enemy.type === "final" ? ["#fff", "#ffe15b", "#8d59ff"] : ["#fff7a6", "#ffd24f", "#ff9f2e"]);
    enemy.element.remove();
    state.enemies.splice(index, 1);
    if (enemy === state.boss) {
      state.boss = null;
      const delay = Math.max(0, state.screenEffectUntil - performance.now() + 120);
      queueAnyTimer(() => beginBossCelebration(state.stage >= gameTuning.maxStage), delay);
    }
  }

  function beginBossCelebration(final) {
    state.mode = "celebrating";
    cancelAnimationFrame(animationId);
    bossBar.classList.remove("active");
    for (const enemy of [...state.enemies]) {
      burst(enemy.x, enemy.y, 16, ["#ffffff", "#ffd24f", "#7eeaff"]);
      enemy.element.remove();
    }
    state.enemies = [];
    createPortal(final);
    createScreenEffect(final ? "reality-crack" : "portal-open", final ? "THE LAST GATE BREAKS" : "GATE OPENED");
    playSound("portal");
    shake();
    queueAnyTimer(() => {
      if (final) winGame();
      else clearStage();
    }, 1550);
  }

  function createPortal(final = false) {
    const element = document.createElement("div");
    element.className = `stage-portal${final ? " final" : ""}`;
    element.style.setProperty("--x", `${state.width / 2}px`);
    element.style.setProperty("--y", `${state.height / 2}px`);
    effectLayer.appendChild(element);
    for (let i = 0; i < 5; i += 1) {
      queueAnyTimer(() => burst(state.width / 2, state.height / 2, 18, final ? ["#fff", "#8d59ff", "#111"] : ["#fff", "#7eeaff", "#ffcf55"]), i * 170);
    }
  }

  function updatePickups() {
    const magnet = 42 + getCharacter().magnet;
    for (let i = state.pickups.length - 1; i >= 0; i -= 1) {
      const pickup = state.pickups[i];
      const dx = state.player.x - pickup.x;
      const dy = state.player.y - pickup.y;
      const distance = Math.hypot(dx, dy);
      if (pickup.type === "coin" && distance < magnet && distance > 2) {
        pickup.x += (dx / distance) * 5.8;
        pickup.y += (dy / distance) * 5.8;
      }
      if (distance > state.player.r + pickup.r) continue;
      if (pickup.type === "coin") collectCoin(pickup);
      else if (pickup.type === "heart") collectHeart(pickup);
      else collectPower(pickup);
      pickup.element.remove();
      state.pickups.splice(i, 1);
    }
  }

  function collectCoin(coin) {
    const gain = Math.round(coin.value * gameTuning.coinScale * getStageInfo().coinScale);
    state.runCoins += gain;
    playSound("coin");
    burst(coin.x, coin.y, 12, ["#fff7a6", "#ffd24f", "#ff9f2e"]);
    floatText(`+${gain}`, coin.x, coin.y - 24);
  }

  function collectHeart(heart) {
    state.health = Math.min(state.maxHealth, state.health + 1);
    playSound("heal");
    burst(heart.x, heart.y, 16, ["#ff9ab1", "#f43f67", "#ffffff"]);
    floatText("+HEART", heart.x, heart.y - 24);
  }

  function collectPower(power) {
    const definition = powerDefinitions[power.powerType];
    const now = performance.now();
    state.activePowers[power.powerType] = Math.max(state.activePowers[power.powerType] || 0, now) + definition.duration;
    if (power.powerType === "shield") state.shieldCharges = 1;
    playSound("power");
    burst(power.x, power.y, 20, ["#ffffff", "#7eeaff", "#ffcf55", "#c06cff"]);
    floatText(definition.message, power.x, power.y - 28);
  }

  function damagePlayer(amount = 1) {
    const now = performance.now();
    const character = getCharacter();
    if (character.god && state.stage < gameTuning.maxStage) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 650;
        playerEl.classList.add("invincible");
        floatText("DIVINE", state.player.x, state.player.y - 44);
      }
      return;
    }
    if (character.god && now < state.divineOverdriveUntil) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 520;
        floatText("UNTOUCHED", state.player.x, state.player.y - 44);
      }
      return;
    }
    if (now < state.invincibleUntil) return;
    if (state.shieldCharges > 0 || getPowerTimeLeft("shield") > 0) {
      state.shieldCharges = 0;
      state.activePowers.shield = 0;
      state.invincibleUntil = now + 850;
      playerEl.classList.add("invincible");
      playSound("heal");
      burst(state.player.x, state.player.y, 24, ["#53ebb7", "#ffffff", "#9fffe2"]);
      floatText("BLOCK", state.player.x, state.player.y - 32);
      return;
    }
    state.health -= amount;
    if (character.rage && Math.random() < .55) {
      state.rageUntil = now + 5200;
      floatText("RAGE", state.player.x, state.player.y - 48);
    }
    state.invincibleUntil = now + 1100;
    playerEl.classList.add("invincible");
    playSound("damage");
    shake();
    flashDamage();
    burst(state.player.x, state.player.y, 20, ["#ff4561", "#ffffff", "#8cecff"]);
    if (state.health <= 0) {
      if (state.save.equippedCharacter === "god") {
        if (state.stage < gameTuning.maxStage) state.revivesLeft = Math.max(state.revivesLeft, 1);
        else state.revivesLeft += 1;
        state.revivesLeft -= 1;
        state.health = Math.ceil(state.maxHealth * .55);
        state.invincibleUntil = now + 2200;
        createGodWaves();
        floatText("REVIVE", state.player.x, state.player.y - 55);
      } else endGame();
    }
  }

  function spawnEnemy(fromBoss = false, forcedVariant = null) {
    const stageInfo = getStageInfo();
    const point = randomSpawnPoint();
    const variant = forcedVariant || chooseEnemyVariant(stageInfo, fromBoss);
    const isGhost = variant === "ghost";
    const isRunner = variant === "runner";
    const isTank = variant === "tank";
    const isMiniBoss = variant === "miniBoss";
    const element = document.createElement("div");
    element.className = `enemy entity spawn-pop ${variant}`;
    enemyLayer.appendChild(element);
    const hp = (34 + state.stage * 7) * (isMiniBoss ? 4.8 : isTank ? 1.75 : isRunner ? .78 : 1);
    const enemy = {
      type: isMiniBoss ? "miniBoss" : isGhost ? "ghost" : "normal",
      variant,
      x: point.x,
      y: point.y,
      r: isMiniBoss ? 42 : isTank ? 29 : isGhost ? 25 : 23,
      hp,
      maxHp: hp,
      damage: isMiniBoss ? 2 : 1,
      reward: isMiniBoss ? 95 + state.stage * 12 : isTank ? 24 + state.stage : isRunner ? 14 + state.stage : isGhost ? 22 + state.stage : 9 + state.stage,
      skillTimer: isMiniBoss ? random(1700, 2600) : 0,
      element,
      facing: point.x < state.player.x ? 1 : -1,
      speedMultiplier: (isMiniBoss ? .62 : isTank ? .74 : isRunner ? 1.34 : 1) * random(.88, 1.16)
    };
    state.enemies.push(enemy);
    setEntityTransform(element, enemy.x, enemy.y, enemy.facing);
    setTimeout(() => element.classList.remove("spawn-pop"), 360);
  }

  function spawnBoss() {
    state.phase = "boss";
    enemyLayer.querySelectorAll(".enemy").forEach((el) => el.classList.remove("spawn-pop"));
    const stageInfo = getStageInfo();
    const final = Boolean(stageInfo.final);
    const hp = stageInfo.hp;
    const element = document.createElement("div");
    element.className = `enemy entity boss spawn-pop boss-${stageInfo.bossClass}${final ? " final-boss" : ""}`;
    enemyLayer.appendChild(element);
    state.boss = {
      type: final ? "final" : "boss",
      stage: stageInfo.id,
      skill: stageInfo.skill,
      x: state.width / 2,
      y: 120,
      r: final ? 82 : 58,
      hp,
      maxHp: hp,
      damage: final ? 2 : 1,
      reward: stageInfo.reward,
      skillTimer: final ? 850 : 1600,
      element,
      facing: 1,
      speedMultiplier: final ? .95 : .82
    };
    state.enemies.push(state.boss);
    bossNameEl.textContent = `${stageInfo.bossName} - ${stageInfo.bossTitle}`;
    bossBar.classList.add("active");
    playSound("boss");
    shake();
    floatText(final ? "THE EMPTY THRONE AWAKENS" : stageInfo.bossName.toUpperCase(), state.width / 2, state.height / 2 - 80);
  }

  function spawnCoin() {
    const point = randomOpenPoint(80);
    createPickup("coin", point.x, point.y, 17, { value: random(5, 12) });
  }

  function spawnHeart() {
    const point = randomOpenPoint(110);
    createPickup("heart", point.x, point.y, 19);
  }

  function maybeSpawnPower() {
    const types = ["freeze", "shield", "boost", "vulnerable"];
    const chance = clamp(.2 + state.stage * .025 + (state.health <= 1 ? .22 : 0), .2, .55);
    if (Math.random() > chance) return;
    const type = types[Math.floor(random(0, types.length))];
    const point = randomOpenPoint(130);
    createPickup("power", point.x, point.y, 24, { powerType: type });
  }

  function createPickup(type, x, y, r, extra = {}) {
    const element = document.createElement("div");
    element.className = type === "power" ? `pickup power ${extra.powerType}` : `pickup ${type}`;
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    pickupLayer.appendChild(element);
    state.pickups.push({ type, x, y, r, element, ...extra });
  }

  function randomSpawnPoint() {
    const margin = 38;
    const sides = [
      () => ({ x: random(margin, state.width - margin), y: margin + 62 }),
      () => ({ x: state.width - margin, y: random(96, state.height - margin) }),
      () => ({ x: random(margin, state.width - margin), y: state.height - margin }),
      () => ({ x: margin, y: random(96, state.height - margin) })
    ];
    for (let i = 0; i < 20; i += 1) {
      const point = sides[Math.floor(Math.random() * sides.length)]();
      if (Math.hypot(point.x - state.player.x, point.y - state.player.y) > 230) return point;
    }
    return { x: margin, y: state.height - margin };
  }

  function randomOpenPoint(minPlayerDistance) {
    for (let i = 0; i < 80; i += 1) {
      const point = { x: random(40, state.width - 40), y: random(96, state.height - 42) };
      if (Math.hypot(point.x - state.player.x, point.y - state.player.y) < minPlayerDistance) continue;
      const blocked = state.decorations.some((decor) => decor.kind !== "bush" && Math.hypot(point.x - decor.x, point.y - decor.y) < decor.r + 20);
      if (!blocked) return point;
    }
    return { x: random(60, state.width - 60), y: random(110, state.height - 60) };
  }

  function clearStage() {
    const stageInfo = getStageInfo();
    state.mode = "stageClear";
    cancelAnimationFrame(animationId);
    stopMusic();
    bankCoins();
    bossBar.classList.remove("active");
    $("stageClearTitle").textContent = `${stageInfo.name} cleared`;
    $("stageClearText").textContent = `${stageInfo.clearText} You earned ${state.bankedThisRun} coins this run.`;
    showScreen("stageClear");
    updateSaveBest();
    persistSave();
  }

  function winGame() {
    state.mode = "credits";
    cancelAnimationFrame(animationId);
    stopMusic();
    bankCoins();
    addLeaderboard(true);
    bossBar.classList.remove("active");
    nightOverlay.classList.add("active");
    playSound("victory");
    showScreen("credits");
    persistSave();
  }

  function endGame() {
    state.mode = "gameOver";
    cancelAnimationFrame(animationId);
    stopMusic();
    bankCoins();
    addLeaderboard(false);
    bossBar.classList.remove("active");
    $("finalScore").textContent = state.bankedThisRun;
    $("finalTime").textContent = getStageInfo().name;
    $("finalBest").textContent = state.save.bestStage;
    playSound("gameOver");
    showScreen("gameOver");
    updateHud();
    persistSave();
  }

  function bankCoins() {
    state.bankedThisRun += state.runCoins;
    state.save.coins += state.runCoins;
    state.runCoins = 0;
    renderShop();
    renderLoadout();
    updateEquippedSummary();
    persistSave();
  }

  function updateSaveBest() {
    state.save.bestStage = Math.max(state.save.bestStage, state.stage);
    updateStartPreview();
  }

  function addLeaderboard(won) {
    updateSaveBest();
    state.save.leaderboard.push({
      stage: state.stage,
      stageName: getStageInfo().name,
      coins: state.bankedThisRun,
      weapon: getWeapon().name,
      character: getCharacter().name,
      won,
      date: new Date().toLocaleDateString()
    });
    state.save.leaderboard.sort((a, b) => Number(b.won) - Number(a.won) || b.stage - a.stage || b.coins - a.coins);
    state.save.leaderboard = state.save.leaderboard.slice(0, 8);
    renderLeaderboard();
    persistSave();
  }

  function openShop(returnScreen) {
    playSound("click");
    state.shopReturn = returnScreen;
    renderShop();
    showScreen("shop");
  }

  function openInventory(returnScreen) {
    playSound("click");
    state.loadoutReturn = returnScreen;
    renderLoadout();
    showScreen("inventory");
  }

  function closeShop() {
    playSound("click");
    showScreen(state.shopReturn === "stageClear" ? "stageClear" : "start");
  }

  function closeInventory() {
    playSound("click");
    showScreen(state.loadoutReturn === "stageClear" ? "stageClear" : "start");
  }

  function renderShop() {
    walletValue.textContent = state.save.coins;
    shopGrid.replaceChildren();
    const cards = [
      ...Object.entries(weapons).filter(([id]) => id !== "default").map(([id, item]) => ({ type: "weapon", id, ...item })),
      ...Object.entries(characters).filter(([id]) => id !== "blue").map(([id, item]) => ({ type: "character", id, icon: item.color, ...item }))
    ];
    for (const item of cards) {
      shopGrid.appendChild(createItemCard(item));
    }
  }

  function renderLoadout() {
    if (!weaponLoadoutGrid || !characterLoadoutGrid) return;
    loadoutWalletValue.textContent = state.save.coins;
    weaponLoadoutGrid.replaceChildren();
    characterLoadoutGrid.replaceChildren();
    for (const [id, item] of Object.entries(weapons)) {
      weaponLoadoutGrid.appendChild(createItemCard({ type: "weapon", id, ...item }, true));
    }
    for (const [id, item] of Object.entries(characters)) {
      characterLoadoutGrid.appendChild(createItemCard({ type: "character", id, icon: item.color, ...item }, true));
    }
    updateEquippedSummary();
    renderSkillDetails({ type: "character", id: state.save.equippedCharacter, icon: getCharacter().color, ...getCharacter() });
  }

  function createItemCard(item, showLocked = false) {
    const owned = item.type === "weapon" ? state.save.ownedWeapons.includes(item.id) : state.save.ownedCharacters.includes(item.id);
    const equipped = item.type === "weapon" ? state.save.equippedWeapon === item.id : state.save.equippedCharacter === item.id;
    const locked = state.save.coins < item.cost && !owned;
    const level = item.type === "weapon" ? getWeaponLevel(item.id) : 0;
    const upgradeCost = item.type === "weapon" ? getUpgradeCost(item.id) : 0;
    const maxed = item.type === "weapon" && level >= 5;
    const card = document.createElement("div");
    card.className = `shop-card item-card ${item.type}${owned ? " owned" : ""}${equipped ? " equipped" : ""}${locked ? " locked" : ""}`;
    const skillList = item.skills?.length
      ? `<ul class="skill-list">${item.skills.map((skill) => `<li><b>${skill.slot}</b><span>${skill.name}</span><em>${skill.desc}</em></li>`).join("")}</ul>`
      : "";
    card.innerHTML = `
      <div class="shop-card-head">
        <div class="shop-icon ${item.icon || item.id}"></div>
        <span class="item-badge">${equipped ? "Equipped" : owned ? item.type === "weapon" ? `Lv ${level}` : "Owned" : `${item.cost} coins`}</span>
      </div>
      <div><h3>${item.name}</h3><p>${item.desc}</p>${item.type === "weapon" ? `<small>Level ${level}/5 - Damage ${getWeaponStats(item.id).damage} - Range ${getWeaponStats(item.id).range}</small>` : skillList}</div>
    `;
    const button = document.createElement("button");
    button.textContent = equipped ? "Equipped" : owned ? "Equip" : `Buy ${item.cost}`;
    button.disabled = equipped || (!owned && locked);
    button.addEventListener("click", () => buyOrEquip(item));
    card.appendChild(button);
    if (item.type === "weapon" && owned) {
      const upgradeButton = document.createElement("button");
      upgradeButton.className = "upgrade-btn";
      upgradeButton.textContent = maxed ? "Max Level" : `Upgrade ${upgradeCost}`;
      upgradeButton.disabled = maxed || state.save.coins < upgradeCost;
      upgradeButton.addEventListener("click", () => upgradeWeapon(item.id));
      card.appendChild(upgradeButton);
    }
    card.addEventListener("mouseenter", () => renderSkillDetails(item));
    card.addEventListener("focusin", () => renderSkillDetails(item));
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      renderSkillDetails(item);
    });
    if (!owned && !showLocked && locked) card.classList.add("shop-locked");
    return card;
  }

  function switchLoadoutTab(tab) {
    document.querySelectorAll(".loadout-tab").forEach((button) => button.classList.toggle("active", button.dataset.loadoutTab === tab));
    weaponLoadoutGrid.classList.toggle("hidden", tab !== "weapons");
    characterLoadoutGrid.classList.toggle("hidden", tab !== "characters");
    playSound("click");
  }

  function buyOrEquip(item) {
    const ownedList = item.type === "weapon" ? state.save.ownedWeapons : state.save.ownedCharacters;
    if (!ownedList.includes(item.id)) {
      if (state.save.coins < item.cost) return;
      state.save.coins -= item.cost;
      ownedList.push(item.id);
      if (item.type === "weapon") state.save.weaponLevels[item.id] ||= 1;
      playSound("coin");
    } else {
      playSound("click");
    }
    if (item.type === "weapon") state.save.equippedWeapon = item.id;
    else state.save.equippedCharacter = item.id;
    updatePlayerSkin();
    renderShop();
    renderLoadout();
    updateHud();
    updateEquippedSummary();
    renderSkillHud(true);
    persistSave();
  }

  function upgradeWeapon(id) {
    const level = getWeaponLevel(id);
    const cost = getUpgradeCost(id);
    if (level >= 5 || state.save.coins < cost) return;
    state.save.coins -= cost;
    state.save.weaponLevels[id] = level + 1;
    playSound("coin");
    renderShop();
    renderLoadout();
    updateEquippedSummary();
    updateHud();
    persistSave();
  }

  function getWeaponLevel(id) {
    return Math.max(1, Math.min(5, Number(state.save.weaponLevels?.[id]) || 1));
  }

  function getUpgradeCost(id) {
    const weapon = weapons[id] || weapons.default;
    const level = getWeaponLevel(id);
    return Math.round((weapon.upgradeBase || 180) * Math.pow(1.85, level - 1));
  }

  function getWeaponStats(id) {
    const weapon = weapons[id] || weapons.default;
    const level = getWeaponLevel(id);
    return {
      ...weapon,
      damage: Math.round(weapon.damage + (weapon.upgradeDamage || 5) * (level - 1)),
      range: Math.round(weapon.range + (weapon.upgradeRange || 4) * (level - 1)),
      level
    };
  }

  function renderSkillDetails(item) {
    if (!skillDetails) return;
    if (item.type === "weapon") {
      const stats = getWeaponStats(item.id);
      skillDetails.innerHTML = `
        <h3>${item.name}</h3>
        <p>Level ${stats.level}/5. Damage ${stats.damage}, range ${stats.range}. Upgrades keep this weapon relevant deeper into the run.</p>
      `;
      return;
    }
    const skills = item.skills || [];
    skillDetails.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.desc}</p>
      ${skills.length ? `<ul>${skills.map((skill) => `<li><b>${skill.slot} - ${skill.name}</b><span>${skill.desc}</span></li>`).join("")}</ul>` : ""}
    `;
  }

  function updateEquippedSummary() {
    const weapon = getWeapon();
    const character = getCharacter();
    if (equippedWeaponValue) equippedWeaponValue.textContent = `${weapon.name} Lv ${weapon.level || 1}`;
    if (equippedCharacterValue) equippedCharacterValue.textContent = character.name;
    if (loadoutWeaponValue) loadoutWeaponValue.textContent = `${weapon.name} Lv ${weapon.level || 1}`;
    if (loadoutCharacterValue) loadoutCharacterValue.textContent = character.name;
    if (loadoutWalletValue) loadoutWalletValue.textContent = state.save.coins;
    if (weaponStatus) {
      weaponStatus.className = `weapon-status ${state.save.equippedWeapon}`;
      weaponStatus.innerHTML = `<span>Weapon</span><strong>${weapon.name} Lv ${weapon.level || 1}</strong>`;
    }
  }

  function toggleSound() {
    const enabled = state.save.settings?.music !== false || state.save.settings?.sfx !== false;
    state.save.settings = {
      music: !enabled,
      sfx: !enabled
    };
    if (!state.save.settings.music) stopMusic();
    else if (state.mode === "playing") startMusic();
    updateSettingsButtons();
    persistSave();
  }

  function updateSettingsButtons() {
    const enabled = state.save.settings?.music !== false || state.save.settings?.sfx !== false;
    const label = enabled ? "Sound On" : "Sound Off";
    if (buttons.settings) buttons.settings.textContent = label;
    if (buttons.settingsPause) buttons.settingsPause.textContent = label;
  }

  function renderLeaderboard() {
    leaderboardList.replaceChildren();
    if (!state.save.leaderboard.length) {
      const empty = document.createElement("li");
      empty.textContent = "No runs yet. Go make the forest nervous.";
      leaderboardList.appendChild(empty);
      return;
    }
    for (const run of state.save.leaderboard) {
      const li = document.createElement("li");
      li.textContent = `${run.won ? "Victory" : run.stageName || `Stage ${run.stage}`} - ${run.coins} coins - ${run.character} / ${run.weapon} - ${run.date}`;
      leaderboardList.appendChild(li);
    }
  }

  function exportSaveFile() {
    playSound("click");
    saveStore.exportSaveFile(state.save);
  }

  function importSaveFile() {
    const file = saveInput.files?.[0];
    if (!file) return;
    saveStore.readSaveFile(file)
      .then((loaded) => {
        state.save = loaded;
        renderShop();
        renderLoadout();
        renderLeaderboard();
        updatePlayerSkin();
        updateHud();
        updateStartPreview();
        updateEquippedSummary();
        renderSkillHud(true);
        persistSave();
        playSound("power");
        showScreen("start");
      })
      .catch(() => {
        alert("That save file could not be loaded.");
      })
      .finally(() => {
        saveInput.value = "";
      });
  }

  function generateDecorations(stageInfo = getStageInfo()) {
    decorLayer.replaceChildren();
    state.decorations = [];
    const terrain = {
      bramble: [{ kind: "tree", count: 15, min: 72, max: 110, r: 38 }, { kind: "bush", count: 20, min: 48, max: 82, r: 24 }, { kind: "rock", count: 9, min: 42, max: 74, r: 24 }],
      ember: [{ kind: "tree", count: 10, min: 72, max: 108, r: 38 }, { kind: "ember", count: 10, min: 38, max: 64, r: 24 }, { kind: "rock", count: 14, min: 42, max: 78, r: 24 }],
      tide: [{ kind: "tree", count: 11, min: 68, max: 104, r: 36 }, { kind: "reed", count: 18, min: 38, max: 70, r: 18 }, { kind: "rock", count: 8, min: 42, max: 78, r: 24 }],
      iron: [{ kind: "tree", count: 8, min: 70, max: 108, r: 38 }, { kind: "obelisk", count: 9, min: 54, max: 88, r: 28 }, { kind: "rock", count: 18, min: 42, max: 80, r: 24 }],
      glass: [{ kind: "crystal", count: 16, min: 44, max: 86, r: 24 }, { kind: "bush", count: 11, min: 46, max: 72, r: 22 }, { kind: "rock", count: 7, min: 42, max: 70, r: 24 }],
      storm: [{ kind: "tree", count: 9, min: 74, max: 114, r: 38 }, { kind: "spark", count: 12, min: 34, max: 64, r: 18 }, { kind: "rock", count: 13, min: 46, max: 84, r: 24 }],
      grave: [{ kind: "grave", count: 15, min: 42, max: 74, r: 22 }, { kind: "bush", count: 14, min: 42, max: 76, r: 22 }, { kind: "tree", count: 8, min: 74, max: 112, r: 38 }],
      mirror: [{ kind: "crystal", count: 20, min: 46, max: 92, r: 24 }, { kind: "obelisk", count: 6, min: 54, max: 86, r: 28 }, { kind: "tree", count: 8, min: 70, max: 104, r: 38 }],
      clock: [{ kind: "gear", count: 14, min: 44, max: 78, r: 24 }, { kind: "obelisk", count: 9, min: 54, max: 88, r: 28 }, { kind: "tree", count: 8, min: 70, max: 106, r: 38 }],
      void: [{ kind: "voidspire", count: 14, min: 54, max: 96, r: 28 }, { kind: "crystal", count: 12, min: 44, max: 84, r: 24 }, { kind: "rock", count: 10, min: 42, max: 76, r: 24 }]
    };
    const decorPlan = terrain[stageInfo.theme] || terrain.bramble;
    decorPlan.forEach((plan) => {
      for (let i = 0; i < plan.count; i += 1) {
        const x = random(40, state.width - 40);
        const y = random(110, state.height - 30);
        if (Math.hypot(x - state.width / 2, y - state.height / 2) < 145) {
          i -= 1;
          continue;
        }
        const size = random(plan.min, plan.max);
        const element = document.createElement("div");
        element.className = `decor ${plan.kind}`;
        element.style.width = `${size}px`;
        element.style.height = `${size}px`;
        element.style.transform = `translate3d(${x - size / 2}px, ${y - size / 2}px, 0)`;
        element.style.opacity = String(random(.86, 1));
        decorLayer.appendChild(element);
        state.decorations.push({ kind: plan.kind, x, y, r: plan.r * (size / plan.max), element });
      }
    });
  }

  function updateParticles(dt) {
    for (let i = state.particles.length - 1; i >= 0; i -= 1) {
      const p = state.particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 180 * dt;
      const alpha = clamp(p.life / p.maxLife, 0, 1);
      p.element.style.opacity = String(alpha);
      p.element.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${.45 + alpha})`;
      if (p.life <= 0) {
        p.element.remove();
        state.particles.splice(i, 1);
      }
    }
  }

  function updateFloatingText() {
    for (let i = state.floatingText.length - 1; i >= 0; i -= 1) {
      const item = state.floatingText[i];
      if (performance.now() > item.removeAt) {
        item.element.remove();
        state.floatingText.splice(i, 1);
      }
    }
  }

  function updatePowers() {
    let changed = false;
    const now = performance.now();
    for (const type of Object.keys(state.activePowers)) {
      if (state.activePowers[type] && state.activePowers[type] <= now) {
        state.activePowers[type] = 0;
        if (type === "shield") state.shieldCharges = 0;
        changed = true;
      }
    }
    if (changed) renderPowerStatus(true);
  }

  function updateStageAtmosphere() {
    const shouldUseNightCycle = state.mode === "playing" && getStageInfo().nightCycle;
    const cycle = (state.elapsed % 30000) / 30000;
    const isNight = shouldUseNightCycle && cycle > .5;
    if (state.nightActive !== isNight) {
      state.nightActive = isNight;
      nightOverlay.classList.toggle("active", isNight);
      floatText(isNight ? "NIGHT FALLS" : "DAY BREAKS", state.player.x, state.player.y - 48);
    }
  }

  function render() {
    updatePlayerElement();
    for (const enemy of state.enemies) {
      setEntityTransform(enemy.element, enemy.x, enemy.y, enemy.facing);
      enemy.element.style.zIndex = String(10 + Math.round(enemy.y));
      enemy.element.classList.toggle("vulnerable", getPowerTimeLeft("vulnerable") > 0 && enemy.type !== "boss" && enemy.type !== "final");
    }
    for (const pickup of state.pickups) {
      pickup.element.style.setProperty("--x", `${pickup.x}px`);
      pickup.element.style.setProperty("--y", `${pickup.y}px`);
    }
    updateBossBar();
  }

  function updatePlayerElement() {
    setEntityTransform(playerEl, state.player.x, state.player.y, state.player.facing);
    playerEl.style.zIndex = String(20 + Math.round(state.player.y));
    nightOverlay.style.setProperty("--px", `${state.player.x}px`);
    nightOverlay.style.setProperty("--py", `${state.player.y}px`);
  }

  function updateBossBar() {
    if (!state.boss) {
      bossBar.classList.remove("active");
      return;
    }
    bossBar.classList.add("active");
    bossFill.style.width = `${clamp((state.boss.hp / state.boss.maxHp) * 100, 0, 100)}%`;
  }

  function updateHud() {
    const stageInfo = getStageInfo();
    stageValue.textContent = state.phase === "boss" ? `${state.stage}/${gameTuning.maxStage} B` : `${state.stage}/${gameTuning.maxStage} ${state.stageKills}/${state.killGoal}`;
    areaValue.textContent = stageInfo.name.split(" ")[0];
    scoreValue.textContent = state.save.coins + state.runCoins;
    bestValue.textContent = state.save.bestStage;
    timeValue.textContent = formatTime(state.elapsed);
    updateLowHealthWarning();
    renderPowerStatus();
    if (state.renderedHealth !== state.health || state.renderedMaxHealth !== state.maxHealth) buildHealth();
  }

  function updateLowHealthWarning() {
    const threshold = Math.max(1, Math.ceil(state.maxHealth * .35));
    const active = state.mode === "playing" && state.health > 0 && state.health <= threshold;
    if (state.lowHealthActive === active) return;
    state.lowHealthActive = active;
    playerEl.classList.toggle("low-health", active);
    heartsEl.classList.toggle("low-health", active);
  }

  function updatePowerClasses() {
    playerEl.classList.toggle("boosted", getPowerTimeLeft("boost") > 0 || performance.now() < state.rageUntil);
    playerEl.classList.toggle("shielded", getPowerTimeLeft("shield") > 0 || state.shieldCharges > 0);
  }

  function renderPowerStatus(force = false) {
    const active = Object.keys(powerDefinitions)
      .map((type) => ({ type, left: getPowerTimeLeft(type) }))
      .filter((power) => power.left > 0);
    if (performance.now() < state.rageUntil) active.push({ type: "boost", left: state.rageUntil - performance.now() });
    const signature = active.map((power) => `${power.type}:${Math.ceil(power.left / 1000)}`).join("|");
    if (!force && signature === state.renderedPowers) return;
    state.renderedPowers = signature;
    powerStatus.replaceChildren();
    for (const power of active) {
      const badge = document.createElement("div");
      badge.className = `power-badge ${power.type}`;
      badge.textContent = `${Math.ceil(power.left / 1000)}s`;
      powerStatus.appendChild(badge);
    }
  }

  function renderSkillHud(force = false) {
    if (!skillHud) return;
    const skills = getCharacter().skills || [];
    const now = performance.now();
    const signature = skills
      .map((skill) => `${skill.slot}:${skill.name}:${Math.max(0, Math.ceil(((state.skillCooldowns[skill.slot] || 0) - now) / 1000))}`)
      .join("|");

    if (!force && signature === state.renderedSkillSignature) return;
    state.renderedSkillSignature = signature;
    skillHud.replaceChildren();
    skillHud.classList.toggle("empty", !skills.length);

    for (const skill of skills) {
      const readyAt = state.skillCooldowns[skill.slot] || 0;
      const left = Math.max(0, readyAt - now);
      const button = document.createElement("button");
      button.className = `skill-slot${left ? " cooling" : ""}`;
      button.type = "button";
      button.disabled = Boolean(left);
      button.title = `${skill.name}: ${skill.desc}`;
      button.innerHTML = `
        <span>${skill.slot}</span>
        <strong>${skill.name}</strong>
        <small>${left ? `${Math.ceil(left / 1000)}s` : "Ready"}</small>
      `;
      button.addEventListener("click", () => useSkill(skill.slot));
      skillHud.appendChild(button);
    }
  }

  function buildHealth() {
    heartsEl.replaceChildren();
    for (let i = 0; i < state.maxHealth; i += 1) {
      const heart = document.createElement("span");
      heart.className = `heart-icon${i >= state.health ? " empty" : ""}`;
      heartsEl.appendChild(heart);
    }
    state.renderedHealth = state.health;
    state.renderedMaxHealth = state.maxHealth;
  }

  function updatePlayerSkin() {
    const character = getCharacter();
    const skins = {
      god: "assets/player-god.svg",
      void: "assets/player-void.svg"
    };
    const hue = { blue: "hue-rotate(0deg)", green: "hue-rotate(115deg)", red: "hue-rotate(155deg) saturate(1.8)", yellow: "hue-rotate(205deg) saturate(1.5)", cyan: "hue-rotate(0deg)", god: "brightness(1.1)", void: "drop-shadow(0 0 14px rgba(130, 105, 255, .7))" };
    playerEl.style.backgroundImage = `url("${skins[character.color] || "assets/player.svg"}")`;
    playerEl.style.filter = `drop-shadow(0 10px 10px rgba(4, 40, 44, .28)) ${hue[character.color] || ""}`;
    playerEl.dataset.weapon = state.save.equippedWeapon;
  }

  function clearDynamicElements() {
    state.timers.forEach((id) => window.clearTimeout(id));
    state.timers = [];
    state.enemies = [];
    state.pickups = [];
    state.projectiles = [];
    state.hazards = [];
    state.particles = [];
    state.floatingText = [];
    state.activePowers = {};
    state.renderedPowers = "";
    state.shieldCharges = 0;
    state.boss = null;
    state.divineOverdriveUntil = 0;
    state.nextDivineBeamAt = 0;
    state.lastBlinkAt = 0;
    state.screenEffectUntil = 0;
    enemyLayer.replaceChildren();
    pickupLayer.replaceChildren();
    effectLayer.replaceChildren();
    powerStatus.replaceChildren();
    playerEl.classList.remove("boosted", "shielded", "low-health", "invincible", "divine-overdrive");
    nightOverlay.classList.remove("active");
  }

  function setEntityTransform(element, x, y, facing = 1) {
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${facing})`;
  }

  function burst(x, y, count, colors) {
    for (let i = 0; i < count; i += 1) {
      const element = document.createElement("div");
      const angle = random(0, Math.PI * 2);
      const speed = random(80, 260);
      const size = random(5, 11);
      element.className = "particle";
      element.style.width = `${size}px`;
      element.style.height = `${size}px`;
      element.style.color = colors[i % colors.length];
      element.style.background = colors[i % colors.length];
      effectLayer.appendChild(element);
      const life = random(.34, .72);
      state.particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 70, life, maxLife: life, element });
    }
  }

  function floatText(text, x, y) {
    const element = document.createElement("div");
    element.className = "float-text";
    element.textContent = text;
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    effectLayer.appendChild(element);
    state.floatingText.push({ element, removeAt: performance.now() + 850 });
  }

  function shake() {
    gameWrap.classList.remove("shake");
    void gameWrap.offsetWidth;
    gameWrap.classList.add("shake");
  }

  function flashDamage() {
    damageVignette.classList.remove("active");
    void damageVignette.offsetWidth;
    damageVignette.classList.add("active");
  }

  function showScreen(name) {
    Object.entries(screens).forEach(([screenName, element]) => element.classList.toggle("active", screenName === name));
  }

  function getStageInfo(stage = state.stage) {
    return stageCatalog.find((item) => item.id === stage) || stageCatalog[0];
  }

  function getSpawnDelay(stageInfo = getStageInfo()) {
    return Math.max(340, gameTuning.spawnDelay + stageInfo.spawnDelayBonus - state.stage * 18);
  }

  function getEnemySpeed(stageInfo = getStageInfo()) {
    return gameTuning.enemySpeed + stageInfo.enemySpeedBonus + state.stage * 4;
  }

  function chooseEnemyVariant(stageInfo, fromBoss) {
    if (!fromBoss && Math.random() < stageInfo.ghostChance) return "ghost";
    if (state.stage >= 3 && Math.random() < .18) return "runner";
    if (state.stage >= 5 && Math.random() < .13) return "tank";
    return "normal";
  }

  function applyStageTheme(stageInfo = getStageInfo()) {
    gameWrap.dataset.stage = stageInfo.theme;
  }

  function updateStartPreview() {
    const previewStage = getStageInfo(Math.min(state.save.bestStage || 1, gameTuning.maxStage));
    if (nextStagePreview) nextStagePreview.textContent = previewStage.name;
    if (nextBossPreview) nextBossPreview.textContent = previewStage.bossName;
  }

  function persistSave() {
    state.save = saveStore.normalizeSave(state.save);
    saveStore.persistSave(state.save);
  }

  function queueTimer(callback, delay) {
    const timerId = window.setTimeout(() => {
      state.timers = state.timers.filter((id) => id !== timerId);
      if (state.mode === "playing") callback();
    }, delay);
    state.timers.push(timerId);
  }

  function queueAnyTimer(callback, delay) {
    const timerId = window.setTimeout(() => {
      state.timers = state.timers.filter((id) => id !== timerId);
      callback();
    }, delay);
    state.timers.push(timerId);
  }

  function getWeapon() {
    return getWeaponStats(state.save.equippedWeapon);
  }

  function getCharacter() {
    return characters[state.save.equippedCharacter] || characters.blue;
  }

  function normalizedAim() {
    const len = Math.hypot(state.player.aimX, state.player.aimY) || 1;
    return { x: state.player.aimX / len, y: state.player.aimY / len };
  }

  function getAttackDamage(base) {
    let damage = base;
    if (performance.now() < state.rageUntil) damage *= 2;
    if (getCharacter().god) damage *= 1.35;
    return damage;
  }

  function getPowerTimeLeft(type) {
    return Math.max(0, (state.activePowers[type] || 0) - performance.now());
  }

  function findNearestEnemy(x, y, range) {
    let best = null;
    let bestDistance = range;
    for (const enemy of state.enemies) {
      const distance = Math.hypot(enemy.x - x, enemy.y - y);
      if (distance < bestDistance) {
        best = enemy;
        bestDistance = distance;
      }
    }
    return best;
  }

  function stealCoins(enemy) {
    const now = performance.now();
    if (now < state.invincibleUntil) return;
    const stolen = Math.min(state.runCoins, Math.max(6, Math.round(state.runCoins * .18)));
    state.runCoins -= stolen;
    state.invincibleUntil = now + 950;
    playerEl.classList.add("invincible");
    playSound("damage");
    shake();
    floatText(`-${stolen}`, enemy.x, enemy.y - 28);
  }

  function startMusic() {
    if (musicTimer || state.save.settings?.music === false) return;
    musicStep = 0;
    musicTimer = window.setInterval(() => {
      if (state.mode !== "playing") return;
      const character = getCharacter();
      const track = character.god
        ? [196, 247, 294, 392, 588, 784]
        : character.void
          ? [131, 196, 262, 392, 523]
          : [262, 330, 392, 523];
      const note = track[musicStep % track.length];
      const wave = character.void ? "sawtooth" : character.god ? "triangle" : "sine";
      const volume = character.god || character.void ? .026 : .016;
      playTone(note, .16, wave, volume);
      musicStep += 1;
    }, 780);
  }

  function stopMusic() {
    if (!musicTimer) return;
    window.clearInterval(musicTimer);
    musicTimer = 0;
  }

  function ensureAudioContext() {
    audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === "suspended") audioContext.resume();
    return audioContext;
  }

  function playTone(frequency, duration, wave = "sine", volume = .04, endFrequency = frequency) {
    if (state.save.settings?.music === false && volume <= .03) return;
    if (state.save.settings?.sfx === false && volume > .03) return;
    try {
      const context = ensureAudioContext();
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.type = wave;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, endFrequency), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + .016);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.start(now);
      oscillator.stop(now + duration + .03);
    } catch {
      audioContext = null;
    }
  }

  function playSound(type) {
    if (state.save.settings?.sfx === false) return;
    try {
      audioContext = ensureAudioContext();
      const now = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      const sounds = {
        click: { wave: "triangle", start: 360, end: 460, duration: .07, volume: .055 },
        attack: { wave: "square", start: 260, end: 130, duration: .08, volume: .05 },
        coin: { wave: "sine", start: 720, end: 1180, duration: .12, volume: .08 },
        heal: { wave: "sine", start: 440, end: 820, duration: .18, volume: .075 },
        power: { wave: "square", start: 520, end: 980, duration: .22, volume: .065 },
        boss: { wave: "sawtooth", start: 110, end: 55, duration: .42, volume: .08 },
        victory: { wave: "triangle", start: 440, end: 880, duration: .5, volume: .08 },
        damage: { wave: "sawtooth", start: 130, end: 58, duration: .2, volume: .09 },
        gameOver: { wave: "triangle", start: 210, end: 64, duration: .46, volume: .08 },
        skill: { wave: "sawtooth", start: 260, end: 720, duration: .24, volume: .075 },
        ultimate: { wave: "square", start: 92, end: 860, duration: .62, volume: .09 },
        portal: { wave: "triangle", start: 190, end: 980, duration: .55, volume: .085 }
      };
      const sound = sounds[type] || sounds.click;
      oscillator.type = sound.wave;
      oscillator.frequency.setValueAtTime(sound.start, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, sound.end), now + sound.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(sound.volume, now + .012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration);
      oscillator.start(now);
      oscillator.stop(now + sound.duration + .02);
    } catch {
      audioContext = null;
    }
  }

  function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    return `${Math.floor(totalSeconds / 60)}:${String(totalSeconds % 60).padStart(2, "0")}`;
  }

  function random(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }
})();
