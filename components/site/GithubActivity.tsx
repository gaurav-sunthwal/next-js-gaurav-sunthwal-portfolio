type Day = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };

// GitHub's own greens, with matching dark-mode shades.
const LEVEL_CLASS = [
  "bg-[#ebedf0] dark:bg-[#1f2328]",
  "bg-[#9be9a8] dark:bg-[#0e4429]",
  "bg-[#40c463] dark:bg-[#006d32]",
  "bg-[#30a14e] dark:bg-[#26a641]",
  "bg-[#216e39] dark:bg-[#39d353]",
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getContributions(username: string) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`, {
      next: { revalidate: 60 * 60 * 6 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { total: { lastYear: number }; contributions: Day[] };
    return data;
  } catch {
    return null;
  }
}

/** Server-rendered contribution graph (last 12 months). */
export async function GithubActivity({ username }: { username: string }) {
  const data = await getContributions(username);
  if (!data || data.contributions.length === 0) return null;

  // Group days into week columns, padding the first week so rows line up with weekdays.
  const days = data.contributions;
  const firstWeekday = new Date(days[0].date + "T00:00:00Z").getUTCDay();
  const padded: (Day | null)[] = [...Array(firstWeekday).fill(null), ...days];
  const weeks: (Day | null)[][] = [];
  for (let i = 0; i < padded.length; i += 7) weeks.push(padded.slice(i, i + 7));

  const monthLabels = weeks.map((week, i) => {
    const first = week.find(Boolean);
    if (!first) return "";
    const month = new Date(first.date + "T00:00:00Z").getUTCMonth();
    const prev = weeks[i - 1]?.find(Boolean);
    const prevMonth = prev ? new Date(prev.date + "T00:00:00Z").getUTCMonth() : -1;
    return month !== prevMonth && i < weeks.length - 2 ? MONTHS[month] : "";
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="-mx-1 overflow-x-auto px-1 pb-1 scrollbar-none">
        <div className="inline-flex flex-col gap-1">
          <div className="flex gap-[3px] font-mono text-[9px] text-muted-foreground/70">
            {monthLabels.map((label, i) => (
              <span key={i} className="w-[10px] overflow-visible whitespace-nowrap">
                {label}
              </span>
            ))}
          </div>
          <div className="flex gap-[3px]">
            {weeks.map((week, i) => (
              <div key={i} className="flex flex-col gap-[3px]">
                {Array.from({ length: 7 }).map((_, d) => {
                  const day = week[d];
                  return (
                    <span
                      key={d}
                      data-tooltip={day ? `${day.count} contribution${day.count === 1 ? "" : "s"} · ${new Date(day.date + "T00:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })}` : undefined}
                      className={`size-[10px] rounded-[2px] ${day ? LEVEL_CLASS[day.level] : "bg-transparent"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <a
          href={`https://github.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-foreground"
        >
          <span className="font-medium text-foreground">{data.total.lastYear.toLocaleString("en-US")}</span> contributions in the last year
        </a>
        <span className="flex items-center gap-1">
          Less
          {LEVEL_CLASS.map((c) => (
            <span key={c} className={`size-[10px] rounded-[2px] ${c}`} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}
