(() => {
  "use strict";

  const STORAGE_KEY = "verdant-rush-save-v3";
  const { defaultSave, weapons, characters } = window.VerdantRushContent;

  function normalizeSave(save = {}) {
    const fresh = defaultSave();
    const candidate = save && typeof save === "object" ? save : {};
    const ownedWeapons = Array.from(new Set(["default", ...(candidate.ownedWeapons || [])])).filter((id) => weapons[id]);
    const ownedCharacters = Array.from(new Set(["blue", ...(candidate.ownedCharacters || [])])).filter((id) => characters[id]);
    const leaderboard = Array.isArray(candidate.leaderboard) ? candidate.leaderboard.slice(0, 8) : [];
    const coins = Math.max(0, Math.floor(Number(candidate.coins) || 0));
    const bestStage = Math.max(1, Math.min(10, Math.floor(Number(candidate.bestStage) || 1)));
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
      coins,
      ownedWeapons,
      equippedWeapon: ownedWeapons.includes(candidate.equippedWeapon) && weapons[candidate.equippedWeapon] ? candidate.equippedWeapon : "default",
      weaponLevels,
      ownedCharacters,
      equippedCharacter: ownedCharacters.includes(candidate.equippedCharacter) && characters[candidate.equippedCharacter] ? candidate.equippedCharacter : "blue",
      leaderboard,
      bestStage,
      settings
    };
  }

  function loadSave() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeSave(JSON.parse(raw)) : defaultSave();
    } catch {
      return defaultSave();
    }
  }

  function persistSave(save) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSave(save)));
      return true;
    } catch {
      return false;
    }
  }

  function exportSaveFile(save) {
    const blob = new Blob([JSON.stringify(normalizeSave(save), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "verdant-rush-save.json";
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
    exportSaveFile,
    readSaveFile
  };
})();
