(() => {
  "use strict";

  const {
    gameTuning,
    weapons,
    wings,
    characters,
    stageCatalog,
    powerDefinitions,
    defaultSave
  } = window.VerdantRushContent;
  const saveStore = window.VerdantRushStorage;
  const inputConfig = window.VerdantRushInput;
  const ONE_ABOVE_ARENA_SCALE = 1.75;
  const NIGHT_CYCLE_MS = 90000;

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
  const activeProfileValue = $("activeProfileValue");
  const modeProfileValue = $("modeProfileValue");
  const modeCoinsValue = $("modeCoinsValue");
  const profileSlots = $("profileSlots");
  const stageSelectGrid = $("stageSelectGrid");
  const bossSelectGrid = $("bossSelectGrid");
  const equippedWeaponValue = $("equippedWeaponValue");
  const equippedCharacterValue = $("equippedCharacterValue");
  const equippedWingsValue = $("equippedWingsValue");
  const loadoutWeaponValue = $("loadoutWeaponValue");
  const loadoutCharacterValue = $("loadoutCharacterValue");
  const loadoutWingsValue = $("loadoutWingsValue");
  const loadoutWalletValue = $("loadoutWalletValue");
  const weaponLoadoutGrid = $("weaponLoadoutGrid");
  const characterLoadoutGrid = $("characterLoadoutGrid");
  const wingsLoadoutGrid = $("wingsLoadoutGrid");
  const skillDetails = $("skillDetails");
  const skillHud = $("skillHud");
  const domainMeter = $("domainMeter");
  const weaponStatus = $("weaponStatus");
  const wingStatus = $("wingStatus");
  const leaderboardStats = $("leaderboardStats");
  const touchControls = $("touchControls");
  const joystick = $("joystick");
  const stick = $("stick");
  const touchAttackBtn = $("touchAttackBtn");
  const creditsRewardText = $("creditsRewardText");

  const screens = {
    start: $("startScreen"),
    mode: $("modeScreen"),
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
    inventoryBack: $("inventoryBackBtn"),
    shopBack: $("shopBackBtn"),
    leaderboardBack: $("leaderboardBackBtn"),
    createProfile: $("createProfileBtn"),
    renameProfile: $("renameProfileBtn"),
    adventure: $("adventureBtn"),
    stageMode: $("stageModeBtn"),
    modeInventory: $("modeInventoryBtn"),
    modeLeaderboard: $("modeLeaderboardBtn"),
    modeBack: $("modeBackBtn"),
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
    arenaScale: 1,
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
    renderedDomainSignature: "",
    divineOverdriveUntil: 0,
    nextDivineBeamAt: 0,
    voidBarrierUntil: 0,
    voidDomainCharge: 0,
    voidDomainUntil: 0,
    voidDomainFreezeUntil: 0,
    nextVoidDomainTickAt: 0,
    nextVoidRegenAt: 0,
    lastVoidTrailAt: 0,
    wingReviveReadyAt: 0,
    wingGraceUntil: 0,
    wingReviveCount: 0,
    lastWingGraceTextAt: 0,
    lastBlinkAt: 0,
    deathTaunt: "",
    cage: null,
    screenEffectUntil: 0,
    loadoutReturn: "start",
    leaderboardReturn: "start",
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
  let animationId = 0;
  const audio = window.VerdantRushAudio.createAudioSystem({
    getSettings: () => state.save.settings,
    getMode: () => state.mode,
    getCharacter,
    getStage: () => state.stage,
    getBoss: () => state.boss,
    isDivineOverdriveActive: () => performance.now() < state.divineOverdriveUntil,
    isVoidDomainActive: () => performance.now() < state.voidDomainUntil
  });

  boot();

  function boot() {
    state.save = saveStore.loadSave();
    resize();
    generateDecorations();
    bindEvents();
    renderShop();
    renderLoadout();
    renderLeaderboard();
    renderProfiles();
    renderStageSelect();
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
    buttons.start.addEventListener("click", () => { playSound("click"); renderStageSelect(); showScreen("mode"); });
    buttons.adventure.addEventListener("click", () => { playSound("click"); startRun(1); });
    buttons.stageMode.addEventListener("click", () => { playSound("click"); startRun(getBestReturnStage()); });
    buttons.modeInventory.addEventListener("click", () => openInventory("mode"));
    buttons.modeLeaderboard.addEventListener("click", () => openLeaderboard("mode"));
    buttons.modeBack.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.instructions.addEventListener("click", () => { playSound("click"); showScreen("instructions"); });
    buttons.back.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.inventoryBack.addEventListener("click", () => closeInventory());
    buttons.shopBack.addEventListener("click", () => closeShop());
    buttons.leaderboardBack.addEventListener("click", () => { playSound("click"); showScreen(state.leaderboardReturn === "mode" ? "mode" : "start"); });
    buttons.createProfile.addEventListener("click", createProfile);
    buttons.renameProfile.addEventListener("click", renameActiveProfile);
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
    const scale = state.arenaScale || 1;
    state.width = rect.width * scale;
    state.height = rect.height * scale;
    gameWrap.style.setProperty("--arena-scale", scale.toFixed(3));
    gameWrap.style.setProperty("--arena-view-scale", (1 / scale).toFixed(4));
    clampPlayer();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (inputConfig.handledKeys.has(key)) {
      event.preventDefault();
    }
    if (key === "escape") {
      if (state.mode === "playing") pauseGame();
      else if (state.mode === "paused") resumeGame();
      return;
    }
    if (inputConfig.attackKeys.includes(key) && state.mode === "playing") {
      state.attackQueued = true;
    }
    if (inputConfig.skillKeys.includes(key) && state.mode === "playing") {
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

  function startRun(stage, options = {}) {
    state.runCoins = 0;
    state.bankedThisRun = 0;
    state.voidDomainCharge = 0;
    state.renderedDomainSignature = "";
    warmAudio();
    startStage(stage, options);
    startMusic();
  }

  function startStage(stage, options = {}) {
    state.arenaScale = 1;
    gameWrap.classList.remove("one-above-arena", "one-above-wrath", "void-domain-active");
    resize();
    clearDynamicElements();
    const stageInfo = getStageInfo(stage);
    applyStageTheme(stageInfo);
    resetNightOverlayInstant();
    generateDecorations(stageInfo);
    const character = getCharacter();
    const wing = getEquippedWings();
    state.mode = "playing";
    state.stage = stageInfo.id;
    state.phase = "mobs";
    state.elapsed = 0;
    state.stageKills = 0;
    state.killGoal = stageInfo.killGoal;
    state.maxHealth = Math.max(2, 4 + gameTuning.healthBonus + character.health + (wing.health || 0));
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
    state.voidBarrierUntil = 0;
    state.voidDomainUntil = 0;
    state.voidDomainFreezeUntil = 0;
    state.nextVoidDomainTickAt = 0;
    state.nextVoidRegenAt = character.void ? performance.now() + (character.regenMs || 6200) : 0;
    state.lastVoidTrailAt = 0;
    state.wingReviveReadyAt = 0;
    state.wingGraceUntil = 0;
    state.wingReviveCount = 0;
    state.lastWingGraceTextAt = 0;
    state.lastBlinkAt = 0;
    state.deathTaunt = "";
    state.cage = null;
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
    playerEl.classList.remove("invincible", "boosted", "shielded", "low-health", "divine-overdrive", "void-barrier", "wing-grace");
    gameWrap.classList.remove("one-above-arena", "one-above-wrath", "void-domain-active");
    resetNightOverlayInstant();
    bossBar.classList.remove("active");
    updateHud();
    showScreen(null);
    if (character.void) {
      activateVoidBarrier(character.barrierMs || 4800, "INFINITY");
      createScreenEffect("void-blue compact", "INFINITY");
    }
    if (options.bossOnly || stageInfo.superboss) {
      spawnBoss();
    } else {
      spawnEnemy();
      spawnEnemy();
    }
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
    warmAudio();
    playSound("click");
    state.mode = "playing";
    showScreen(null);
    startMusic();
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
    updateVoidRegeneration();
    updateVoidDomain(dt);
    updateParticles(dt);
    updateFloatingText();
    if (performance.now() > state.invincibleUntil) playerEl.classList.remove("invincible");
    updateLowHealthWarning();
    updatePowerClasses();
    renderSkillHud();
    renderDomainMeter();
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
    const wing = getEquippedWings();
    const now = performance.now();
    const speedBoost = getPowerTimeLeft("boost") > 0 ? 1.34 : 1;
    const divineActive = now < state.divineOverdriveUntil;
    const voidDomainActive = character.void && now < state.voidDomainUntil;
    const wingGraceActive = now < state.wingGraceUntil;
    const divineBoost = divineActive ? 1.42 : 1;
    const voidDomainBoost = voidDomainActive ? 1.42 : 1;
    const wingBoost = wingGraceActive ? 1.42 : 1;
    const arenaBoost = state.arenaScale > 1 ? state.arenaScale : 1;
    const baseSpeed = state.player.speed + character.speed + (wing.speed || 0);
    const targetVx = dx * baseSpeed * speedBoost * divineBoost * voidDomainBoost * wingBoost * arenaBoost;
    const targetVy = dy * baseSpeed * speedBoost * divineBoost * voidDomainBoost * wingBoost * arenaBoost;
    const smoothing = 1 - Math.pow(0.0009, dt);
    state.player.vx += (targetVx - state.player.vx) * smoothing;
    state.player.vy += (targetVy - state.player.vy) * smoothing;
    state.player.x += state.player.vx * dt;
    state.player.y += state.player.vy * dt;
    if (divineActive && Math.hypot(dx, dy) > .1 && now - state.lastBlinkAt > 520) {
      state.lastBlinkAt = now;
      const oldX = state.player.x;
      const oldY = state.player.y;
      state.player.x += dx * 34;
      state.player.y += dy * 34;
      clampPlayer();
      createBlinkTrail(oldX, oldY, state.player.x, state.player.y);
    }
    if (voidDomainActive && Math.hypot(dx, dy) > .1 && now - state.lastVoidTrailAt > 135) {
      state.lastVoidTrailAt = now;
      createVoidStepTrail(state.player.x - dx * 42, state.player.y - dy * 42, state.player.x + dx * 18, state.player.y + dy * 18);
    }
    if (Math.abs(state.player.vx) > 8) state.player.facing = state.player.vx >= 0 ? 1 : -1;
    clampPlayer();
    applyCageConstraint();
  }

  function clampPlayer() {
    const pad = state.player.r + 8;
    state.player.x = clamp(state.player.x, pad, state.width - pad);
    state.player.y = clamp(state.player.y, pad + 60, state.height - pad);
  }

  function applyCageConstraint() {
    const cage = state.cage;
    if (!cage) return;
    if (performance.now() > cage.until) {
      releaseCage();
      return;
    }
    const half = cage.size / 2;
    const gap = cage.gap;
    const left = cage.x - half;
    const right = cage.x + half;
    const top = cage.y - half;
    const bottom = cage.y + half;
    const escape = getCageEscape(cage, { left, right, top, bottom, gap });
    if (escape) {
      state.player.x = escape.x;
      state.player.y = escape.y;
      releaseCage();
      floatText("ESCAPED", state.player.x, state.player.y - 54);
      return;
    }
    state.player.x = clamp(state.player.x, left + state.player.r, right - state.player.r);
    state.player.y = clamp(state.player.y, top + state.player.r, bottom - state.player.r);
  }

  function getCageEscape(cage, bounds) {
    const side = cage.exitSide || "right";
    const halfGap = bounds.gap / 2;
    if (side === "left" && Math.abs(state.player.y - cage.y) < halfGap && state.player.x <= bounds.left + state.player.r + 8) {
      return {
        x: clamp(bounds.left - state.player.r - 14, state.player.r + 8, state.width - state.player.r - 8),
        y: state.player.y
      };
    }
    if (side === "right" && Math.abs(state.player.y - cage.y) < halfGap && state.player.x >= bounds.right - state.player.r - 8) {
      return {
        x: clamp(bounds.right + state.player.r + 14, state.player.r + 8, state.width - state.player.r - 8),
        y: state.player.y
      };
    }
    if (side === "top" && Math.abs(state.player.x - cage.x) < halfGap && state.player.y <= bounds.top + state.player.r + 8) {
      return {
        x: state.player.x,
        y: clamp(bounds.top - state.player.r - 14, state.player.r + 68, state.height - state.player.r - 8)
      };
    }
    if (side === "bottom" && Math.abs(state.player.x - cage.x) < halfGap && state.player.y >= bounds.bottom - state.player.r - 8) {
      return {
        x: state.player.x,
        y: clamp(bounds.bottom + state.player.r + 14, state.player.r + 68, state.height - state.player.r - 8)
      };
    }
    return null;
  }

  function releaseCage() {
    if (state.cage?.element) state.cage.element.remove();
    state.cage = null;
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

  function activateVoidBarrier(duration = 4800, label = "INFINITY") {
    const now = performance.now();
    state.voidBarrierUntil = Math.max(state.voidBarrierUntil || 0, now + duration);
    playerEl.classList.add("void-barrier");
    createShockwave(state.player.x, state.player.y, 360, "void-blue void-barrier-wave", label);
    burst(state.player.x, state.player.y, 36, ["#ffffff", "#65e5ff", "#8d59ff", "#111827"]);
  }

  function addVoidDomainCharge(amount) {
    if (!getCharacter().void || performance.now() < state.voidDomainUntil) return;
    const previous = state.voidDomainCharge;
    state.voidDomainCharge = clamp(state.voidDomainCharge + amount, 0, 100);
    if (previous < 100 && state.voidDomainCharge >= 100) {
      createScreenEffect("void-purple compact", "DOMAIN READY");
      floatText("DOMAIN READY", state.player.x, state.player.y - 76);
      playSound("power");
    }
    renderDomainMeter(true);
    renderSkillHud(true);
  }

  function activateVoidDomainExpansion() {
    const now = performance.now();
    const character = getCharacter();
    const duration = character.domainDuration || 9000;
    state.voidDomainCharge = 0;
    state.voidDomainUntil = now + duration;
    state.voidDomainFreezeUntil = now + 1550;
    state.nextVoidDomainTickAt = now + 1020;
    state.lastVoidTrailAt = 0;
    state.voidBarrierUntil = Math.max(state.voidBarrierUntil || 0, now + duration);
    state.invincibleUntil = Math.max(state.invincibleUntil || 0, now + duration);
    gameWrap.classList.add("void-domain-active");
    playerEl.classList.add("void-barrier");
    accelerateVoidSkillCooldowns(now);
    createVoidDomainCutin(duration);
    createScreenEffect("void-domain", "DOMAIN EXPANSION");
    createShockwave(state.player.x, state.player.y, 980, "void-purple void-erasure", "DOMAIN");
    pullEnemies(state.player.x, state.player.y, 900, 260, 0);
    shake();
    queueTimer(() => shake(), 180);
    queueTimer(() => shake(), 430);
    queueTimer(() => finishVoidDomainExpansion(), duration - 320);
    playSound("ultimate");
    renderDomainMeter(true);
    renderSkillHud(true);
  }

  function createVoidDomainCutin(duration) {
    const cutin = document.createElement("div");
    cutin.className = "void-domain-cutin";
    cutin.innerHTML = "<span>DOMAIN EXPANSION</span><strong>INFINITE VOID</strong><i><b></b></i>";
    gameWrap.appendChild(cutin);
    queueTimer(() => cutin.remove(), 1900);

    const field = document.createElement("div");
    field.className = "void-domain-field";
    field.style.setProperty("--domain-duration", `${duration}ms`);
    effectLayer.appendChild(field);
    queueTimer(() => field.remove(), duration + 420);
  }

  function createVoidEclipseCutin() {
    const cutin = document.createElement("div");
    cutin.className = "void-domain-cutin void-eclipse-cutin";
    cutin.innerHTML = "<span>LIMITLESS</span><strong>ECLIPSE</strong><i><b></b></i>";
    gameWrap.appendChild(cutin);
    queueTimer(() => cutin.remove(), 1250);
  }

  function updateVoidRegeneration() {
    const character = getCharacter();
    if (!character.void || state.mode !== "playing") return;
    const now = performance.now();
    const interval = character.regenMs || 6200;
    if (!state.nextVoidRegenAt) state.nextVoidRegenAt = now + interval;
    if (state.health >= state.maxHealth) {
      state.nextVoidRegenAt = Math.max(state.nextVoidRegenAt, now + interval * .5);
      return;
    }
    if (now < state.nextVoidRegenAt) return;
    state.health = Math.min(state.maxHealth, state.health + 1);
    state.renderedHealth = -1;
    state.nextVoidRegenAt = now + interval;
    createShockwave(state.player.x, state.player.y, 250, "void-blue void-barrier-wave", "REVERSE");
    burst(state.player.x, state.player.y, 26, ["#ffffff", "#65e5ff", "#8d59ff"]);
    floatText("+VOID HP", state.player.x, state.player.y - 62);
    playSound("heal");
  }

  function updateVoidDomain(dt) {
    const now = performance.now();
    const active = getCharacter().void && now < state.voidDomainUntil;
    gameWrap.classList.toggle("void-domain-active", active);
    if (!active) return;
    if (now >= state.nextVoidDomainTickAt) {
      state.nextVoidDomainTickAt = now + 560;
      pullEnemies(state.player.x, state.player.y, 900, 145, 0);
      const bossDamage = state.boss ? getVoidDomainBossDamage(state.boss, 380, .0085, 760) : 380;
      damageEnemiesInRadius(state.player.x, state.player.y, 900, 110, bossDamage);
      createShockwave(state.player.x, state.player.y, 470, "void-purple void-erasure", "");
      if (Math.random() < .64) {
        const angle = random(0, Math.PI * 2);
        createBeamAt(state.player.x, state.player.y, "void-purple void-erasure", angle, Math.max(state.width, state.height) * .95, 78, 540, "");
      }
    }
  }

  function finishVoidDomainExpansion() {
    if (!getCharacter().void || performance.now() > state.voidDomainUntil + 400) return;
    createScreenEffect("void-domain void-domain-end", "VOID ERASURE");
    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8;
      createBeamAt(state.player.x, state.player.y, "void-purple void-erasure", angle, Math.max(state.width, state.height) * 1.15, 96, 760, "");
    }
    const bossDamage = state.boss ? getVoidDomainBossDamage(state.boss, 1700, .045, 3400) : 1700;
    damageEnemiesInRadius(state.player.x, state.player.y, 9999, 360, bossDamage);
    createShockwave(state.player.x, state.player.y, 1120, "void-purple void-erasure", "ERASE");
    shake();
  }

  function getVoidDomainBossDamage(boss, normalDamage, superbossPercent, minimum) {
    if (boss?.superboss && boss.superPhase === 2) return Math.max(minimum, boss.maxHp * superbossPercent);
    if (boss?.type === "final") return Math.round(normalDamage * 1.35);
    return normalDamage;
  }

  function getVoidDomainEnemyFactor(now = performance.now()) {
    if (!getCharacter().void || now >= state.voidDomainUntil) return 1;
    if (now < state.voidDomainFreezeUntil) return .02;
    return .22;
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

  function performGodRealityCrack(aim) {
    const length = Math.max(state.width, state.height) * 1.5;
    const centerX = state.player.x;
    const centerY = state.player.y;
    const angles = [
      Math.atan2(aim.y, aim.x),
      Math.atan2(aim.y, aim.x) + Math.PI / 2,
      Math.atan2(aim.y, aim.x) - Math.PI / 3
    ];

    createScreenEffect("reality-crack compact", "REALITY CRACK");
    for (const angle of angles) {
      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      createBeamAt(centerX - dir.x * 120, centerY - dir.y * 120, "reality-cut", angle, length, 138, 920, "");
      damageEnemiesInBeamFrom(centerX - dir.x * 120, centerY - dir.y * 120, dir, length, 166, 360, 880);
    }

    damageEnemiesInRadius(centerX, centerY, Math.max(state.width, state.height), 130, 320);
    if (state.boss) {
      const execute = canExecuteBoss(state.boss, .24);
      const bossDamage = getDivineBossDamage(state.boss, .32, .095, 2200);
      damageEnemy(state.boss, execute ? state.boss.hp + 1 : bossDamage);
    }
    state.enemyHasteUntil = 0;
    shake();
    queueTimer(() => shake(), 160);
    queueTimer(() => shake(), 360);
    playSound("reality");
  }

  function getSkillCooldown(skill, now = performance.now()) {
    const character = getCharacter();
    if (character.void && skill.effect !== "voidDomain" && now < state.voidDomainUntil) {
      const multiplier = skill.effect === "voidEclipse" ? .3 : .38;
      const floor = skill.effect === "voidEclipse" ? 5600 : 1700;
      return Math.max(floor, skill.cooldown * multiplier);
    }
    return skill.cooldown;
  }

  function accelerateVoidSkillCooldowns(now = performance.now()) {
    const character = getCharacter();
    if (!character.void) return;
    for (const skill of character.skills || []) {
      if (skill.effect === "voidDomain") continue;
      const readyAt = state.skillCooldowns[skill.slot] || 0;
      const reducedReadyAt = now + getSkillCooldown(skill, now);
      if (readyAt > reducedReadyAt) state.skillCooldowns[skill.slot] = reducedReadyAt;
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
    if (skill.effect === "voidDomain" && now < state.voidDomainUntil) {
      floatText("DOMAIN ACTIVE", state.player.x, state.player.y - 54);
      return;
    }
    if (skill.effect === "voidDomain" && state.voidDomainCharge < 100) {
      floatText(`DOMAIN ${Math.floor(state.voidDomainCharge)}%`, state.player.x, state.player.y - 54);
      playSound("click");
      renderSkillHud(true);
      return;
    }
    if (skill.effect === "voidEclipse" && now >= state.voidDomainUntil) {
      floatText("DOMAIN ONLY", state.player.x, state.player.y - 54);
      playSound("click");
      renderSkillHud(true);
      return;
    }

    state.skillCooldowns[slot] = now + getSkillCooldown(skill, now);
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
        x: clamp(state.player.x + aim.x * 230, 80, state.width - 80),
        y: clamp(state.player.y + aim.y * 230, 130, state.height - 80)
      };
      createScreenEffect("void-blue compact", "LIMIT BLUE");
      activateVoidBarrier(900, "");
      createBeam("void-blue void-lapse", aim, 760, 190, 680, "BLUE");
      pullEnemies(point.x, point.y, 660, 340, 130);
      damageEnemiesInBeam(aim, 760, 205, 120, 180);
      createShockwave(point.x, point.y, 320, "void-blue void-lapse", "BLUE");
      queueTimer(() => createShockwave(point.x, point.y, 420, "void-blue void-lapse", ""), 140);
      addVoidDomainCharge(7);
      playSound("skill");
    } else if (effect === "voidRed") {
      createScreenEffect("void-red compact", "REVERSAL RED");
      createBeam("void-red void-reversal", aim, 540, 176, 520, "RED");
      createShockwave(state.player.x, state.player.y, 560, "void-red void-reversal", "RED");
      pushEnemies(state.player.x, state.player.y, 560, 430, 195);
      damageEnemiesInRadius(state.player.x, state.player.y, 540, 170, 270);
      shake();
      queueTimer(() => shake(), 180);
      addVoidDomainCharge(9);
      playSound("skill");
    } else if (effect === "voidPurple") {
      createScreenEffect("void-purple", "VOID PURPLE");
      const side = { x: -aim.y, y: aim.x };
      const bluePoint = { x: state.player.x + side.x * 74, y: state.player.y + side.y * 74 };
      const redPoint = { x: state.player.x - side.x * 74, y: state.player.y - side.y * 74 };
      const domainActive = now < state.voidDomainUntil;
      const bossDamage = state.boss ? getVoidPurpleBossDamage(state.boss, domainActive) : 980;
      createShockwave(bluePoint.x, bluePoint.y, 310, "void-blue void-lapse", "BLUE");
      createShockwave(redPoint.x, redPoint.y, 310, "void-red void-reversal", "RED");
      pullEnemies(state.player.x, state.player.y, 520, 170, 0);
      shake();
      queueTimer(() => {
        const length = Math.max(state.width, state.height) * 1.55;
        createBeam("void-purple void-erasure", aim, length, 310, 1280, "VOID PURPLE");
        damageEnemiesInBeam(aim, length, 340, 680, bossDamage);
        damageEnemiesInRadius(state.player.x, state.player.y, 430, 170, Math.min(bossDamage * .24, 1300));
        createShockwave(state.player.x, state.player.y, domainActive ? 920 : 760, "void-purple void-erasure", "PURPLE");
        shake();
      }, 260);
      queueTimer(() => shake(), 520);
      addVoidDomainCharge(12);
      playSound("ultimate");
    } else if (effect === "voidDomain") {
      activateVoidDomainExpansion();
    } else if (effect === "voidEclipse") {
      createVoidEclipseCutin();
      createScreenEffect("void-domain void-domain-end", "LIMITLESS ECLIPSE");
      pullEnemies(state.player.x, state.player.y, 1100, 360, 0);
      createShockwave(state.player.x, state.player.y, 900, "void-purple void-eclipse", "EYE OPEN");
      state.voidDomainFreezeUntil = Math.max(state.voidDomainFreezeUntil, now + 950);
      for (let i = 0; i < 12; i += 1) {
        const angle = (Math.PI * 2 * i) / 12;
        queueTimer(() => {
          const className = i % 3 === 0 ? "void-blue void-lapse void-eclipse" : i % 3 === 1 ? "void-red void-reversal void-eclipse" : "void-purple void-erasure void-eclipse";
          createBeamAt(state.player.x, state.player.y, className, angle, Math.max(state.width, state.height) * 1.24, 92, 760, i === 0 ? "ECLIPSE" : "");
        }, i * 38);
      }
      queueTimer(() => {
        const bossDamage = state.boss ? getVoidEclipseBossDamage(state.boss) : 2200;
        damageEnemiesInRadius(state.player.x, state.player.y, 9999, 980, bossDamage);
        createShockwave(state.player.x, state.player.y, 1280, "void-purple void-eclipse", "COLLAPSE");
        burst(state.player.x, state.player.y, 82, ["#ffffff", "#65e5ff", "#8d59ff", "#05060c"]);
        shake();
      }, 420);
      queueTimer(() => shake(), 180);
      queueTimer(() => shake(), 560);
      playSound("reality");
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
        const execute = canExecuteBoss(boss, .45);
        const bossDamage = getDivineBossDamage(boss, .28, .075, 1600);
        createBeam("god", aim, Math.max(state.width, state.height) * 1.2, 180, 950, execute ? "ABSOLUTE VERDICT" : "DIVINE CUT");
        damageEnemy(boss, execute ? boss.hp + 1 : bossDamage);
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
    } else if (effect === "godRealityCrack") {
      performGodRealityCrack(aim);
    }
  }

  function canExecuteBoss(boss, normalThreshold) {
    const threshold = boss.superboss && boss.superPhase === 2 ? .08 : normalThreshold;
    return boss.hp <= boss.maxHp * threshold;
  }

  function getDivineBossDamage(boss, normalPercent, superbossPercent, minimum) {
    const percent = boss.superboss && boss.superPhase === 2 ? superbossPercent : normalPercent;
    return Math.max(minimum, boss.maxHp * percent);
  }

  function hasQuietDivineImmunity(character = getCharacter()) {
    return Boolean(character.god && state.stage < 10);
  }

  function getVoidPurpleBossDamage(boss, domainActive = false) {
    if (boss?.superboss && boss.superPhase === 2) {
      const percent = domainActive ? .058 : .04;
      const minimum = domainActive ? 5200 : 3600;
      return Math.max(minimum, boss.maxHp * percent);
    }
    if (boss?.type === "final") return domainActive ? 1450 : 980;
    return domainActive ? 980 : 720;
  }

  function getVoidEclipseBossDamage(boss) {
    if (boss?.superboss && boss.superPhase === 2) return Math.max(6600, boss.maxHp * .07);
    if (boss?.type === "final") return 1900;
    return 1350;
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

  function createPrimeWarning(title, detail, duration = 2200) {
    gameWrap.querySelectorAll(".prime-warning").forEach((item) => item.remove());
    const element = document.createElement("div");
    element.className = "prime-warning";
    element.innerHTML = `<strong>${title}</strong><span>${detail}</span>`;
    gameWrap.appendChild(element);
    queueAnyTimer(() => element.remove(), duration);
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

  function createVoidStepTrail(fromX, fromY, toX, toY) {
    const element = document.createElement("div");
    element.className = "blink-trail void-step-trail";
    element.style.setProperty("--x1", `${fromX}px`);
    element.style.setProperty("--y1", `${fromY}px`);
    element.style.setProperty("--x2", `${toX}px`);
    element.style.setProperty("--y2", `${toY}px`);
    element.style.setProperty("--rot", `${Math.atan2(toY - fromY, toX - fromX)}rad`);
    effectLayer.appendChild(element);
    setTimeout(() => element.remove(), 430);
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
    const now = performance.now();
    const freezeFactor = getPowerTimeLeft("freeze") > 0 ? .18 : 1;
    const domainFactor = getVoidDomainEnemyFactor(now);
    const hasteFactor = now < state.enemyHasteUntil ? 1.34 : 1;
    for (const enemy of [...state.enemies]) {
      const channeling = enemy.channelingUntil && now < enemy.channelingUntil;
      const dx = channeling ? 0 : state.player.x - enemy.x;
      const dy = channeling ? 0 : state.player.y - enemy.y;
      const distance = Math.hypot(dx, dy) || 1;
      let moveX = dx / distance;
      let moveY = dy / distance;
      if (enemy.type === "boss" || enemy.type === "final") {
        if (enemy.superboss && enemy.superPhase === 2) {
          maybeActivateOneAboveWrath(enemy);
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + (enemy.wrathUnlocked ? 96 : 48) * dt);
        }
        enemy.skillTimer -= dt * 1000 * Math.max(domainFactor, enemy.superboss ? .5 : .2);
        if (enemy.skillTimer <= 0) {
          bossSkill(enemy);
          enemy.skillTimer = enemy.nextSkillDelay || (enemy.superboss && enemy.superPhase === 2 ? (enemy.wrathUnlocked ? 1050 : 1450) : enemy.type === "final" ? 1050 : 2200);
          enemy.nextSkillDelay = 0;
        }
      } else if (enemy.variant === "miniBoss") {
        enemy.skillTimer -= dt * 1000 * Math.max(domainFactor, .2);
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
      const speed = getEnemySpeed(stageInfo) * enemy.speedMultiplier * bossFactor * ghostFactor * freezeFactor * domainFactor * hasteFactor;
      enemy.x += (moveX / len) * speed * dt;
      enemy.y += (moveY / len) * speed * dt;
      enemy.x = clamp(enemy.x, enemy.r, state.width - enemy.r);
      enemy.y = clamp(enemy.y, enemy.r + 62, state.height - enemy.r);
      enemy.facing = moveX >= 0 ? 1 : -1;
      if (!channeling && distance < enemy.r + state.player.r) {
        if (getPowerTimeLeft("vulnerable") > 0 && enemy.type !== "boss" && enemy.type !== "final") damageEnemy(enemy, 999);
        else if (enemy.type === "ghost") stealCoins(enemy);
        else damagePlayer(enemy.damage || gameTuning.damage);
      }
    }
  }

  function bossSkill(boss) {
    if (boss.superboss) {
      oneAboveSkill(boss);
      return;
    }
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
      const element = boss.element;
      element?.classList.add("mirror-phase");
      createShockwave(oldX, oldY, 280, "mirror", "AFTERIMAGE");
      burst(oldX, oldY, 24, ["#ffffff", "#d8f7ff", "#c8a0ff"]);
      boss.x = point.x;
      boss.y = point.y;
      if (element) setEntityTransform(element, boss.x, boss.y, boss.facing);
      createShockwave(boss.x, boss.y, 360, "mirror", "CROWN");
      createHazard(oldX, oldY, 60, 460, 360, 1, "mirror");
      createHazard(boss.x, boss.y, 66, 680, 380, 1, "mirror");
      burst(boss.x, boss.y, 34, ["#ffffff", "#b9f5ff", "#b57cff"]);
      spawnEnemy(true, "runner");
      floatText("MIRROR STEP", boss.x, boss.y - 70);
      queueTimer(() => element?.classList.remove("mirror-phase"), 520);
    } else if (skill === "haste") {
      state.enemyHasteUntil = performance.now() + 3800;
      spawnEnemy(true);
      spawnEnemy(true, "runner");
      floatText("FAST FORWARD", boss.x, boss.y - 70);
    }

  }

  function oneAboveSkill(boss) {
    if (boss.superPhase === 1) {
      createHazard(state.player.x, state.player.y, 56, 760, 420, 1, "prime");
      floatText("KNEEL", boss.x, boss.y - 84);
      return;
    }

    const skill = randomOneAboveSkill(boss);
    boss.oneAboveCasts = (boss.oneAboveCasts || 0) + 1;
    if (skill === "decree") {
      if (createAbsoluteDecree(boss)) {
        boss.nextSkillDelay = isOneAboveWrath(boss) ? 3600 : 4700;
        boss.castsSinceCage = (boss.castsSinceCage || 0) + 1;
      } else {
        createPrimeWingSweep(boss);
        boss.nextSkillDelay = 1700;
      }
    } else if (skill === "wrathRend") {
      createAboveAllRend(boss);
      boss.castsSinceCage = (boss.castsSinceCage || 0) + 1;
      boss.nextSkillDelay = 1350;
    } else if (skill === "beams") {
      createPrimeBeamPattern(boss);
      boss.castsSinceCage = (boss.castsSinceCage || 0) + 1;
      boss.nextSkillDelay = isOneAboveWrath(boss) ? 1180 : 1550;
    } else if (skill === "cage") {
      if (createPrimeCage(boss)) {
        boss.castsSinceCage = 0;
        boss.cageCooldownUntil = performance.now() + (isOneAboveWrath(boss) ? 6400 : 8500);
        boss.nextSkillDelay = isOneAboveWrath(boss) ? 1500 : 2100;
      } else {
        createPrimeRain(boss);
        boss.nextSkillDelay = 1550;
      }
    } else if (skill === "wings") {
      createPrimeWingSweep(boss);
      boss.castsSinceCage = (boss.castsSinceCage || 0) + 1;
      boss.nextSkillDelay = isOneAboveWrath(boss) ? 1280 : 1750;
    } else {
      createPrimeRain(boss);
      boss.castsSinceCage = (boss.castsSinceCage || 0) + 1;
      boss.nextSkillDelay = isOneAboveWrath(boss) ? 1180 : 1550;
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

  function randomOneAboveSkill(boss) {
    const now = performance.now();
    const canDecree = !boss.decreeActive && now >= (boss.decreeCooldownUntil || 0);
    const canCage = !state.cage && now >= (boss.cageCooldownUntil || 0);
    if (canCage && (boss.castsSinceCage || 0) >= 3) return "cage";
    const skills = ["beams", "rain", "wings", "beams", "wings"];
    if (isOneAboveWrath(boss)) skills.push("wrathRend", "wrathRend", "rain", "beams");
    if (canCage) skills.push("cage", "cage");
    if (canDecree) skills.push("decree", ...(isOneAboveWrath(boss) ? ["decree"] : []));
    return skills[Math.floor(random(0, skills.length))];
  }

  function isOneAboveWrath(boss = state.boss) {
    return Boolean(boss?.superboss && boss.superPhase === 2 && boss.wrathUnlocked);
  }

  function oneAboveDamage(boss, amount) {
    return isOneAboveWrath(boss) ? amount * 2 : amount;
  }

  function oneAboveEffectClass(boss, className) {
    return isOneAboveWrath(boss) ? `${className} prime-wrath` : className;
  }

  function maybeActivateOneAboveWrath(boss) {
    if (!boss?.superboss || boss.superPhase !== 2 || boss.wrathUnlocked || boss.hp > boss.maxHp * .3) return;
    boss.wrathUnlocked = true;
    boss.damage = 8;
    boss.speedMultiplier = .5;
    boss.skillTimer = Math.min(boss.skillTimer || 0, 520);
    boss.nextSkillDelay = 0;
    boss.decreeCooldownUntil = Math.min(boss.decreeCooldownUntil || 0, performance.now() + 1800);
    boss.cageCooldownUntil = Math.min(boss.cageCooldownUntil || 0, performance.now() + 1200);
    boss.element.classList.add("one-above-wrath");
    gameWrap.classList.add("one-above-wrath");
    createScreenEffect("absolute-decree prime-wrath compact", "SOVEREIGN WRATH");
    createPrimeWarning("SOVEREIGN WRATH", "Below 30 percent, all laws become violent.", 2300);
    createShockwave(boss.x, boss.y, 1380, "prime prime-wrath", "30%");
    burst(boss.x, boss.y, 130, ["#ffffff", "#ff3f6e", "#b24cff", "#33114d", "#ffe66d"]);
    floatText("THE ABOVE ALL AWAKENS", boss.x, boss.y - 190);
    playSound("reality");
    shake();
    queueTimer(() => {
      if (state.boss === boss && boss.hp > 0 && boss.superPhase === 2) createAboveAllRend(boss);
    }, 620);
  }

  function createPrimeBeamPattern(boss) {
    const base = Math.atan2(state.player.y - boss.y, state.player.x - boss.x);
    const angles = [base, base + .44, base - .44];
    angles.forEach((angle, index) => {
      const startX = boss.x + Math.cos(angle) * 60;
      const startY = boss.y + Math.sin(angle) * 60;
      createTelegraphedBeam(startX, startY, angle, Math.max(state.width, state.height) * 1.35, isOneAboveWrath(boss) ? 108 : 86, isOneAboveWrath(boss) ? 620 + index * 90 : 820 + index * 120, 650, oneAboveDamage(boss, 2), oneAboveEffectClass(boss, "prime-beam"));
    });
    floatText(isOneAboveWrath(boss) ? "LIGHT RETURNS TO ME" : "BORROWED LIGHT", boss.x, boss.y - 126);
    shake();
  }

  function createPrimeRain(boss) {
    const wrath = isOneAboveWrath(boss);
    const count = wrath ? 12 : 8;
    for (let i = 0; i < count; i += 1) {
      queueTimer(() => {
        const point = i % 3 === 0 ? { x: state.player.x, y: state.player.y } : randomNearPlayer(wrath ? 340 : 260);
        createHazard(point.x, point.y, wrath ? 82 : 70, wrath ? 390 : 560, 420, oneAboveDamage(boss, 2), oneAboveEffectClass(boss, "prime"));
      }, i * (wrath ? 105 : 150));
    }
    createShockwave(boss.x, boss.y, wrath ? 640 : 480, oneAboveEffectClass(boss, "prime"), wrath ? "LAW BLEEDS" : "LAW DESCENDS");
    floatText(wrath ? "MERCY HAS EXPIRED" : "MERCY IS A PRIVILEGE", boss.x, boss.y - 126);
  }

  function createPrimeWingSweep(boss) {
    const centerY = clamp(state.player.y, 190, state.height - 190);
    const wrath = isOneAboveWrath(boss);
    createTelegraphedBeam(0, centerY - 120, 0, state.width, wrath ? 140 : 112, wrath ? 560 : 720, 720, oneAboveDamage(boss, 2), oneAboveEffectClass(boss, "prime-beam"));
    createTelegraphedBeam(state.width, centerY + 120, Math.PI, state.width, wrath ? 140 : 112, wrath ? 770 : 980, 720, oneAboveDamage(boss, 2), oneAboveEffectClass(boss, "prime-beam"));
    createTelegraphedBeam(boss.x, 90, Math.PI / 2, state.height, wrath ? 166 : 136, wrath ? 1040 : 1320, 820, oneAboveDamage(boss, 3), oneAboveEffectClass(boss, "prime-beam"));
    if (wrath) createTelegraphedBeam(boss.x, state.height - 90, -Math.PI / 2, state.height, 128, 1220, 720, oneAboveDamage(boss, 2), oneAboveEffectClass(boss, "prime-beam"));
    createShockwave(boss.x, boss.y, wrath ? 980 : 760, oneAboveEffectClass(boss, "prime"), wrath ? "WINGS OF RUIN" : "WINGS OF CREATION");
    floatText(wrath ? "HEAVEN BREAKS BENEATH ME" : "EVERY HEAVEN CASTS MY SHADOW", boss.x, boss.y - 150);
    shake();
  }

  function createAbsoluteDecree(boss) {
    const now = performance.now();
    if (boss.decreeActive || now < (boss.decreeCooldownUntil || 0)) return false;
    const wrath = isOneAboveWrath(boss);
    const decreeDelay = 3000;
    boss.decreeActive = true;
    boss.decreeCooldownUntil = now + (wrath ? 7600 : 8400);
    const center = { x: state.width / 2, y: Math.max(300, state.height * .42) };
    boss.x = center.x;
    boss.y = center.y;
    boss.vx = 0;
    boss.vy = 0;
    boss.channelingUntil = now + decreeDelay + 260;
    setEntityTransform(boss.element, boss.x, boss.y, boss.facing);
    const safeRadius = wrath ? 126 : 136;
    const safe = chooseDecreeSafePoint(center, safeRadius);
    const safeElement = document.createElement("div");
    safeElement.className = "safe-zone";
    safeElement.style.setProperty("--x", `${safe.x}px`);
    safeElement.style.setProperty("--y", `${safe.y}px`);
    safeElement.style.setProperty("--safe-size", `${safeRadius * 2}px`);
    safeElement.innerHTML = "<strong>RUN HERE</strong><span>ONLY REFUGE</span>";
    effectLayer.appendChild(safeElement);
    const mergedCage = !state.cage && Math.random() < (wrath ? .88 : .66) && createPrimeCage(boss, {
      duration: decreeDelay - 120,
      exitToward: safe,
      size: Math.min(wrath ? 430 : 390, Math.max(wrath ? 342 : 318, Math.min(state.width, state.height) * (wrath ? .24 : .22))),
      showWarning: false,
      text: wrath ? "WRATH CAGE" : "DECREE CAGE"
    });
    createDecreeCharge(boss, wrath, decreeDelay);
    createScreenEffect(`absolute-decree${wrath ? " prime-wrath" : ""} compact`, wrath ? "ABOVE ALL DECREE" : "ABSOLUTE DECREE");
    createPrimeWarning(wrath ? "ABOVE ALL DECREE" : "ABSOLUTE DECREE", mergedCage ? "Escape the cage, then reach the far sanctuary." : "The sanctuary is far. Run now.", decreeDelay - 180);
    floatText("SAFE ZONE OR OBLIVION", safe.x, safe.y - safeRadius - 18);
    floatText(wrath ? "THE FINAL LAW OPENS" : "THE CENTER OF CREATION OPENS", boss.x, boss.y - 178);
    queueTimer(() => {
      safeElement.classList.add("urgent");
      createPrimeWarning("MOVE NOW", mergedCage ? "Through EXIT. Then sanctuary." : "Only the marked sanctuary survives", 1150);
      createShockwave(boss.x, boss.y, wrath ? 1120 : 920, oneAboveEffectClass(boss, "prime decree-windup"), wrath ? "RUN" : "KNEEL");
    }, 1280);
    queueTimer(() => {
      createDecreeImpact(boss, wrath);
      const safeDistance = Math.hypot(state.player.x - safe.x, state.player.y - safe.y);
      if (safeDistance > safeRadius) {
        state.deathTaunt = "You are pathetic and weak.";
        damagePlayer(999, { ignoreDivine: true, noRevive: true, ignoreInvincible: true });
      } else {
        floatText("REMEMBERED", state.player.x, state.player.y - 54);
        createShockwave(state.player.x, state.player.y, 320, "prime", "REFUGE");
      }
      if (state.boss === boss) {
        boss.decreeActive = false;
        boss.channelingUntil = 0;
        boss.decreeCooldownUntil = performance.now() + 7000;
      }
      shake();
      queueTimer(() => safeElement.remove(), 520);
    }, decreeDelay);
    return true;
  }

  function chooseDecreeSafePoint(center, safeRadius) {
    const minDimension = Math.min(state.width, state.height);
    const wrath = isOneAboveWrath(state.boss);
    const minRun = Math.min(wrath ? 1160 : 1050, Math.max(wrath ? 930 : 840, minDimension * (wrath ? .76 : .68)));
    const maxRun = Math.min(wrath ? 1540 : 1420, Math.max(wrath ? 1240 : 1120, minDimension * (wrath ? 1.02 : .94)));
    const minFromCenter = Math.max(360, safeRadius + state.boss.r + 80);
    for (let i = 0; i < 130; i += 1) {
      const angle = random(0, Math.PI * 2);
      const distance = random(minRun, maxRun);
      const point = {
        x: clamp(state.player.x + Math.cos(angle) * distance, safeRadius + 40, state.width - safeRadius - 40),
        y: clamp(state.player.y + Math.sin(angle) * distance, safeRadius + 90, state.height - safeRadius - 40)
      };
      const playerDistance = Math.hypot(point.x - state.player.x, point.y - state.player.y);
      if (playerDistance < minRun * .97) continue;
      if (Math.hypot(point.x - center.x, point.y - center.y) < minFromCenter) continue;
      const blocked = state.decorations.some((decor) => decor.kind !== "bush" && Math.hypot(point.x - decor.x, point.y - decor.y) < decor.r + safeRadius * .38);
      if (!blocked) return point;
    }
    return farthestDecreeCorner(center, safeRadius);
  }

  function farthestDecreeCorner(center, safeRadius) {
    const marginX = safeRadius + 52;
    const marginTop = safeRadius + 100;
    const marginBottom = safeRadius + 52;
    const candidates = [
      { x: marginX, y: marginTop },
      { x: state.width - marginX, y: marginTop },
      { x: marginX, y: state.height - marginBottom },
      { x: state.width - marginX, y: state.height - marginBottom }
    ].filter((point) => Math.hypot(point.x - center.x, point.y - center.y) > safeRadius + state.boss.r + 60);
    candidates.sort((a, b) => Math.hypot(b.x - state.player.x, b.y - state.player.y) - Math.hypot(a.x - state.player.x, a.y - state.player.y));
    return candidates[0] || {
      x: clamp(state.width - state.player.x, marginX, state.width - marginX),
      y: clamp(state.height - state.player.y, marginTop, state.height - marginBottom)
    };
  }

  function createDecreeCharge(boss, wrath = false, decreeDelay = 3000) {
    const element = document.createElement("div");
    element.className = `prime-decree-charge${wrath ? " prime-wrath" : ""}`;
    element.style.setProperty("--x", `${boss.x}px`);
    element.style.setProperty("--y", `${boss.y}px`);
    element.innerHTML = `<strong>${wrath ? "ALL THINGS END" : "CREATION ENDS"}</strong>`;
    effectLayer.appendChild(element);
    queueTimer(() => element.remove(), decreeDelay + 220);
    for (let i = 0; i < 5; i += 1) {
      queueTimer(() => {
        createShockwave(boss.x, boss.y, 420 + i * (wrath ? 235 : 190), oneAboveEffectClass(boss, "prime decree-windup"), "");
        shake();
      }, 320 + i * (wrath ? 430 : 490));
    }
  }

  function createDecreeImpact(boss, wrath = false) {
    createScreenEffect(`absolute-decree decree-impact${wrath ? " prime-wrath" : ""}`, wrath ? "ALL THINGS END" : "CREATION ENDS");
    const impact = document.createElement("div");
    impact.className = `prime-decree-impact${wrath ? " prime-wrath" : ""}`;
    effectLayer.appendChild(impact);
    queueTimer(() => impact.remove(), 1050);
    const count = wrath ? 26 : 18;
    const length = Math.max(state.width, state.height) * (wrath ? 1.42 : 1.22);
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      createBeamAt(boss.x, boss.y, `prime-beam decree-ray${wrath ? " prime-wrath" : ""}`, angle, length, wrath ? 184 : 150, 980, "");
    }
    createShockwave(boss.x, boss.y, Math.max(state.width, state.height) * (wrath ? 1.45 : 1.25), oneAboveEffectClass(boss, "prime decree-windup"), wrath ? "END" : "LAW");
    queueTimer(() => shake(), 130);
    queueTimer(() => shake(), 330);
  }

  function createAboveAllRend(boss) {
    if (state.boss !== boss || boss.superPhase !== 2) return;
    const centerAngle = Math.atan2(state.player.y - boss.y, state.player.x - boss.x);
    const length = Math.max(state.width, state.height) * 1.52;
    createScreenEffect("absolute-decree prime-wrath compact", "THE ABOVE ALL");
    createPrimeWarning("THE ABOVE ALL", "The arena is being erased.", 1850);
    createShockwave(boss.x, boss.y, 1180, "prime prime-wrath", "ABOVE ALL");
    for (let i = 0; i < 6; i += 1) {
      const angle = centerAngle + (Math.PI * 2 * i) / 6;
      createTelegraphedBeam(boss.x, boss.y, angle, length, 118, 460 + i * 110, 760, oneAboveDamage(boss, 2), "prime-beam prime-wrath");
    }
    for (let i = 0; i < 10; i += 1) {
      queueTimer(() => {
        const point = i % 2 === 0 ? randomNearPlayer(360) : randomOpenPoint(140);
        createHazard(point.x, point.y, 86, 300 + i * 70, 460, oneAboveDamage(boss, 2), "prime prime-wrath");
      }, i * 80);
    }
    if (!state.cage && Math.random() < .45) {
      const exitTarget = farthestDecreeCorner({ x: state.player.x, y: state.player.y }, 126);
      createPrimeCage(boss, {
        duration: 2600,
        exitToward: exitTarget,
        size: Math.min(400, Math.max(340, Math.min(state.width, state.height) * .23)),
        text: "ABOVE ALL CAGE"
      });
    }
    shake();
    queueTimer(() => shake(), 260);
  }

  function createPrimeCage(boss = state.boss, options = {}) {
    if (state.cage) return false;
    releaseCage();
    const cageX = options.x ?? state.player.x;
    const cageY = options.y ?? state.player.y;
    const size = options.size ?? Math.min(430, Math.max(320, Math.min(state.width, state.height) * .26));
    const gap = Math.min(190, Math.max(148, size * .46));
    const exitSide = options.exitSide || (options.exitToward ? getExitSideToward(cageX, cageY, options.exitToward) : "right");
    const element = document.createElement("div");
    element.className = `prime-cage exit-${exitSide}${isOneAboveWrath(boss) ? " prime-wrath" : ""}`;
    element.style.setProperty("--x", `${cageX}px`);
    element.style.setProperty("--y", `${cageY}px`);
    element.style.setProperty("--size", `${size}px`);
    element.style.setProperty("--gap", `${gap}px`);
    element.style.setProperty("--gap-half", `${gap / 2}px`);
    element.innerHTML = "<span>EXIT</span>";
    effectLayer.appendChild(element);
    state.cage = {
      x: cageX,
      y: cageY,
      size,
      gap,
      exitSide,
      until: performance.now() + (options.duration || 5400),
      element
    };
    if (boss) boss.cageCooldownUntil = performance.now() + (isOneAboveWrath(boss) ? 6400 : 8500);
    if (options.showWarning !== false) createPrimeWarning("PRIME CAGE", `Escape through the ${exitSide.toUpperCase()} exit`, 1700);
    floatText(options.text || "ORDER HAS ONE EXIT", cageX, cageY - size / 2 - 28);
    return true;
  }

  function getExitSideToward(x, y, point) {
    const dx = point.x - x;
    const dy = point.y - y;
    if (Math.abs(dx) >= Math.abs(dy)) return dx >= 0 ? "right" : "left";
    return dy >= 0 ? "bottom" : "top";
  }

  function createTelegraphedBeam(x, y, angle, length, width, delay, duration, damage, className) {
    const telegraph = document.createElement("div");
    telegraph.className = `beam-telegraph ${className}`;
    telegraph.style.setProperty("--x", `${x}px`);
    telegraph.style.setProperty("--y", `${y}px`);
    telegraph.style.setProperty("--rot", `${angle}rad`);
    telegraph.style.setProperty("--length", `${length}px`);
    telegraph.style.setProperty("--width", `${width}px`);
    effectLayer.appendChild(telegraph);
    queueTimer(() => {
      telegraph.remove();
      const dir = { x: Math.cos(angle), y: Math.sin(angle) };
      createBeamAt(x, y, className, angle, length, width, duration, "");
      if (playerInBeam(x, y, dir, length, width)) damagePlayer(damage, { ignoreDivine: true });
    }, delay);
  }

  function playerInBeam(x, y, dir, length, width) {
    const dx = state.player.x - x;
    const dy = state.player.y - y;
    const forward = dx * dir.x + dy * dir.y;
    const side = Math.abs(dx * -dir.y + dy * dir.x);
    return forward > -70 && forward < length && side < width / 2 + state.player.r;
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
    if (enemy.hp <= 0 && enemy.superboss && enemy.superPhase === 1) {
      transformOneAbove(enemy);
      return;
    }
    if (enemy.hp > 0 && enemy.superboss && enemy.superPhase === 2) maybeActivateOneAboveWrath(enemy);
    if (enemy.hp <= 0) killEnemy(enemy);
  }

  function playOneAboveIntro(boss) {
    boss.element.classList.add("one-above-hidden");
    bossBar.classList.remove("active");
    playBossDialogue([
      "Before your blade rises, understand what stands before you.",
      "I am not a throne to conquer. I am the reason thrones exist.",
      "Come, little spark. Prove why creation should remember you."
    ], () => {
      if (state.boss !== boss || boss.superPhase !== 1) return;
      boss.element.classList.remove("one-above-hidden");
      boss.element.classList.add("spawn-pop");
      setEntityTransform(boss.element, boss.x, boss.y, boss.facing);
      bossBar.classList.add("active");
      boss.skillTimer = 900;
      createScreenEffect("absolute-decree compact", "THE FIRST LAW");
      floatText("THE FIRST LAW OPENS", boss.x, boss.y - 90);
      queueTimer(() => boss.element.classList.remove("spawn-pop"), 360);
    });
  }

  function transformOneAbove(boss) {
    state.projectiles = [];
    state.hazards = [];
    state.particles = [];
    state.floatingText = [];
    effectLayer.replaceChildren();
    releaseCage();
    gameWrap.classList.add("one-above-arena");
    state.arenaScale = ONE_ABOVE_ARENA_SCALE;
    resize();
    generateDecorations(getStageInfo());
    state.player.x = state.width / 2;
    state.player.y = state.height * .72;
    state.player.vx = 0;
    state.player.vy = 0;
    boss.superPhase = 2;
    boss.maxHp = 96000;
    boss.hp = boss.maxHp;
    boss.r = 240;
    boss.damage = 4;
    boss.skillTimer = 2400;
    boss.nextSkillDelay = 0;
    boss.oneAboveCasts = 0;
    boss.castsSinceCage = 2;
    boss.decreeActive = false;
    boss.decreeCooldownUntil = 0;
    boss.cageCooldownUntil = 0;
    boss.wrathUnlocked = false;
    boss.speedMultiplier = .38;
    boss.x = state.width / 2;
    boss.y = Math.max(260, state.height * .24);
    boss.element.classList.remove("spawn-pop", "hit", "one-above-summon", "one-above-ascended", "one-above-wrath");
    boss.element.classList.add("one-above-hidden");
    setEntityTransform(boss.element, boss.x, boss.y, boss.facing);
    updatePlayerElement();
    burst(boss.x, boss.y, 70, ["#ffffff", "#fff2a8", "#8deaff", "#6244d8", "#1a123d"]);
    createScreenEffect("absolute-decree", "THIS IS IMPOSSIBLE");
    playSound("reality");
    playBossDialogue([
      "This is impossible.",
      "No... it is merely delayed truth.",
      "You call it courage. I call it ignorance.",
      "Before your ancestors learned to breathe, I had already witnessed eternity.",
      "Kneel... not because I command it, but because your soul remembers who created it.",
      "Even the gods borrowed their light from me.",
      "I do not hate you. A mountain does not hate the ant beneath it.",
      "You believe you have challenged a god. No... you have challenged the reason gods exist.",
      "The universe does not revolve around me. It exists because I allowed it to.",
      "If I desired your death, history would forget you ever lived.",
      "I am not above creation. I am the reason there is an above.",
      "Now struggle. Worth is proven through suffering."
    ], () => {
      summonOneAboveAscended(boss);
    });
  }

  function summonOneAboveAscended(boss) {
    if (state.boss !== boss || boss.superPhase !== 2) return;
    boss.element.classList.remove("one-above-hidden");
    boss.element.classList.add("one-above-ascended", "one-above-summon", "final-boss");
    setEntityTransform(boss.element, boss.x, boss.y, boss.facing);
    burst(boss.x, boss.y, 170, ["#ffffff", "#fff2a8", "#8deaff", "#6244d8", "#080611"]);
    createScreenEffect("absolute-decree compact", "THE ONE ABOVE DESCENDS");
    createPrimeWarning("THE ONE ABOVE DESCENDS", "Phase two has begun");
    shake();
    playSound("reality");
    queueTimer(() => {
      boss.element.classList.remove("one-above-summon");
      createPrimeBeamPattern(boss);
      boss.skillTimer = 900;
    }, 620);
  }

  function playBossDialogue(lines, onDone) {
    state.mode = "dialogue";
    cancelAnimationFrame(animationId);
    const overlay = document.createElement("div");
    overlay.className = "boss-dialogue";
    overlay.innerHTML = `<strong>The One Above</strong><p></p>`;
    gameWrap.appendChild(overlay);
    let index = 0;
    const paragraph = overlay.querySelector("p");
    const showNext = () => {
      paragraph.textContent = lines[index];
      index += 1;
      if (index >= lines.length) {
        queueAnyTimer(() => {
          overlay.remove();
          state.mode = "playing";
          state.lastTime = performance.now();
          onDone?.();
          animationId = requestAnimationFrame(loop);
        }, 2400);
      } else {
        queueAnyTimer(showNext, 2400);
      }
    };
    showNext();
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
    const magnet = 42 + getCharacter().magnet + (getEquippedWings().magnet || 0);
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

  function tryCharacterRevive(character, options, now) {
    if (options.noRevive || !character.god) return false;
    if (state.stage < gameTuning.maxStage) state.revivesLeft = Math.max(state.revivesLeft, 1);
    else state.revivesLeft += 1;
    state.revivesLeft -= 1;
    state.health = Math.ceil(state.maxHealth * .55);
    state.renderedHealth = -1;
    state.invincibleUntil = now + 2200;
    playerEl.classList.add("invincible");
    createGodWaves();
    floatText("REVIVE", state.player.x, state.player.y - 55);
    playSound("heal");
    return true;
  }

  function tryWingRevive(options, now) {
    const wing = getEquippedWings();
    if (options.ignoreWings || !wing.reviveCooldown || state.save.equippedWings === "none") return false;
    if (state.wingReviveReadyAt && now < state.wingReviveReadyAt) return false;
    state.wingReviveReadyAt = now + wing.reviveCooldown;
    state.wingGraceUntil = now + (wing.reviveBoostMs || 7600);
    state.wingReviveCount += 1;
    state.health = Math.max(1, Math.ceil(state.maxHealth * (wing.reviveHealRatio || .75)));
    state.renderedHealth = -1;
    state.invincibleUntil = now + (wing.reviveImmunityMs || 3000);
    state.activePowers.boost = Math.max(state.activePowers.boost || 0, state.wingGraceUntil);
    state.activePowers.shield = Math.max(state.activePowers.shield || 0, state.wingGraceUntil);
    state.shieldCharges = Math.max(state.shieldCharges, 1);
    playerEl.classList.add("invincible", "wing-grace");
    createScreenEffect("wing-revive compact", "SERAPH REVIVE");
    createWingReviveEffect(wing);
    spawnWingHearts(wing.heartCount || 3);
    floatText("ANGEL WINGS ANSWER", state.player.x, state.player.y - 78);
    shake();
    queueTimer(() => shake(), 180);
    playSound("victory");
    renderPowerStatus(true);
    updateHud();
    return true;
  }

  function createWingReviveEffect() {
    createShockwave(state.player.x, state.player.y, 760, "wings", "REBIRTH");
    burst(state.player.x, state.player.y, 72, ["#ffffff", "#fff4ad", "#77efff", "#b57cff"]);
    for (let i = 0; i < 18; i += 1) {
      const element = document.createElement("div");
      const angle = (Math.PI * 2 * i) / 18;
      element.className = "wing-feather";
      element.style.setProperty("--x1", `${state.player.x}px`);
      element.style.setProperty("--y1", `${state.player.y}px`);
      element.style.setProperty("--x2", `${state.player.x + Math.cos(angle) * random(220, 520)}px`);
      element.style.setProperty("--y2", `${state.player.y + Math.sin(angle) * random(160, 410)}px`);
      element.style.setProperty("--rot", `${angle + Math.PI / 2}rad`);
      effectLayer.appendChild(element);
      setTimeout(() => element.remove(), 980);
    }
  }

  function spawnWingHearts(count) {
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count;
      const distance = 92 + i * 18;
      const x = clamp(state.player.x + Math.cos(angle) * distance, 40, state.width - 40);
      const y = clamp(state.player.y + Math.sin(angle) * distance, 96, state.height - 42);
      createPickup("heart", x, y, 19);
    }
  }

  function damagePlayer(amount = 1, options = {}) {
    const now = performance.now();
    const character = getCharacter();
    if (!options.ignoreWings && now < state.wingGraceUntil && now < state.invincibleUntil) {
      if (now >= (state.lastWingGraceTextAt || 0)) {
        state.lastWingGraceTextAt = now + 520;
        floatText("SERAPH GRACE", state.player.x, state.player.y - 48);
      }
      return;
    }
    if (!options.ignoreDivine && character.void && now < state.voidDomainUntil) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 420;
        floatText("UNLIMITED", state.player.x, state.player.y - 44);
      }
      return;
    }
    if (!options.ignoreDivine && character.void && now < state.voidBarrierUntil) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 320;
        floatText("INFINITY", state.player.x, state.player.y - 44);
        createShockwave(state.player.x, state.player.y, 210, "void-blue void-barrier-wave", "");
        addVoidDomainCharge(2);
      }
      return;
    }
    if (!options.ignoreDivine && hasQuietDivineImmunity(character)) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 650;
        floatText("DIVINE", state.player.x, state.player.y - 44);
      }
      return;
    }
    if (!options.ignoreDivine && character.god && now < state.divineOverdriveUntil) {
      if (now >= state.invincibleUntil) {
        state.invincibleUntil = now + 520;
        floatText("UNTOUCHED", state.player.x, state.player.y - 44);
      }
      return;
    }
    if (!options.ignoreInvincible && now < state.invincibleUntil) return;
    if (!options.ignoreDivine && (state.shieldCharges > 0 || getPowerTimeLeft("shield") > 0)) {
      state.shieldCharges = 0;
      state.activePowers.shield = 0;
      state.invincibleUntil = now + 850;
      playerEl.classList.add("invincible");
      playSound("heal");
      burst(state.player.x, state.player.y, 24, ["#53ebb7", "#ffffff", "#9fffe2"]);
      floatText("BLOCK", state.player.x, state.player.y - 32);
      if (character.void) addVoidDomainCharge(4);
      return;
    }
    state.health -= amount;
    if (character.void) {
      addVoidDomainCharge(11);
      state.nextVoidRegenAt = now + (character.regenMs || 6200);
    }
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
      if (tryCharacterRevive(character, options, now)) return;
      if (tryWingRevive(options, now)) return;
      endGame();
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
      y: stageInfo.superboss ? 150 : 120,
      r: stageInfo.superboss ? 88 : final ? 82 : 58,
      hp,
      maxHp: hp,
      damage: final ? 2 : 1,
      reward: stageInfo.reward,
      skillTimer: stageInfo.superboss ? 1800 : final ? 850 : 1600,
      element,
      facing: 1,
      speedMultiplier: stageInfo.superboss ? .55 : final ? .95 : .82,
      superboss: Boolean(stageInfo.superboss),
      superPhase: stageInfo.superboss ? 1 : 0,
      nextSkillDelay: 0,
      oneAboveCasts: 0,
      castsSinceCage: stageInfo.superboss ? 2 : 0,
      decreeActive: false,
      decreeCooldownUntil: 0,
      cageCooldownUntil: 0,
      wrathUnlocked: false
    };
    state.enemies.push(state.boss);
    setEntityTransform(element, state.boss.x, state.boss.y, state.boss.facing);
    bossNameEl.textContent = `${stageInfo.bossName} - ${stageInfo.bossTitle}`;
    bossBar.classList.toggle("active", !stageInfo.superboss);
    playSound("boss");
    shake();
    if (stageInfo.superboss) playOneAboveIntro(state.boss);
    else floatText(final ? "THE EMPTY THRONE AWAKENS" : stageInfo.bossName.toUpperCase(), state.width / 2, state.height / 2 - 80);
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
    const wingReward = stageInfo.id === 11 ? unlockSeraphWings() : null;
    bossBar.classList.remove("active");
    $("stageClearTitle").textContent = `${stageInfo.name} cleared`;
    $("stageClearText").textContent = `${stageInfo.clearText} You earned ${state.bankedThisRun} coins this run.${wingReward ? ` ${wingReward.unlocked ? "Seraph Dominion Wings are now yours." : "Seraph Dominion Wings remain bound to you."}` : ""}`;
    showScreen("stageClear");
    updateSaveBest();
    persistSave();
  }

  function winGame() {
    const stageInfo = getStageInfo();
    state.mode = "credits";
    cancelAnimationFrame(animationId);
    stopMusic();
    bankCoins();
    const wingReward = stageInfo.id === 11 ? unlockSeraphWings() : null;
    askChampionName();
    addLeaderboard(true, wingReward);
    bossBar.classList.remove("active");
    nightOverlay.classList.add("active");
    if (creditsRewardText) creditsRewardText.textContent = wingReward
      ? wingReward.unlocked
        ? "Reward: Seraph Dominion Wings claimed"
        : "Reward: Seraph Dominion Wings remain bound"
      : "Reward: bragging rights and very broken builds";
    playSound("victory");
    showScreen("credits");
    persistSave();
  }

  function unlockSeraphWings() {
    const alreadyOwned = state.save.ownedWings?.includes("seraph");
    state.save.ownedWings = Array.from(new Set(["none", ...(state.save.ownedWings || []), "seraph"]));
    state.save.equippedWings = "seraph";
    updatePlayerSkin();
    updateEquippedSummary();
    renderLoadout();
    if (!alreadyOwned) {
      createScreenEffect("wing-reward compact", "SERAPH WINGS CLAIMED");
      createWingRewardEffect();
      playSound("power");
    }
    return {
      id: "seraph",
      name: wings.seraph.name,
      unlocked: !alreadyOwned
    };
  }

  function createWingRewardEffect() {
    createShockwave(state.width / 2, state.height / 2, 920, "wings", "RELIC");
    for (let i = 0; i < 24; i += 1) {
      queueAnyTimer(() => {
        const angle = random(0, Math.PI * 2);
        const distance = random(80, 360);
        burst(
          state.width / 2 + Math.cos(angle) * distance,
          state.height / 2 + Math.sin(angle) * distance,
          8,
          ["#ffffff", "#fff4ad", "#77efff", "#b57cff"]
        );
      }, i * 45);
    }
  }

  function endGame() {
    state.mode = "gameOver";
    cancelAnimationFrame(animationId);
    stopMusic();
    bankCoins();
    addLeaderboard(false);
    bossBar.classList.remove("active");
    $("finalScore").textContent = state.bankedThisRun;
    $("finalTime").textContent = state.deathTaunt || getStageInfo().name;
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
    renderProfiles();
    persistSave();
  }

  function updateSaveBest() {
    state.save.bestStage = Math.max(state.save.bestStage, state.stage);
    updateStartPreview();
    renderProfiles();
    renderStageSelect();
  }

  function addLeaderboard(won, reward = null) {
    if (won) updateSaveBest();
    state.save.leaderboard.push({
      name: state.save.profileName || "Unknown Soul",
      stage: state.stage,
      stageName: getStageInfo().name,
      coins: state.bankedThisRun,
      weapon: getWeapon().name,
      character: getCharacter().name,
      wings: getEquippedWings().name,
      reward: reward?.name || "",
      rewardUnlocked: Boolean(reward?.unlocked),
      time: formatTime(state.elapsed),
      won,
      date: new Date().toLocaleDateString()
    });
    state.save.leaderboard.sort((a, b) => Number(b.won) - Number(a.won) || b.stage - a.stage || b.coins - a.coins);
    state.save.leaderboard = state.save.leaderboard.slice(0, 12);
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
    showScreen(state.loadoutReturn === "stageClear" ? "stageClear" : state.loadoutReturn === "mode" ? "mode" : "start");
  }

  function openLeaderboard(returnScreen = "start") {
    playSound("click");
    state.leaderboardReturn = returnScreen;
    renderLeaderboard();
    showScreen("leaderboard");
  }

  function renderProfiles() {
    if (!profileSlots) return;
    const profiles = saveStore.getProfileSummaries();
    profileSlots.replaceChildren();
    if (activeProfileValue) activeProfileValue.textContent = state.save.profileName || "Unknown Soul";
    if (modeProfileValue) modeProfileValue.textContent = state.save.profileName || "Unknown Soul";
    for (const profile of profiles) {
      const button = document.createElement("button");
      button.className = `profile-slot${profile.slot === state.save.profileSlot ? " active" : ""}`;
      button.type = "button";
      button.innerHTML = `
        <span>Slot ${profile.slot}</span>
        <strong>${profile.profileName}</strong>
        <em>Gate ${profile.bestStage} - ${profile.coins} coins${profile.hasSeraphWings ? " - Seraph Wings" : ""}</em>
      `;
      button.addEventListener("click", () => switchProfile(profile.slot));
      profileSlots.appendChild(button);
    }
  }

  function switchProfile(slot) {
    if (slot === state.save.profileSlot) return;
    persistSave();
    state.save = saveStore.loadSave(slot);
    playSound("click");
    refreshForSaveChange();
    showScreen("start");
  }

  function createProfile() {
    const profiles = saveStore.getProfileSummaries();
    const target = profiles.find((profile) => profile.slot !== state.save.profileSlot && profile.coins === 0 && profile.bestStage <= 1)
      || profiles.find((profile) => profile.slot !== state.save.profileSlot)
      || profiles[0];
    if (!target) return;
    if (target.coins > 0 || target.bestStage > 1) {
      const replace = window.confirm(`Create a new soul in Slot ${target.slot}? This replaces ${target.profileName}.`);
      if (!replace) return;
    }
    const name = window.prompt("Name this new soul:", target.slot === 1 ? "Rowell" : `Player ${target.slot}`);
    if (name === null) return;
    persistSave();
    const fresh = saveStore.normalizeSave({
      ...defaultSave(),
      profileSlot: target.slot,
      profileName: name
    }, target.slot);
    state.save = fresh;
    playSound("power");
    refreshForSaveChange();
    showScreen("start");
  }

  function renameActiveProfile() {
    const currentName = state.save.profileName || "Unknown Soul";
    const nextName = window.prompt("Name this soul:", currentName);
    if (nextName === null) return;
    updateProfileName(nextName);
  }

  function askChampionName() {
    const nextName = window.prompt("Champion name for the Hall of Souls:", state.save.profileName || "Rowell");
    if (nextName !== null) updateProfileName(nextName);
  }

  function updateProfileName(name) {
    const cleaned = String(name || "").replace(/\s+/g, " ").trim().slice(0, 18);
    state.save.profileName = cleaned || state.save.profileName || "Unknown Soul";
    renderProfiles();
    persistSave();
  }

  function refreshForSaveChange() {
    renderShop();
    renderLoadout();
    renderLeaderboard();
    renderProfiles();
    renderStageSelect();
    updatePlayerSkin();
    updateHud();
    updateStartPreview();
    updateEquippedSummary();
    updateSettingsButtons();
    renderSkillHud(true);
    renderDomainMeter(true);
    persistSave();
  }

  function renderStageSelect() {
    if (!stageSelectGrid || !bossSelectGrid) return;
    stageSelectGrid.replaceChildren();
    bossSelectGrid.replaceChildren();
    stageCatalog
      .filter((stageInfo) => stageInfo.id < 10)
      .forEach((stageInfo) => stageSelectGrid.appendChild(createGateCard(stageInfo, false)));
    stageCatalog
      .filter((stageInfo) => stageInfo.id >= 10)
      .forEach((stageInfo) => bossSelectGrid.appendChild(createGateCard(stageInfo, true)));
    if (modeCoinsValue) modeCoinsValue.textContent = state.save.coins;
    if (modeProfileValue) modeProfileValue.textContent = state.save.profileName || "Unknown Soul";
  }

  function createGateCard(stageInfo, bossOnly) {
    const button = document.createElement("button");
    const reached = stageInfo.id <= getBestReturnStage();
    const next = stageInfo.id === Math.min(gameTuning.maxStage, getBestReturnStage() + 1);
    button.className = `stage-card theme-${stageInfo.theme}${bossOnly ? " boss-card" : ""}${stageInfo.superboss ? " superboss-card" : ""}`;
    button.type = "button";
    button.innerHTML = `
      <span class="stage-number">${bossOnly ? "Boss" : `Stage ${stageInfo.id}`}</span>
      <strong>${stageInfo.name}</strong>
      <em>${stageInfo.bossName} - ${stageInfo.bossTitle}</em>
      <small>${bossOnly ? "Boss-only duel" : `${stageInfo.killGoal} kills before boss`} · ${stageInfo.reward} coin reward</small>
      <i>${reached ? "Reached" : next ? "Next" : "Open Trial"}</i>
    `;
    button.addEventListener("click", () => {
      playSound("click");
      startRun(stageInfo.id, { bossOnly });
    });
    return button;
  }

  function getBestReturnStage() {
    return Math.max(1, Math.min(gameTuning.maxStage, Number(state.save.bestStage) || 1));
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
    if (!weaponLoadoutGrid || !characterLoadoutGrid || !wingsLoadoutGrid) return;
    loadoutWalletValue.textContent = state.save.coins;
    weaponLoadoutGrid.replaceChildren();
    characterLoadoutGrid.replaceChildren();
    wingsLoadoutGrid.replaceChildren();
    for (const [id, item] of Object.entries(weapons)) {
      weaponLoadoutGrid.appendChild(createItemCard({ type: "weapon", id, ...item }, true));
    }
    for (const [id, item] of Object.entries(characters)) {
      characterLoadoutGrid.appendChild(createItemCard({ type: "character", id, icon: item.color, ...item }, true));
    }
    for (const [id, item] of Object.entries(wings)) {
      wingsLoadoutGrid.appendChild(createItemCard({ type: "wings", id, ...item }, true));
    }
    updateEquippedSummary();
    renderSkillDetails({ type: "character", id: state.save.equippedCharacter, icon: getCharacter().color, ...getCharacter() });
  }

  function getOwnedList(type) {
    if (type === "weapon") return state.save.ownedWeapons;
    if (type === "wings") return state.save.ownedWings;
    return state.save.ownedCharacters;
  }

  function isItemOwned(item) {
    return getOwnedList(item.type).includes(item.id);
  }

  function isItemEquipped(item) {
    if (item.type === "weapon") return state.save.equippedWeapon === item.id;
    if (item.type === "wings") return state.save.equippedWings === item.id;
    return state.save.equippedCharacter === item.id;
  }

  function getItemBadge(item, owned, equipped, level) {
    if (equipped) return "Equipped";
    if (owned) return item.type === "weapon" ? `Lv ${level}` : "Owned";
    if (item.rewardOnly) return "Relic";
    return `${item.cost} coins`;
  }

  function getItemButtonLabel(item, owned, equipped) {
    if (equipped) return "Equipped";
    if (owned) return "Equip";
    if (item.rewardOnly) return "Defeat The One Above";
    return `Buy ${item.cost}`;
  }

  function getItemDetailHtml(item, skillList, level) {
    if (item.type === "weapon") {
      const stats = getWeaponStats(item.id);
      return `<small>Level ${level}/5 - Damage ${stats.damage} - Range ${stats.range}</small>`;
    }
    if (item.type === "wings") {
      if (item.id === "none") return "<small>No armor relic bonus active.</small>";
      return `<small>+${item.health || 0} heart - +${item.speed || 0} speed - ${Math.round((item.reviveCooldown || 0) / 1000)}s revive cooldown</small>`;
    }
    return skillList;
  }

  function createItemCard(item, showLocked = false) {
    const owned = isItemOwned(item);
    const equipped = isItemEquipped(item);
    const locked = item.rewardOnly && !owned ? true : state.save.coins < item.cost && !owned;
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
        <span class="item-badge">${getItemBadge(item, owned, equipped, level)}</span>
      </div>
      <div><h3>${item.name}</h3><p>${item.desc}</p>${getItemDetailHtml(item, skillList, level)}</div>
    `;
    const button = document.createElement("button");
    button.textContent = getItemButtonLabel(item, owned, equipped);
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
    wingsLoadoutGrid.classList.toggle("hidden", tab !== "wings");
    playSound("click");
  }

  function buyOrEquip(item) {
    const ownedList = getOwnedList(item.type);
    if (!ownedList.includes(item.id)) {
      if (item.rewardOnly || state.save.coins < item.cost) return;
      state.save.coins -= item.cost;
      ownedList.push(item.id);
      if (item.type === "weapon") state.save.weaponLevels[item.id] ||= 1;
      playSound("coin");
    } else {
      playSound("click");
    }
    if (item.type === "weapon") state.save.equippedWeapon = item.id;
    else if (item.type === "character") state.save.equippedCharacter = item.id;
    else if (item.type === "wings") state.save.equippedWings = item.id;
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
    if (item.type === "wings") {
      if (item.id === "none") {
        skillDetails.innerHTML = `
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
        `;
        return;
      }
      skillDetails.innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <ul>
          <li><b>Final Miracle</b><span>Revives once when ready, even against The One Above absolute attacks.</span></li>
          <li><b>Grace Window</b><span>${Math.round((item.reviveImmunityMs || 0) / 1000)}s immunity, ${Math.round((item.reviveBoostMs || 0) / 1000)}s haste and shield.</span></li>
          <li><b>Relic Body</b><span>+${item.health || 0} heart, +${item.speed || 0} speed, +${item.magnet || 0} coin magnet.</span></li>
        </ul>
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
    const wing = getEquippedWings();
    if (equippedWeaponValue) equippedWeaponValue.textContent = `${weapon.name} Lv ${weapon.level || 1}`;
    if (equippedCharacterValue) equippedCharacterValue.textContent = character.name;
    if (equippedWingsValue) equippedWingsValue.textContent = wing.name;
    if (modeCoinsValue) modeCoinsValue.textContent = state.save.coins;
    if (modeProfileValue) modeProfileValue.textContent = state.save.profileName || "Unknown Soul";
    if (loadoutWeaponValue) loadoutWeaponValue.textContent = `${weapon.name} Lv ${weapon.level || 1}`;
    if (loadoutCharacterValue) loadoutCharacterValue.textContent = character.name;
    if (loadoutWingsValue) loadoutWingsValue.textContent = wing.name;
    if (loadoutWalletValue) loadoutWalletValue.textContent = state.save.coins;
    if (weaponStatus) {
      weaponStatus.className = `weapon-status ${state.save.equippedWeapon}`;
      weaponStatus.innerHTML = `<span>Weapon</span><strong>${weapon.name} Lv ${weapon.level || 1}</strong>`;
    }
    if (wingStatus) {
      const active = state.save.equippedWings !== "none";
      wingStatus.className = `wing-status ${state.save.equippedWings}${active ? "" : " hidden"}`;
      wingStatus.innerHTML = active ? `<span>Relic</span><strong>${wing.name}</strong>` : "";
    }
  }

  function toggleSound() {
    const enabled = state.save.settings?.music !== false || state.save.settings?.sfx !== false;
    state.save.settings = {
      music: !enabled,
      sfx: !enabled
    };
    if (!state.save.settings.music) stopMusic();
    else {
      warmAudio();
      playSound("click");
      if (state.mode === "playing") startMusic();
    }
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
    if (leaderboardStats) renderLeaderboardStats();
    leaderboardList.replaceChildren();
    if (!state.save.leaderboard.length) {
      const empty = document.createElement("li");
      empty.className = "hall-entry empty";
      empty.textContent = "No souls recorded yet. Go make the dominion remember you.";
      leaderboardList.appendChild(empty);
      return;
    }
    state.save.leaderboard.forEach((run, index) => {
      const li = document.createElement("li");
      const name = run.name || state.save.profileName || "Unknown Soul";
      const status = run.won ? "Dominion Conquered" : run.stageName || `Gate ${run.stage}`;
      li.className = `hall-entry${run.won ? " victory" : ""}${run.rewardUnlocked ? " relic-run" : ""}`;
      li.innerHTML = `
        <span class="hall-rank">${index + 1}</span>
        <div class="hall-main">
          <strong>${name}</strong>
          <em>${status}</em>
          <small>${run.date || "Unknown date"} - ${run.time || "0:00"}</small>
        </div>
        <div class="hall-meta">
          <span>${run.coins || 0} coins</span>
          <span>Gate ${run.stage || 1}</span>
          <span>${run.character || "Unknown"} / ${run.weapon || "Unknown"}</span>
          ${run.wings ? `<span>${run.wings}</span>` : ""}
          ${run.reward ? `<b>${run.rewardUnlocked ? "New relic" : "Relic bound"}: ${run.reward}</b>` : ""}
        </div>
      `;
      leaderboardList.appendChild(li);
    });
  }

  function renderLeaderboardStats() {
    const entries = state.save.leaderboard || [];
    const victories = entries.filter((run) => run.won).length;
    const totalCoins = entries.reduce((sum, run) => sum + (Number(run.coins) || 0), 0);
    const bestStage = entries.reduce((best, run) => Math.max(best, Number(run.stage) || 1), Number(state.save.bestStage) || 1);
    const hasWings = state.save.ownedWings?.includes("seraph");
    leaderboardStats.innerHTML = `
      <div><span>Victories</span><strong>${victories}</strong></div>
      <div><span>Best gate</span><strong>${bestStage}</strong></div>
      <div><span>Recorded coins</span><strong>${totalCoins}</strong></div>
      <div class="${hasWings ? "relic-owned" : ""}"><span>Relic</span><strong>${hasWings ? wings.seraph.name : "Unclaimed"}</strong></div>
    `;
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
        refreshForSaveChange();
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
      void: [{ kind: "voidspire", count: 14, min: 54, max: 96, r: 28 }, { kind: "crystal", count: 12, min: 44, max: 84, r: 24 }, { kind: "rock", count: 10, min: 42, max: 76, r: 24 }],
      prime: [{ kind: "throne", count: 7, min: 72, max: 126, r: 34 }, { kind: "halo", count: 14, min: 42, max: 82, r: 18 }, { kind: "obelisk", count: 8, min: 54, max: 90, r: 28 }]
    };
    const decorPlan = terrain[stageInfo.theme] || terrain.bramble;
    const decorMultiplier = stageInfo.superboss && state.arenaScale > 1 ? 2.1 : 1;
    decorPlan.forEach((plan) => {
      for (let i = 0; i < Math.round(plan.count * decorMultiplier); i += 1) {
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
    const cycle = (state.elapsed % NIGHT_CYCLE_MS) / NIGHT_CYCLE_MS;
    const isNight = shouldUseNightCycle && cycle > .58;
    if (state.nightActive !== isNight) {
      state.nightActive = isNight;
      nightOverlay.classList.toggle("active", isNight);
      floatText(isNight ? "NIGHT FALLS" : "DAY BREAKS", state.player.x, state.player.y - 48);
    }
  }

  function resetNightOverlayInstant() {
    state.nightActive = false;
    nightOverlay.classList.add("resetting");
    nightOverlay.classList.remove("active");
    void nightOverlay.offsetWidth;
    nightOverlay.classList.remove("resetting");
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
  }

  function updateBossBar() {
    if (!state.boss || state.boss.element.classList.contains("one-above-hidden")) {
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
    playerEl.classList.toggle("void-barrier", performance.now() < state.voidBarrierUntil);
    playerEl.classList.toggle("wing-grace", performance.now() < state.wingGraceUntil);
  }

  function renderPowerStatus(force = false) {
    const now = performance.now();
    const active = Object.keys(powerDefinitions)
      .map((type) => ({ type, left: getPowerTimeLeft(type) }))
      .filter((power) => power.left > 0);
    if (now < state.rageUntil) active.push({ type: "boost", left: state.rageUntil - now });
    if (now < state.voidBarrierUntil) active.push({ type: "void", left: state.voidBarrierUntil - now });
    if (now < state.wingGraceUntil) active.push({ type: "wings", left: state.wingGraceUntil - now });
    else if (state.wingReviveReadyAt > now) active.push({ type: "wings", left: state.wingReviveReadyAt - now });
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
      .map((skill) => `${skill.slot}:${skill.name}:${Math.max(0, Math.ceil(((state.skillCooldowns[skill.slot] || 0) - now) / 1000))}:${["voidDomain", "voidEclipse"].includes(skill.effect) ? `${Math.floor(state.voidDomainCharge)}:${Math.ceil(Math.max(0, state.voidDomainUntil - now) / 1000)}` : ""}`)
      .join("|");

    if (!force && signature === state.renderedSkillSignature) return;
    state.renderedSkillSignature = signature;
    skillHud.replaceChildren();
    skillHud.classList.toggle("empty", !skills.length);

    for (const skill of skills) {
      const readyAt = state.skillCooldowns[skill.slot] || 0;
      const isDomain = skill.effect === "voidDomain";
      const isDomainOnly = skill.effect === "voidEclipse";
      const domainActive = isDomain && now < state.voidDomainUntil;
      const voidDomainActive = getCharacter().void && now < state.voidDomainUntil;
      const domainLocked = isDomainOnly && !voidDomainActive;
      const left = domainActive ? state.voidDomainUntil - now : Math.max(0, readyAt - now);
      const domainReady = isDomain && state.voidDomainCharge >= 100 && !domainActive;
      const button = document.createElement("button");
      button.className = `skill-slot${left ? " cooling" : ""}${isDomain ? " domain-skill" : ""}${domainReady ? " domain-ready" : ""}${domainActive ? " domain-active" : ""}${domainLocked ? " domain-locked" : ""}${isDomainOnly && voidDomainActive ? " domain-ready" : ""}`;
      button.type = "button";
      button.disabled = Boolean(left) || (isDomain && !domainReady) || domainLocked;
      button.title = `${skill.name}: ${skill.desc}`;
      button.innerHTML = `
        <span>${skill.slot}</span>
        <strong>${skill.name}</strong>
        <small>${isDomain ? domainActive ? `${Math.ceil(left / 1000)}s` : domainReady ? "Ready" : `${Math.floor(state.voidDomainCharge)}%` : domainLocked ? "Domain" : left ? `${Math.ceil(left / 1000)}s` : "Ready"}</small>
      `;
      button.addEventListener("click", () => useSkill(skill.slot));
      skillHud.appendChild(button);
    }
  }

  function renderDomainMeter(force = false) {
    if (!domainMeter) return;
    const character = getCharacter();
    const now = performance.now();
    const active = character.void && ["playing", "paused", "celebrating"].includes(state.mode);
    domainMeter.classList.toggle("hidden", !active);
    if (!active) return;
    const charge = Math.floor(state.voidDomainCharge);
    const domainLeft = Math.max(0, state.voidDomainUntil - now);
    const ready = charge >= 100 && !domainLeft;
    const signature = `${charge}:${Math.ceil(domainLeft / 1000)}:${ready}:${state.health}:${state.maxHealth}`;
    if (!force && signature === state.renderedDomainSignature) return;
    state.renderedDomainSignature = signature;
    domainMeter.classList.toggle("ready", ready);
    domainMeter.classList.toggle("active", Boolean(domainLeft));
    domainMeter.style.setProperty("--domain-charge", `${charge}%`);
    domainMeter.innerHTML = `
      <span>Domain</span>
      <strong>${domainLeft ? "Expanded" : ready ? "Ready" : `${charge}%`}</strong>
      <i><b></b></i>
      <em>${domainLeft ? `${Math.ceil(domainLeft / 1000)}s` : ready ? "Press 4" : "Build slowly"}</em>
    `;
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
      blue: "assets/player-blue.svg",
      green: "assets/player-green.svg",
      red: "assets/player-red.svg",
      yellow: "assets/player-yellow.svg",
      cyan: "assets/player-cyan.svg",
      god: "assets/player-god.svg",
      void: "assets/player-void.svg?v=2"
    };
    playerEl.style.backgroundImage = `url("${skins[character.color] || "assets/player-blue.svg"}")`;
    playerEl.style.removeProperty("filter");
    playerEl.dataset.character = character.color || "blue";
    playerEl.dataset.weapon = state.save.equippedWeapon;
    playerEl.dataset.wings = state.save.equippedWings || "none";
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
    state.deathTaunt = "";
    state.voidDomainUntil = 0;
    state.voidDomainFreezeUntil = 0;
    state.nextVoidDomainTickAt = 0;
    state.nextVoidRegenAt = 0;
    state.arenaScale = 1;
    gameWrap.style.setProperty("--arena-scale", "1");
    gameWrap.style.setProperty("--arena-view-scale", "1");
    releaseCage();
    state.divineOverdriveUntil = 0;
    state.nextDivineBeamAt = 0;
    state.voidBarrierUntil = 0;
    state.lastVoidTrailAt = 0;
    state.wingReviveReadyAt = 0;
    state.wingGraceUntil = 0;
    state.wingReviveCount = 0;
    state.lastWingGraceTextAt = 0;
    state.lastBlinkAt = 0;
    state.screenEffectUntil = 0;
    enemyLayer.replaceChildren();
    pickupLayer.replaceChildren();
    effectLayer.replaceChildren();
    gameWrap.querySelectorAll(".boss-dialogue").forEach((item) => item.remove());
    gameWrap.querySelectorAll(".prime-warning").forEach((item) => item.remove());
    gameWrap.querySelectorAll(".void-domain-cutin").forEach((item) => item.remove());
    powerStatus.replaceChildren();
    if (domainMeter) domainMeter.classList.add("hidden");
    playerEl.classList.remove("boosted", "shielded", "low-health", "invincible", "divine-overdrive", "void-barrier", "wing-grace");
    gameWrap.classList.remove("one-above-arena", "one-above-wrath", "void-domain-active");
    resetNightOverlayInstant();
  }

  function setEntityTransform(element, x, y, facing = 1) {
    element.style.setProperty("--x", `${x}px`);
    element.style.setProperty("--y", `${y}px`);
    element.style.setProperty("--sx", String(facing));
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
    if (modeCoinsValue) modeCoinsValue.textContent = state.save.coins;
    if (modeProfileValue) modeProfileValue.textContent = state.save.profileName || "Unknown Soul";
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

  function getEquippedWings() {
    return wings[state.save.equippedWings] || wings.none;
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
    audio.startMusic();
  }

  function warmAudio() {
    audio.warmAudio?.();
  }

  function stopMusic() {
    audio.stopMusic();
  }

  function playTone(frequency, duration, wave = "sine", volume = .04, endFrequency = frequency) {
    audio.playTone(frequency, duration, wave, volume, endFrequency);
  }

  function playSound(type) {
    audio.playSound(type);
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
