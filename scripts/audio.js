(() => {
  "use strict";

  function createAudioSystem({ getSettings, getMode, getCharacter, getStage, getBoss, isDivineOverdriveActive }) {
    let audioContext = null;
    let musicTimer = 0;
    let musicStep = 0;
    let playerActivated = false;

    const markPlayerActivated = (event) => {
      if (event.isTrusted) playerActivated = true;
    };

    window.addEventListener("pointerdown", markPlayerActivated, { capture: true });
    window.addEventListener("keydown", markPlayerActivated, { capture: true });

    function startMusic() {
      if (musicTimer || getSettings()?.music === false) return;
      musicStep = 0;
      musicTimer = window.setInterval(() => {
        if (getMode() !== "playing") return;
        playMusicStep();
      }, 680);
    }

    function stopMusic() {
      if (!musicTimer) return;
      window.clearInterval(musicTimer);
      musicTimer = 0;
    }

    function playMusicStep() {
      const character = getCharacter();
      const boss = getBoss?.();
      if (getStage?.() === 11 || boss?.superboss) {
        playOneAboveTheme(boss);
        return;
      }
      if (character.god) {
        playDivineTheme();
        return;
      }

      const track = character.void
        ? [131, 196, 262, 392, 523]
        : [262, 330, 392, 523];
      const note = track[musicStep % track.length];
      playTone(note, .16, character.void ? "sawtooth" : "sine", character.void ? .026 : .016);
      musicStep += 1;
    }

    function playOneAboveTheme(boss) {
      const ascended = boss?.superPhase === 2;
      const drone = ascended ? [55, 61, 73, 82] : [73, 82, 98, 110];
      const chant = ascended ? [147, 165, 196, 247, 294, 392] : [123, 147, 196, 247];
      const low = drone[musicStep % drone.length];
      const note = chant[Math.floor(musicStep / 2) % chant.length];

      playTone(low, ascended ? .82 : .7, "sawtooth", ascended ? .026 : .018, low * .995);
      playTone(note, ascended ? .42 : .34, "triangle", ascended ? .018 : .012);
      if (musicStep % 3 === 2) playTone(note * 2, .9, "sine", ascended ? .012 : .008, note * 2.01);
      if (ascended && musicStep % 4 === 1) playTone(41, .65, "square", .012);
      musicStep += 1;
    }

    function playDivineTheme() {
      const overdrive = Boolean(isDivineOverdriveActive?.());
      const melody = overdrive
        ? [247, 294, 392, 494, 588, 784, 988, 1175]
        : [196, 247, 294, 370, 392, 494, 588, 784];
      const bass = overdrive ? [98, 123, 147, 196] : [98, 147, 196, 247];
      const choir = overdrive
        ? [[247, 294, 392], [294, 370, 494], [392, 494, 588], [494, 588, 784]]
        : [[196, 247, 294], [247, 294, 370], [294, 370, 494], [247, 392, 494]];
      const note = melody[musicStep % melody.length];
      const low = bass[Math.floor(musicStep / 2) % bass.length];

      playTone(note, overdrive ? .18 : .22, "triangle", overdrive ? .03 : .022);
      if (musicStep % 2 === 0) playTone(low, .34, "sine", overdrive ? .018 : .012);
      if (musicStep % 4 === 3) playTone(note * 1.5, .12, "sine", overdrive ? .022 : .014);
      if (musicStep % 2 === 1) {
        const chord = choir[Math.floor(musicStep / 2) % choir.length];
        chord.forEach((frequency, index) => {
          playTone(frequency * (index === 2 ? 2 : 1), overdrive ? .62 : .78, "sine", overdrive ? .011 : .0085, frequency * (index === 2 ? 2.01 : 1.005));
        });
      }
      musicStep += 1;
    }

    function ensureAudioContext() {
      if (!audioContext && !playerActivated) {
        throw new Error("Audio is waiting for a player gesture.");
      }
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    }

    function playTone(frequency, duration, wave = "sine", volume = .04, endFrequency = frequency) {
      if (getSettings()?.music === false && volume <= .03) return;
      if (getSettings()?.sfx === false && volume > .03) return;
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
      if (getSettings()?.sfx === false) return;
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
          portal: { wave: "triangle", start: 190, end: 980, duration: .55, volume: .085 },
          reality: { wave: "sawtooth", start: 64, end: 1240, duration: .8, volume: .092 }
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

    return {
      startMusic,
      stopMusic,
      playSound,
      playTone
    };
  }

  window.VerdantRushAudio = {
    createAudioSystem
  };
})();
