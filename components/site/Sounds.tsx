"use client";

import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

/*
 * Tiny interface sounds, synthesised with the Web Audio API (no audio files).
 * Elements opt in with attributes:
 *   data-sfx="tap|pop|soft|toggle|expand"   → plays on click
 *   data-sfx-hover="whisper|tick|hover"      → plays on mouse hover
 *   data-sfx-note="3"                        → plays a musical note on hover
 */

type Sound = "tap" | "pop" | "soft" | "toggle" | "expand" | "whisper" | "tick" | "hover";

const KEY = "sfx";
const EVENT = "sfx-change";
let ctx: AudioContext | null = null;

export function soundsEnabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

function audio() {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, { duration = 0.06, gain = 0.05, type = "sine" as OscillatorType, endFreq = freq } = {}) {
  const ac = audio();
  if (!ac || ac.state !== "running") return;
  const t = ac.currentTime;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), t + duration);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.connect(g).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration + 0.02);
}

const SOUNDS: Record<Sound, () => void> = {
  tap: () => tone(520, { duration: 0.05, gain: 0.06, endFreq: 380 }),
  pop: () => tone(300, { duration: 0.09, gain: 0.08, endFreq: 900 }),
  soft: () => tone(440, { duration: 0.04, gain: 0.035, endFreq: 360 }),
  toggle: () => {
    tone(660, { duration: 0.05, gain: 0.05 });
    setTimeout(() => tone(880, { duration: 0.06, gain: 0.04 }), 45);
  },
  expand: () => tone(360, { duration: 0.08, gain: 0.05, endFreq: 520 }),
  whisper: () => tone(1800, { duration: 0.025, gain: 0.012, type: "triangle" }),
  tick: () => tone(1400, { duration: 0.02, gain: 0.018, type: "square" }),
  hover: () => tone(980, { duration: 0.03, gain: 0.015, type: "triangle" }),
};

// C major pentatonic across two octaves, for the stack chips.
const NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51, 1567.98, 1760];

export function play(sound: Sound) {
  if (soundsEnabled()) SOUNDS[sound]?.();
}

/** Global listeners. Mounted once in the site layout. */
export function SoundEffects() {
  useEffect(() => {
    // Browsers only allow audio after the first click/tap.
    const unlock = () => audio()?.resume();
    let lastHover: Element | null = null;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element).closest?.("[data-sfx]");
      const name = el?.getAttribute("data-sfx") as Sound | null;
      if (name) play(name);
    };
    const onOver = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !soundsEnabled()) return;
      const target = e.target as Element;
      const el = target.closest?.("[data-sfx-hover],[data-sfx-note]") ?? null;
      if (el === lastHover) return;
      lastHover = el;
      if (!el) return;
      const note = el.getAttribute("data-sfx-note");
      if (note !== null) {
        tone(NOTES[Number(note) % NOTES.length], { duration: 0.18, gain: 0.03, type: "triangle" });
      } else {
        play(el.getAttribute("data-sfx-hover") as Sound);
      }
    };

    document.addEventListener("pointerdown", unlock);
    document.addEventListener("click", onClick);
    document.addEventListener("pointerover", onOver);
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onOver);
    };
  }, []);
  return null;
}

/** Speaker button in the header. */
export function SoundToggle() {
  const [on, setOn] = useState(true);

  useEffect(() => {
    const sync = () => setOn(soundsEnabled());
    sync();
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = () => {
    const next = !on;
    try {
      localStorage.setItem(KEY, next ? "on" : "off");
    } catch {}
    window.dispatchEvent(new Event(EVENT));
    if (next) {
      audio()?.resume();
      setTimeout(() => SOUNDS.toggle(), 30);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Interface sounds"
      aria-pressed={on}
      data-tooltip={on ? "Turn sounds off" : "Turn sounds on"}
      data-tooltip-side="bottom"
      className="flex size-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {on ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
    </button>
  );
}
