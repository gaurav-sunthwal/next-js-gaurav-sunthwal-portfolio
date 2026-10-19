import type { CSSProperties } from "react";
import type { StackItem } from "@/lib/content";
import { Reveal, TechChip } from "./ui";

/** Tech stack: wrapped chips on desktop, three scrolling rows on mobile. */
export function Stack({ items }: { items: StackItem[] }) {
  const rowSize = Math.ceil(items.length / 3);
  const rows = [0, 1, 2].map((r) => items.slice(r * rowSize, (r + 1) * rowSize)).filter((r) => r.length);

  return (
    <>
      <div className="sm:hidden">
        <div className="-mx-6 flex flex-col gap-2 overflow-hidden mask-[linear-gradient(to_right,transparent,black_8%,black_92%,transparent)] motion-reduce:overflow-x-auto">
          {rows.map((row, r) => (
            <div
              key={r}
              className={`marquee flex w-max ${r % 2 === 1 ? "marquee-reverse" : ""}`}
              style={{ "--marquee-duration": `${30 + row.length}s` } as CSSProperties}
            >
              {[0, 1].map((copy) => (
                <div key={copy} aria-hidden={copy === 1} className="flex flex-none gap-2 pr-2">
                  {row.map((item) => (
                    <TechChip key={item.name} name={item.name} icon={item.icon} note={r * rowSize + row.indexOf(item)} />
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden sm:flex sm:flex-wrap sm:gap-2.5">
        {items.map((item, i) => (
          <Reveal key={item.name} delay={Math.min(i * 20, 600)}>
            <TechChip name={item.name} icon={item.icon} note={i} />
          </Reveal>
        ))}
      </div>
    </>
  );
}
