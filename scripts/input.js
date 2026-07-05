(() => {
  "use strict";

  const skillSlots = [1, 2, 3, 4, 5];
  const skillKeys = skillSlots.map(String);
  const movementKeys = ["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"];
  const attackKeys = [" ", "j"];
  const handledKeys = new Set([...movementKeys, ...attackKeys, ...skillKeys]);

  window.VerdantRushInput = {
    skillSlots,
    skillKeys,
    movementKeys,
    attackKeys,
    handledKeys
  };
})();
