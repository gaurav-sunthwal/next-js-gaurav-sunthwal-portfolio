"use client";

import { useEffect, useState } from "react";

type Side = "top" | "bottom" | "left" | "right";
type Tip = { text: string; side: Side; rect: DOMRect };

/**
 * One tooltip for the whole site. Any element with `data-tooltip="Text"`
 * (and optionally `data-tooltip-side="right"`) gets a tooltip on hover/focus,
 * so server components don't need any extra JavaScript.
 */
export function TooltipLayer() {
  const [tip, setTip] = useState<Tip | null>(null);

  useEffect(() => {
    let current: Element | null = null;

    const showFor = (target: EventTarget | null) => {
      const el = target instanceof Element ? target.closest("[data-tooltip]") : null;
      if (el === current) return;
      current = el;
      const text = el?.getAttribute("data-tooltip");
      if (!el || !text) return setTip(null);
      setTip({ text, side: (el.getAttribute("data-tooltip-side") as Side) || "top", rect: el.getBoundingClientRect() });
    };
    const clear = () => {
      current = null;
      setTip(null);
    };
    const onOver = (e: PointerEvent) => e.pointerType === "mouse" && showFor(e.target);
    const onOut = (e: PointerEvent) => !e.relatedTarget && clear();
    const onFocus = (e: FocusEvent) => {
      if (e.target instanceof Element && e.target.matches(":focus-visible")) showFor(e.target);
    };

    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerout", onOut);
    document.addEventListener("pointerdown", clear);
    document.addEventListener("focusin", onFocus);
    document.addEventListener("focusout", clear);
    window.addEventListener("scroll", clear, { passive: true, capture: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerout", onOut);
      document.removeEventListener("pointerdown", clear);
      document.removeEventListener("focusin", onFocus);
      document.removeEventListener("focusout", clear);
      window.removeEventListener("scroll", clear, { capture: true });
    };
  }, []);

  if (!tip) return null;

  const { rect, side } = tip;
  const gap = 6;
  const pos =
    side === "bottom"
      ? { left: rect.left + rect.width / 2, top: rect.bottom + gap, transform: "translate(-50%, 0)" }
      : side === "right"
        ? { left: rect.right + gap, top: rect.top + rect.height / 2, transform: "translate(0, -50%)" }
        : side === "left"
          ? { left: rect.left - gap, top: rect.top + rect.height / 2, transform: "translate(-100%, -50%)" }
          : { left: rect.left + rect.width / 2, top: rect.top - gap, transform: "translate(-50%, -100%)" };

  return (
    <div role="tooltip" className="pointer-events-none fixed z-[9999]" style={pos}>
      <span
        key={tip.text + rect.left + rect.top}
        data-side={side}
        className="tooltip-in block whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background shadow-md"
      >
        {tip.text}
      </span>
    </div>
  );
}
