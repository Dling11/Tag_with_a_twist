(() => {
  "use strict";

  const gameTuning = {
    healthBonus: 1,
    enemySpeed: 82,
    spawnDelay: 1040,
    coinScale: 1.18,
    damage: 1,
    maxStage: 10
  };

  const weapons = {
    default: {
      name: "Palm Strike",
      cost: 0,
      cooldown: 390,
      damage: 16,
      range: 66,
      upgradeBase: 160,
      upgradeDamage: 6,
      upgradeRange: 5,
      desc: "Quick starter strike with enough bite for the first gate."
    },
    sword: {
      name: "Bramble Cleaver",
      cost: 760,
      cooldown: 465,
      damage: 39,
      range: 96,
      icon: "sword",
      upgradeBase: 520,
      upgradeDamage: 10,
      upgradeRange: 7,
      desc: "Wide front swing that chunks bosses and clears tight mobs."
    },
    bow: {
      name: "Moonbow",
      cost: 1150,
      cooldown: 520,
      damage: 33,
      range: 540,
      icon: "bow",
      upgradeBase: 650,
      upgradeDamage: 8,
      upgradeRange: 22,
      desc: "A clean ranged shot for players who like space."
    },
    shuriken: {
      name: "Star Shuriken",
      cost: 1650,
      cooldown: 680,
      damage: 24,
      range: 440,
      icon: "shuriken",
      upgradeBase: 820,
      upgradeDamage: 7,
      upgradeRange: 15,
      desc: "Throws three seeking blades for fast crowd control."
    }
  };

  const characters = {
    blue: {
      name: "Blue",
      cost: 0,
      color: "cyan",
      health: 0,
      speed: 0,
      magnet: 0,
      attackSpeed: 1,
      skills: [
        { slot: 1, name: "Lucky Pop", cooldown: 9000, effect: "blueSpark", desc: "Small burst that pushes nearby enemies away." }
      ],
      desc: "Balanced starter."
    },
    green: {
      name: "Green",
      cost: 650,
      color: "green",
      health: 2,
      speed: -8,
      magnet: 0,
      attackSpeed: 1,
      skills: [
        { slot: 1, name: "Half Bloom", cooldown: 16000, effect: "greenHeal", desc: "Regenerates roughly half of max HP." }
      ],
      desc: "Budget tank. More health and a dependable heal."
    },
    red: {
      name: "Red",
      cost: 1100,
      color: "red",
      health: 0,
      speed: 0,
      magnet: 0,
      attackSpeed: 1,
      rage: true,
      skills: [
        { slot: 1, name: "Rage Quake", cooldown: 14000, effect: "redBurst", desc: "Violent area burst plus rage damage." }
      ],
      desc: "Aggressive bruiser. Rage can double attack damage after getting hit."
    },
    yellow: {
      name: "Yellow",
      cost: 1250,
      color: "yellow",
      health: -1,
      speed: 34,
      magnet: 0,
      attackSpeed: .92,
      skills: [
        { slot: 1, name: "Flash Step", cooldown: 12000, effect: "yellowHaste", desc: "Huge haste burst and a forward dash." }
      ],
      desc: "Speed build with quick attacks and a burst dash."
    },
    cyan: {
      name: "Cyan",
      cost: 1450,
      color: "cyan",
      health: 0,
      speed: 10,
      magnet: 76,
      attackSpeed: 1,
      skills: [
        { slot: 1, name: "Coin Orbit", cooldown: 15000, effect: "cyanVacuum", desc: "Vacuum coins and chip nearby enemies." }
      ],
      desc: "Coin magnet specialist with a greedy vacuum skill."
    },
    void: {
      name: "Void",
      cost: 7800,
      color: "void",
      health: 1,
      speed: 18,
      magnet: 90,
      attackSpeed: .82,
      void: true,
      skills: [
        { slot: 1, name: "Gravity Blue", cooldown: 9000, effect: "voidBlue", desc: "Pulls enemies into a blue singularity wave." },
        { slot: 2, name: "Repulse Red", cooldown: 12000, effect: "voidRed", desc: "Repels everything in a violent red blast." },
        { slot: 3, name: "Void Purple", cooldown: 26000, effect: "voidPurple", desc: "Blue and Red merge into a huge screen-cutting beam." }
      ],
      desc: "Blindfolded reality breaker. Nah, I'd win."
    },
    god: {
      name: "The Divine One",
      cost: 15000,
      color: "god",
      health: 4,
      speed: 28,
      magnet: 130,
      attackSpeed: .72,
      revives: 3,
      god: true,
      skills: [
        { slot: 1, name: "Divine Pulse", cooldown: 7000, effect: "godShockwave", desc: "A holy shockwave that rejects anything nearby." },
        { slot: 2, name: "Judgment Rain", cooldown: 13000, effect: "godJudgment", desc: "Golden strikes hit everything visible." },
        { slot: 3, name: "Celestial Verdict", cooldown: 22000, effect: "godFinisher", desc: "A divine finisher that can execute weakened bosses." },
        { slot: 4, name: "Reality Crack", cooldown: 56000, effect: "godRealityCrack", desc: "Cracks the arena open with screen-splitting divine judgment." },
        { slot: 5, name: "Divine Overdrive", cooldown: 42000, effect: "godReality", desc: "Ten seconds of blue-gold aura, blink steps, immunity, and omnibeams." }
      ],
      desc: "A fearless divine being wrapped in blue-gold aura, judgment beams, and impossible revives."
    }
  };

  const stageCatalog = [
    {
      id: 1,
      name: "Bramble Gate",
      bossName: "Rootjaw",
      bossTitle: "Gate Breaker",
      bossClass: "root",
      skill: "rootTrap",
      killGoal: 7,
      hp: 260,
      reward: 125,
      enemySpeedBonus: 0,
      spawnDelayBonus: 110,
      coinScale: 1.02,
      ghostChance: 0,
      theme: "bramble",
      clearText: "The first gate breaks open. The woods are officially paying attention."
    },
    {
      id: 2,
      name: "Cinder Orchard",
      bossName: "Ember Warden",
      bossTitle: "Ash Keeper",
      bossClass: "ember",
      skill: "emberRing",
      killGoal: 10,
      hp: 360,
      reward: 165,
      enemySpeedBonus: 6,
      spawnDelayBonus: 30,
      coinScale: 1.08,
      ghostChance: 0,
      theme: "ember",
      clearText: "Smoke thins between the trees. The shop will love those coins."
    },
    {
      id: 3,
      name: "Tideleaf Crossing",
      bossName: "Tidemask",
      bossTitle: "River Trickster",
      bossClass: "tide",
      skill: "tideLines",
      killGoal: 12,
      hp: 460,
      reward: 205,
      enemySpeedBonus: 9,
      spawnDelayBonus: -10,
      coinScale: 1.12,
      ghostChance: .04,
      theme: "tide",
      clearText: "The crossing settles behind you. Something deeper just woke up."
    },
    {
      id: 4,
      name: "Ironroot Hollow",
      bossName: "Iron Bell",
      bossTitle: "Hollow Guard",
      bossClass: "iron",
      skill: "quake",
      killGoal: 14,
      hp: 570,
      reward: 250,
      enemySpeedBonus: 12,
      spawnDelayBonus: -35,
      coinScale: 1.16,
      ghostChance: .07,
      theme: "iron",
      clearText: "The hollow stops ringing. For now."
    },
    {
      id: 5,
      name: "Glasscap Grove",
      bossName: "Glass Widow",
      bossTitle: "Splinter Witch",
      bossClass: "glass",
      skill: "splinters",
      killGoal: 16,
      hp: 700,
      reward: 300,
      enemySpeedBonus: 16,
      spawnDelayBonus: -70,
      coinScale: 1.2,
      ghostChance: .1,
      theme: "glass",
      clearText: "Broken reflections fall into the grass. Keep moving."
    },
    {
      id: 6,
      name: "Stormnest Rise",
      bossName: "Storm Choir",
      bossTitle: "Thunder Chorus",
      bossClass: "storm",
      skill: "stormStrike",
      killGoal: 18,
      hp: 840,
      reward: 360,
      enemySpeedBonus: 20,
      spawnDelayBonus: -100,
      coinScale: 1.25,
      ghostChance: .12,
      theme: "storm",
      clearText: "The clouds split. The path ahead is darker than it should be."
    },
    {
      id: 7,
      name: "Gravebloom Mire",
      bossName: "Grave Bloom",
      bossTitle: "Mire Heart",
      bossClass: "grave",
      skill: "haunt",
      killGoal: 20,
      hp: 990,
      reward: 430,
      enemySpeedBonus: 24,
      spawnDelayBonus: -125,
      coinScale: 1.3,
      ghostChance: .16,
      theme: "grave",
      nightCycle: true,
      clearText: "The mire exhales. You probably should not inhale back."
    },
    {
      id: 8,
      name: "Mirror Crown",
      bossName: "Mirror Crown",
      bossTitle: "False King",
      bossClass: "mirror",
      skill: "mirrorStep",
      killGoal: 22,
      hp: 1160,
      reward: 510,
      enemySpeedBonus: 28,
      spawnDelayBonus: -145,
      coinScale: 1.34,
      ghostChance: .19,
      theme: "mirror",
      nightCycle: true,
      clearText: "The false king cracks. The real problem is still ahead."
    },
    {
      id: 9,
      name: "Clockvine Spiral",
      bossName: "Clockvine",
      bossTitle: "Time Eater",
      bossClass: "clock",
      skill: "haste",
      killGoal: 24,
      hp: 1340,
      reward: 610,
      enemySpeedBonus: 33,
      spawnDelayBonus: -165,
      coinScale: 1.38,
      ghostChance: .22,
      theme: "clock",
      nightCycle: true,
      clearText: "The spiral loses count. One last stage."
    },
    {
      id: 10,
      name: "The Empty Center",
      bossName: "No One",
      bossTitle: "Heavenless Monarch",
      bossClass: "no-one",
      skill: "noOne",
      killGoal: 26,
      hp: 5200,
      reward: 1650,
      enemySpeedBonus: 38,
      spawnDelayBonus: -190,
      coinScale: 1.45,
      ghostChance: .32,
      theme: "void",
      nightCycle: true,
      final: true,
      clearText: "The empty throne kneels. Even silence remembers your name."
    }
  ];

  const powerDefinitions = {
    freeze: { duration: 4200, message: "FREEZE" },
    shield: { duration: 6500, message: "SHIELD" },
    boost: { duration: 5200, message: "BOOST" },
    vulnerable: { duration: 5200, message: "ENEMIES WEAK" }
  };

  const defaultSave = () => ({
    version: 5,
    coins: 0,
    ownedWeapons: ["default"],
    equippedWeapon: "default",
    weaponLevels: { default: 1 },
    ownedCharacters: ["blue"],
    equippedCharacter: "blue",
    leaderboard: [],
    bestStage: 1,
    profileSlot: 1,
    profileName: "Rowell",
    settings: {
      music: true,
      sfx: true
    }
  });

  window.VerdantRushContent = {
    gameTuning,
    weapons,
    characters,
    stageCatalog,
    powerDefinitions,
    defaultSave
  };
})();
