(() => {
  "use strict";

  const STORAGE_KEY = "soul-dominion-save-v1";
  const LEGACY_STORAGE_KEY = "verdant-rush-save-v3";
  const ACTIVE_SLOT_KEY = `${STORAGE_KEY}-active-slot`;
  const SLOT_COUNT = 3;
  const { defaultSave, weapons, wings, characters } = window.VerdantRushContent;

  function defaultProfileName(slot) {
    return slot === 1 ? "Rowell" : `Player ${slot}`;
  }

  function cleanName(name, fallback) {
    const value = String(name || "").replace(/\s+/g, " ").trim().slice(0, 18);
    return value || fallback;
  }

  function normalizeSlot(slot) {
    return Math.max(1, Math.min(SLOT_COUNT, Math.floor(Number(slot) || 1)));
  }

  function getActiveSlot() {
    try {
      return normalizeSlot(window.localStorage.getItem(ACTIVE_SLOT_KEY));
    } catch {
      return 1;
    }
  }

  function setActiveSlot(slot) {
    const safeSlot = normalizeSlot(slot);
    try {
      window.localStorage.setItem(ACTIVE_SLOT_KEY, String(safeSlot));
    } catch {
      // Ignore storage failure; the in-memory save can still run.
    }
    return safeSlot;
  }

  function slotKey(slot) {
    return `${STORAGE_KEY}-slot-${normalizeSlot(slot)}`;
  }

  function normalizeSave(save = {}, forcedSlot = null) {
    const fresh = defaultSave();
    const candidate = save && typeof save === "object" ? save : {};
    const profileSlot = normalizeSlot(forcedSlot || candidate.profileSlot || getActiveSlot());
    const profileName = cleanName(candidate.profileName, defaultProfileName(profileSlot));
    const ownedWeapons = Array.from(new Set(["default", ...(candidate.ownedWeapons || [])])).filter((id) => weapons[id]);
    const ownedWings = Array.from(new Set(["none", ...(candidate.ownedWings || [])])).filter((id) => wings[id]);
    const ownedCharacters = Array.from(new Set(["blue", ...(candidate.ownedCharacters || [])])).filter((id) => characters[id]);
    const leaderboard = Array.isArray(candidate.leaderboard)
      ? candidate.leaderboard.slice(0, 12).map((run) => ({ ...run, name: cleanName(run.name || profileName, profileName) }))
      : [];
    const coins = Math.max(0, Math.floor(Number(candidate.coins) || 0));
    const bestStage = Math.max(1, Math.min(11, Math.floor(Number(candidate.bestStage) || 1)));
    const weaponLevels = {};
    for (const id of ownedWeapons) {
      const level = Math.floor(Number(candidate.weaponLevels?.[id]) || 1);
      weaponLevels[id] = Math.max(1, Math.min(5, level));
    }
    const settings = {
      music: candidate.settings?.music !== false,
      sfx: candidate.settings?.sfx !== false
    };

    return {
      ...fresh,
      ...candidate,
      version: fresh.version,
      profileSlot,
      profileName,
      coins,
      ownedWeapons,
      equippedWeapon: ownedWeapons.includes(candidate.equippedWeapon) && weapons[candidate.equippedWeapon] ? candidate.equippedWeapon : "default",
      weaponLevels,
      ownedWings,
      equippedWings: ownedWings.includes(candidate.equippedWings) && wings[candidate.equippedWings] ? candidate.equippedWings : "none",
      ownedCharacters,
      equippedCharacter: ownedCharacters.includes(candidate.equippedCharacter) && characters[candidate.equippedCharacter] ? candidate.equippedCharacter : "blue",
      leaderboard,
      bestStage,
      settings
    };
  }

  function loadSave(slot = getActiveSlot()) {
    const activeSlot = setActiveSlot(slot);
    try {
      let raw = window.localStorage.getItem(slotKey(activeSlot));
      if (!raw && activeSlot === 1) raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? normalizeSave(JSON.parse(raw), activeSlot) : normalizeSave({}, activeSlot);
    } catch {
      return normalizeSave({}, activeSlot);
    }
  }

  function persistSave(save) {
    try {
      const normalized = normalizeSave(save);
      setActiveSlot(normalized.profileSlot);
      window.localStorage.setItem(slotKey(normalized.profileSlot), JSON.stringify(normalized));
      return true;
    } catch {
      return false;
    }
  }

  function getProfileSummaries() {
    const activeSlot = getActiveSlot();
    const summaries = [];
    for (let slot = 1; slot <= SLOT_COUNT; slot += 1) {
      const save = loadSlotPreview(slot);
      summaries.push({
        slot,
        active: slot === activeSlot,
        profileName: save.profileName,
        bestStage: save.bestStage,
        coins: save.coins,
        character: characters[save.equippedCharacter]?.name || "Blue",
        wings: wings[save.equippedWings]?.name || "No Wings",
        hasSeraphWings: save.ownedWings?.includes("seraph") || false
      });
    }
    setActiveSlot(activeSlot);
    return summaries;
  }

  function loadSlotPreview(slot) {
    const safeSlot = normalizeSlot(slot);
    try {
      let raw = window.localStorage.getItem(slotKey(safeSlot));
      if (!raw && safeSlot === 1) raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      return raw ? normalizeSave(JSON.parse(raw), safeSlot) : normalizeSave({}, safeSlot);
    } catch {
      return normalizeSave({}, safeSlot);
    }
  }

  function exportSaveFile(save) {
    const blob = new Blob([JSON.stringify(normalizeSave(save), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const profileName = cleanName(save.profileName, "player").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "player";
    anchor.download = `soul-dominion-${profileName}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function readSaveFile(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error("No file selected."));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          resolve(normalizeSave(JSON.parse(String(reader.result))));
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(reader.error || new Error("Save file could not be read."));
      reader.readAsText(file);
    });
  }

  window.VerdantRushStorage = {
    STORAGE_KEY,
    normalizeSave,
    loadSave,
    persistSave,
    getActiveSlot,
    setActiveSlot,
    getProfileSummaries,
    exportSaveFile,
    readSaveFile
  };
})();
