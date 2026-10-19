"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Shared hover logic for previews: opens on mouse hover (or keyboard focus),
 * stays open while the pointer moves onto the popup, closes on scroll/Escape.
 * The popup is rendered in a portal so it is never clipped by its parent.
 */
export function useHoverPopup({ openDelay = 60, closeDelay = 120 } = {}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
      setOpen(true);
    }, openDelay);
  }, [openDelay]);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  }, [closeDelay]);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { passive: true, capture: true });
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, { capture: true });
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const triggerProps = {
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && show(),
    onPointerLeave: (e: React.PointerEvent) => e.pointerType === "mouse" && hide(),
    onFocus: show,
    onBlur: hide,
  };
  const popupProps = { onPointerEnter: show, onPointerLeave: hide };

  return { open, rect, triggerRef, triggerProps, popupProps, setOpen };
}

/** Positions children centered above `rect` (falls back below when there is no room). */
export function FloatingPortal({
  rect,
  children,
  offsetX = 0,
  width,
  height,
  align = "center",
}: {
  rect: DOMRect;
  children: ReactNode;
  offsetX?: number;
  width: number;
  height: number;
  align?: "center" | "start";
}) {
  if (typeof document === "undefined") return null;
  const margin = 8;
  const above = rect.top - height - 12 > 0;
  let left = align === "start" ? rect.left : rect.left + rect.width / 2 - width / 2 + offsetX;
  left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));
  const top = above ? rect.top - height - 10 : rect.bottom + 10;

  return createPortal(
    <div
      className="fixed z-[9998] transition-[left] duration-150 ease-out"
      style={{ left, top, width, transformOrigin: above ? "bottom center" : "top center" }}
    >
      {children}
    </div>,
    document.body
  );
}
