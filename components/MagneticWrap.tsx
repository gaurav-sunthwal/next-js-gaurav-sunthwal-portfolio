import React, { useRef, useEffect } from "react";

interface MagneticWrapProps {
  children: React.ReactElement<{ className?: string; style?: React.CSSProperties }>;
  className?: string;
}

export const MagneticWrap: React.FC<MagneticWrapProps> = ({ children, className = "" }) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = wrap.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      const child = wrap.firstElementChild as HTMLElement;
      if (child) {
        child.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      }
    };

    const handleMouseLeave = () => {
      const child = wrap.firstElementChild as HTMLElement;
      if (child) {
        child.style.transform = `translate(0px, 0px)`;
      }
    };

    wrap.addEventListener("mousemove", handleMouseMove);
    wrap.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      wrap.removeEventListener("mousemove", handleMouseMove);
      wrap.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // Clone children to ensure they have the proper classes/styles transition
  return (
    <div ref={wrapRef} className={`magnetic-wrap ${className}`}>
      {React.cloneElement(children, {
        className: `${children.props.className || ""} magnetic-content`.trim(),
      })}
    </div>
  );
};
