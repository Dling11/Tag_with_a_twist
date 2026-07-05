(() => {
  "use strict";

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

  const screens = {
    start: $("startScreen"),
    instructions: $("instructionsScreen"),
    shop: $("shopScreen"),
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
    shopBack: $("shopBackBtn"),
    leaderboard: $("leaderboardBtn"),
    leaderboardBack: $("leaderboardBackBtn"),
    save: $("saveBtn"),
    load: $("loadBtn"),
    pause: $("pauseBtn"),
    resume: $("resumeBtn"),
    restartPause: $("restartPauseBtn"),
    menuPause: $("menuPauseBtn"),
    nextStage: $("nextStageBtn"),
    shopStage: $("shopStageBtn"),
    menuStage: $("menuStageBtn"),
    restart: $("restartBtn"),
    menu: $("menuBtn"),
    creditsMenu: $("creditsMenuBtn")
  };

  const difficultySettings = {
    easy: { label: "Calm", healthBonus: 2, enemySpeed: 72, spawnDelay: 1250, coinScale: 1.1, damage: 1 },
    normal: { label: "Wild", healthBonus: 1, enemySpeed: 88, spawnDelay: 1050, coinScale: 1.25, damage: 1 },
    hard: { label: "Feral", healthBonus: 0, enemySpeed: 106, spawnDelay: 850, coinScale: 1.45, damage: 1 }
  };

  const weapons = {
    default: { name: "Palm Strike", cost: 0, cooldown: 410, damage: 14, range: 62, desc: "Free quick hit. Good enough to survive level 1." },
    sword: { name: "Big Sword", cost: 220, cooldown: 480, damage: 36, range: 92, icon: "sword", desc: "Huge front swing. Bosses feel this one." },
    bow: { name: "Forest Bow", cost: 360, cooldown: 540, damage: 30, range: 520, icon: "bow", desc: "Single target ranged shot with strong boss poke." },
    shuriken: { name: "Smart Shuriken", cost: 520, cooldown: 720, damage: 22, range: 420, icon: "shuriken", desc: "Throws three seeking blades. Efficient mob cleaner." }
  };

  const characters = {
    blue: { name: "Blue", cost: 0, color: "cyan", health: 0, speed: 0, magnet: 0, desc: "Balanced starter." },
    green: { name: "Green", cost: 260, color: "green", health: 2, speed: -8, magnet: 0, desc: "More health, slightly heavier movement." },
    red: { name: "Red", cost: 420, color: "red", health: 0, speed: 0, magnet: 0, rage: true, desc: "Rage sometimes doubles attack damage after getting hit." },
    yellow: { name: "Yellow", cost: 380, color: "yellow", health: -1, speed: 34, magnet: 0, desc: "Fast feet for aggressive dodging." },
    cyan: { name: "Cyan", cost: 440, color: "cyan", health: 0, speed: 10, magnet: 72, desc: "Pulls coins from farther away." },
    god: { name: "God", cost: 2400, color: "god", health: 4, speed: 28, magnet: 120, revives: 3, god: true, desc: "Absurdly broken. Sword waves, coin vacuum, three revives." }
  };

  const bossNames = [
    "Rootjaw", "Moss Brute", "Bramble King", "Stone Belly", "Rot Lantern",
    "Thorn Judge", "Moon Gnawer", "Hollow Crown", "The Quiet Bite", "No One"
  ];

  const defaultSave = () => ({
    version: 2,
    coins: 0,
    ownedWeapons: ["default"],
    equippedWeapon: "default",
    ownedCharacters: ["blue"],
    equippedCharacter: "blue",
    leaderboard: [],
    bestStage: 1
  });

  const state = {
    mode: "menu",
    difficulty: "easy",
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
    activePowers: {},
    renderedPowers: "",
    shieldCharges: 0,
    rageUntil: 0,
    revivesLeft: 0,
    lastAttackAt: 0,
    attackQueued: false,
    nightActive: false,
    boss: null,
    save: defaultSave(),
    player: { x: 600, y: 400, r: 22, speed: 255, vx: 0, vy: 0, facing: 1, aimX: 1, aimY: 0 },
    enemies: [],
    pickups: [],
    projectiles: [],
    particles: [],
    floatingText: [],
    decorations: []
  };

  const keys = new Set();
  let audioContext = null;
  let animationId = 0;

  boot();

  function boot() {
    resize();
    generateDecorations();
    bindEvents();
    renderShop();
    renderLeaderboard();
    updateHud();
    updatePlayerSkin();
    updatePlayerElement();
    showScreen("start");
  }

  function bindEvents() {
    window.addEventListener("resize", resize);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (event) => keys.delete(event.key.toLowerCase()));
    document.querySelectorAll(".difficulty-btn").forEach((button) => {
      button.addEventListener("click", () => {
        playSound("click");
        document.querySelectorAll(".difficulty-btn").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        state.difficulty = button.dataset.difficulty;
      });
    });
    buttons.start.addEventListener("click", () => { playSound("click"); startRun(1); });
    buttons.instructions.addEventListener("click", () => { playSound("click"); showScreen("instructions"); });
    buttons.back.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.shop.addEventListener("click", () => openShop("start"));
    buttons.shopBack.addEventListener("click", () => closeShop());
    buttons.leaderboard.addEventListener("click", () => { playSound("click"); renderLeaderboard(); showScreen("leaderboard"); });
    buttons.leaderboardBack.addEventListener("click", () => { playSound("click"); showScreen("start"); });
    buttons.save.addEventListener("click", exportSaveFile);
    buttons.load.addEventListener("click", () => saveInput.click());
    saveInput.addEventListener("change", importSaveFile);
    buttons.pause.addEventListener("click", pauseGame);
    buttons.resume.addEventListener("click", resumeGame);
    buttons.restartPause.addEventListener("click", () => { playSound("click"); startRun(state.stage); });
    buttons.menuPause.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.nextStage.addEventListener("click", () => { playSound("click"); startStage(Math.min(10, state.stage + 1)); });
    buttons.shopStage.addEventListener("click", () => openShop("stageClear"));
    buttons.menuStage.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.restart.addEventListener("click", () => { playSound("click"); startRun(1); });
    buttons.menu.addEventListener("click", () => { playSound("click"); returnToMenu(); });
    buttons.creditsMenu.addEventListener("click", () => { playSound("click"); returnToMenu(); });
  }

  function resize() {
    const rect = gameWrap.getBoundingClientRect();
    state.width = rect.width;
    state.height = rect.height;
    clampPlayer();
  }

  function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " ", "j"].includes(key)) {
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
    keys.add(key);
  }

  function startRun(stage) {
    state.runCoins = 0;
    state.bankedThisRun = 0;
    startStage(stage);
  }

  function startStage(stage) {
    resize();
    clearDynamicElements();
    const config = difficultySettings[state.difficulty];
    const character = getCharacter();
    state.mode = "playing";
    state.stage = stage;
    state.phase = "mobs";
    state.elapsed = 0;
    state.stageKills = 0;
    state.killGoal = 6 + stage * 3;
    state.maxHealth = Math.max(2, 4 + config.healthBonus + character.health);
    state.health = state.maxHealth;
    state.renderedHealth = -1;
    state.invincibleUntil = 0;
    state.nextEnemyAt = 350;
    state.nextCoinAt = 200;
    state.nextHeartAt = 9000;
    state.nextPowerAt = 7000;
    state.activePowers = {};
    state.renderedPowers = "";
    state.shieldCharges = 0;
    state.rageUntil = 0;
    state.revivesLeft = character.revives || 0;
    state.lastAttackAt = 0;
    state.attackQueued = false;
    state.nightActive = false;
    state.boss = null;
    state.player.x = state.width / 2;
    state.player.y = state.height / 2;
    state.player.vx = 0;
    state.player.vy = 0;
    updatePlayerSkin();
    playerEl.classList.remove("invincible", "boosted", "shielded");
    nightOverlay.classList.remove("active");
    bossBar.classList.remove("active");
    updateHud();
    showScreen(null);
    spawnEnemy();
    spawnEnemy();
    spawnCoin();
    floatText(`LEVEL ${stage}`, state.player.x, state.player.y - 70);
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
    if (state.attackQueued) tryAttack();
    updateSpawns();
    updateEnemies(dt);
    updateProjectiles(dt);
    updatePickups();
    updatePowers();
    updateHardModeLighting();
    updateParticles(dt);
    updateFloatingText();
    if (performance.now() > state.invincibleUntil) playerEl.classList.remove("invincible");
    updateLowHealthWarning();
    updatePowerClasses();
    updateHud();
  }

  function movePlayer(dt) {
    const left = keys.has("a") || keys.has("arrowleft");
    const right = keys.has("d") || keys.has("arrowright");
    const up = keys.has("w") || keys.has("arrowup");
    const down = keys.has("s") || keys.has("arrowdown");
    let dx = Number(right) - Number(left);
    let dy = Number(down) - Number(up);
    const length = Math.hypot(dx, dy) || 1;
    dx /= length;
    dy /= length;
    if (Math.abs(dx) + Math.abs(dy) > 0) {
      state.player.aimX = dx;
      state.player.aimY = dy;
    }
    const character = getCharacter();
    const speedBoost = getPowerTimeLeft("boost") > 0 ? 1.34 : 1;
    const targetVx = dx * (state.player.speed + character.speed) * speedBoost;
    const targetVy = dy * (state.player.speed + character.speed) * speedBoost;
    const smoothing = 1 - Math.pow(0.0009, dt);
    state.player.vx += (targetVx - state.player.vx) * smoothing;
    state.player.vy += (targetVy - state.player.vy) * smoothing;
    state.player.x += state.player.vx * dt;
    state.player.y += state.player.vy * dt;
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
    const god = getCharacter().god;
    const cooldown = god ? Math.max(160, weapon.cooldown * .55) : weapon.cooldown;
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
    const config = difficultySettings[state.difficulty];
    const t = state.elapsed;
    if (state.phase === "mobs" && t >= state.nextEnemyAt) {
      spawnEnemy();
      state.nextEnemyAt = t + Math.max(360, config.spawnDelay - state.stage * 42) + random(0, 260);
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
    if (state.phase === "mobs" && state.stageKills >= state.killGoal) spawnBoss();
  }

  function updateEnemies(dt) {
    const config = difficultySettings[state.difficulty];
    const freezeFactor = getPowerTimeLeft("freeze") > 0 ? .18 : 1;
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
          enemy.skillTimer = enemy.type === "final" ? 1450 : 2200;
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
      const speed = (config.enemySpeed + state.stage * 5) * enemy.speedMultiplier * bossFactor * ghostFactor * freezeFactor;
      enemy.x += (moveX / len) * speed * dt;
      enemy.y += (moveY / len) * speed * dt;
      enemy.x = clamp(enemy.x, enemy.r, state.width - enemy.r);
      enemy.y = clamp(enemy.y, enemy.r + 62, state.height - enemy.r);
      enemy.facing = moveX >= 0 ? 1 : -1;
      if (distance < enemy.r + state.player.r) {
        if (getPowerTimeLeft("vulnerable") > 0 && enemy.type !== "boss" && enemy.type !== "final") damageEnemy(enemy, 999);
        else if (enemy.type === "ghost") stealCoins(enemy);
        else damagePlayer(enemy.damage || config.damage);
      }
    }
  }

  function bossSkill(boss) {
    if (boss.type === "final") {
      for (let i = 0; i < 3; i += 1) spawnEnemy(true);
      shake();
      floatText("NO ONE CALLS", boss.x, boss.y - 86);
    } else {
      spawnEnemy(true);
      floatText("MINIONS", boss.x, boss.y - 70);
    }
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
    state.stageKills += enemy.type === "normal" || enemy.type === "ghost" ? 1 : 0;
    floatText(`+${reward}`, enemy.x, enemy.y - 24);
    burst(enemy.x, enemy.y, enemy.type === "final" ? 42 : 18, enemy.type === "final" ? ["#fff", "#ffe15b", "#8d59ff"] : ["#fff7a6", "#ffd24f", "#ff9f2e"]);
    enemy.element.remove();
    state.enemies.splice(index, 1);
    if (enemy === state.boss) {
      state.boss = null;
      if (state.stage >= 10) winGame();
      else clearStage();
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
    const gain = Math.round(coin.value * difficultySettings[state.difficulty].coinScale);
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

  const powerDefinitions = {
    freeze: { duration: 4200, message: "FREEZE" },
    shield: { duration: 6500, message: "SHIELD" },
    boost: { duration: 5200, message: "BOOST" },
    vulnerable: { duration: 5200, message: "ENEMIES WEAK" }
  };

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
    const character = getCharacter();
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
      if (state.revivesLeft > 0 && state.save.equippedCharacter === "god") {
        state.revivesLeft -= 1;
        state.health = Math.ceil(state.maxHealth * .55);
        state.invincibleUntil = now + 2200;
        createGodWaves();
        floatText("REVIVE", state.player.x, state.player.y - 55);
      } else endGame();
    }
  }

  function spawnEnemy(fromBoss = false) {
    const point = randomSpawnPoint();
    const isGhost = state.difficulty === "hard" && state.stage >= 4 && Math.random() < .16 && !fromBoss;
    const element = document.createElement("div");
    element.className = `enemy entity spawn-pop${isGhost ? " ghost" : ""}`;
    enemyLayer.appendChild(element);
    const enemy = {
      type: isGhost ? "ghost" : "normal",
      x: point.x,
      y: point.y,
      r: isGhost ? 25 : 23,
      hp: 34 + state.stage * 7,
      maxHp: 34 + state.stage * 7,
      damage: 1,
      reward: isGhost ? 22 : 9 + state.stage,
      element,
      facing: point.x < state.player.x ? 1 : -1,
      speedMultiplier: random(.88, 1.16)
    };
    state.enemies.push(enemy);
    setEntityTransform(element, enemy.x, enemy.y, enemy.facing);
    setTimeout(() => element.classList.remove("spawn-pop"), 360);
  }

  function spawnBoss() {
    state.phase = "boss";
    enemyLayer.querySelectorAll(".enemy").forEach((el) => el.classList.remove("spawn-pop"));
    const final = state.stage === 10;
    const hp = final ? 900 : 180 + state.stage * 90;
    const element = document.createElement("div");
    element.className = `enemy entity boss spawn-pop${final ? " final-boss" : ""}`;
    enemyLayer.appendChild(element);
    state.boss = {
      type: final ? "final" : "boss",
      x: state.width / 2,
      y: 120,
      r: final ? 82 : 58,
      hp,
      maxHp: hp,
      damage: final ? 2 : 1,
      reward: final ? 600 : 95 + state.stage * 35,
      skillTimer: 1800,
      element,
      facing: 1,
      speedMultiplier: final ? .95 : .82
    };
    state.enemies.push(state.boss);
    bossNameEl.textContent = final ? "NO ONE" : `${bossNames[state.stage - 1]} - Level ${state.stage}`;
    bossBar.classList.add("active");
    playSound("boss");
    shake();
    floatText(final ? "NO ONE ARRIVES" : "BOSS", state.width / 2, state.height / 2 - 80);
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
    state.mode = "stageClear";
    cancelAnimationFrame(animationId);
    bankCoins();
    bossBar.classList.remove("active");
    $("stageClearTitle").textContent = `Level ${state.stage} cleared`;
    $("stageClearText").textContent = `You earned ${state.bankedThisRun} coins this run. Upgrade before the next boss if your hands are sweating.`;
    showScreen("stageClear");
    updateSaveBest();
  }

  function winGame() {
    state.mode = "credits";
    cancelAnimationFrame(animationId);
    bankCoins();
    addLeaderboard(true);
    bossBar.classList.remove("active");
    nightOverlay.classList.add("active");
    playSound("victory");
    showScreen("credits");
  }

  function endGame() {
    state.mode = "gameOver";
    cancelAnimationFrame(animationId);
    bankCoins();
    addLeaderboard(false);
    bossBar.classList.remove("active");
    $("finalScore").textContent = state.bankedThisRun;
    $("finalTime").textContent = `Level ${state.stage}`;
    $("finalBest").textContent = state.save.bestStage;
    playSound("gameOver");
    showScreen("gameOver");
    updateHud();
  }

  function bankCoins() {
    state.bankedThisRun += state.runCoins;
    state.save.coins += state.runCoins;
    state.runCoins = 0;
    renderShop();
  }

  function updateSaveBest() {
    state.save.bestStage = Math.max(state.save.bestStage, state.stage);
  }

  function addLeaderboard(won) {
    updateSaveBest();
    state.save.leaderboard.push({
      stage: state.stage,
      coins: state.bankedThisRun,
      weapon: getWeapon().name,
      character: getCharacter().name,
      won,
      date: new Date().toLocaleDateString()
    });
    state.save.leaderboard.sort((a, b) => Number(b.won) - Number(a.won) || b.stage - a.stage || b.coins - a.coins);
    state.save.leaderboard = state.save.leaderboard.slice(0, 8);
    renderLeaderboard();
  }

  function openShop(returnScreen) {
    playSound("click");
    state.shopReturn = returnScreen;
    renderShop();
    showScreen("shop");
  }

  function closeShop() {
    playSound("click");
    showScreen(state.shopReturn === "stageClear" ? "stageClear" : "start");
  }

  function renderShop() {
    walletValue.textContent = state.save.coins;
    shopGrid.replaceChildren();
    const cards = [
      ...Object.entries(weapons).filter(([id]) => id !== "default").map(([id, item]) => ({ type: "weapon", id, ...item })),
      ...Object.entries(characters).filter(([id]) => id !== "blue").map(([id, item]) => ({ type: "character", id, icon: item.color, ...item }))
    ];
    for (const item of cards) {
      const owned = item.type === "weapon" ? state.save.ownedWeapons.includes(item.id) : state.save.ownedCharacters.includes(item.id);
      const equipped = item.type === "weapon" ? state.save.equippedWeapon === item.id : state.save.equippedCharacter === item.id;
      const card = document.createElement("div");
      card.className = `shop-card${owned ? " owned" : ""}${state.save.coins < item.cost && !owned ? " locked" : ""}`;
      card.innerHTML = `
        <div class="shop-icon ${item.icon || item.id}"></div>
        <div><h3>${item.name}</h3><p>${item.desc}</p></div>
      `;
      const button = document.createElement("button");
      button.textContent = equipped ? "Equipped" : owned ? "Equip" : `Buy ${item.cost}`;
      button.disabled = equipped || (!owned && state.save.coins < item.cost);
      button.addEventListener("click", () => buyOrEquip(item));
      card.appendChild(button);
      shopGrid.appendChild(card);
    }
  }

  function buyOrEquip(item) {
    const ownedList = item.type === "weapon" ? state.save.ownedWeapons : state.save.ownedCharacters;
    if (!ownedList.includes(item.id)) {
      if (state.save.coins < item.cost) return;
      state.save.coins -= item.cost;
      ownedList.push(item.id);
      playSound("coin");
    } else {
      playSound("click");
    }
    if (item.type === "weapon") state.save.equippedWeapon = item.id;
    else state.save.equippedCharacter = item.id;
    updatePlayerSkin();
    renderShop();
    updateHud();
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
      li.textContent = `${run.won ? "Victory" : `Level ${run.stage}`} - ${run.coins} coins - ${run.character} / ${run.weapon} - ${run.date}`;
      leaderboardList.appendChild(li);
    }
  }

  function exportSaveFile() {
    playSound("click");
    const blob = new Blob([JSON.stringify(state.save, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "verdant-rush-save.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function importSaveFile() {
    const file = saveInput.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const loaded = JSON.parse(String(reader.result));
        state.save = normalizeSave(loaded);
        renderShop();
        renderLeaderboard();
        updatePlayerSkin();
        updateHud();
        playSound("power");
        showScreen("start");
      } catch {
        alert("That save file could not be loaded.");
      }
      saveInput.value = "";
    };
    reader.readAsText(file);
  }

  function normalizeSave(save) {
    const fresh = defaultSave();
    return {
      ...fresh,
      ...save,
      ownedWeapons: Array.from(new Set(["default", ...(save.ownedWeapons || [])])).filter((id) => weapons[id]),
      ownedCharacters: Array.from(new Set(["blue", ...(save.ownedCharacters || [])])).filter((id) => characters[id]),
      equippedWeapon: weapons[save.equippedWeapon] ? save.equippedWeapon : "default",
      equippedCharacter: characters[save.equippedCharacter] ? save.equippedCharacter : "blue",
      leaderboard: Array.isArray(save.leaderboard) ? save.leaderboard.slice(0, 8) : []
    };
  }

  function generateDecorations() {
    decorLayer.replaceChildren();
    state.decorations = [];
    const decorPlan = [
      { kind: "tree", count: 14, min: 72, max: 110, r: 38 },
      { kind: "bush", count: 18, min: 48, max: 82, r: 24 },
      { kind: "rock", count: 10, min: 42, max: 74, r: 24 }
    ];
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

  function updateHardModeLighting() {
    const shouldUseNightCycle = state.mode === "playing" && state.difficulty === "hard";
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
    stageValue.textContent = `${state.stage}-${state.phase === "boss" ? "B" : state.stageKills + "/" + state.killGoal}`;
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
    const hue = { blue: "hue-rotate(0deg)", green: "hue-rotate(115deg)", red: "hue-rotate(155deg) saturate(1.8)", yellow: "hue-rotate(205deg) saturate(1.5)", cyan: "hue-rotate(0deg)", god: "hue-rotate(250deg) saturate(1.6) brightness(1.16)" };
    playerEl.style.filter = `drop-shadow(0 10px 10px rgba(4, 40, 44, .28)) ${hue[character.color] || ""}`;
  }

  function clearDynamicElements() {
    state.enemies = [];
    state.pickups = [];
    state.projectiles = [];
    state.particles = [];
    state.floatingText = [];
    state.activePowers = {};
    state.renderedPowers = "";
    state.shieldCharges = 0;
    state.boss = null;
    enemyLayer.replaceChildren();
    pickupLayer.replaceChildren();
    effectLayer.replaceChildren();
    powerStatus.replaceChildren();
    playerEl.classList.remove("boosted", "shielded", "low-health", "invincible");
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

  function getWeapon() {
    return weapons[state.save.equippedWeapon] || weapons.default;
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

  function playSound(type) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
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
        gameOver: { wave: "triangle", start: 210, end: 64, duration: .46, volume: .08 }
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
