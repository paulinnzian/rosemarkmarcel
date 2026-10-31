const dayFormat = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const longDayFormat = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const number = new Intl.NumberFormat("fr-FR");

const label = (day: string, format: Intl.DateTimeFormat) => format.format(new Date(`${day}T00:00:00Z`));

/**
 * Vues par jour : une seule série (pas de légende, le titre la nomme), barres fines ancrées sur la ligne de base,
 * infobulle au survol. Le tableau en dessous donne les mêmes chiffres aux lecteurs d'écran et au clavier.
 */
export function DailyChart({ days }: { days: { day: string; views: number }[] }) {
  const max = Math.max(1, ...days.map((entry) => entry.views));
  const labelEvery = Math.ceil(days.length / 7);

  return (
    <figure className="grid gap-3">
      <figcaption className="text-sm font-bold text-ink">Vues de la page par jour</figcaption>
      <div aria-hidden="true" className="grid gap-1">
        <div className="flex h-40 items-end gap-0.5 border-b border-line">
          {days.map((entry) => (
            <div key={entry.day} className="group relative flex h-full flex-1 items-end justify-center">
              <div
                className="w-full max-w-4 rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-80"
                style={{ height: entry.views === 0 ? "0" : `max(2px, ${(entry.views / max) * 100}%)` }}
              />
              <div className="pointer-events-none absolute bottom-full z-10 mb-1 hidden whitespace-nowrap rounded-sm bg-ink px-2 py-1 text-xs text-surface group-hover:block">
                {label(entry.day, dayFormat)} : {number.format(entry.views)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-0.5 text-[11px] text-muted">
          {days.map((entry, index) => (
            <span key={entry.day} className="flex-1 overflow-visible whitespace-nowrap text-center">
              {index % labelEvery === 0 ? label(entry.day, dayFormat) : ""}
            </span>
          ))}
        </div>
      </div>
      <details className="text-sm">
        <summary className="inline-flex min-h-11 cursor-pointer items-center text-ink underline underline-offset-4">Voir les chiffres jour par jour</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="py-2 font-bold">
                Jour
              </th>
              <th scope="col" className="py-2 text-right font-bold">
                Vues
              </th>
            </tr>
          </thead>
          <tbody>
            {days.map((entry) => (
              <tr key={entry.day} className="border-b border-line">
                <td className="py-1.5">{label(entry.day, longDayFormat)}</td>
                <td className="py-1.5 text-right tabular-nums">{number.format(entry.views)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
