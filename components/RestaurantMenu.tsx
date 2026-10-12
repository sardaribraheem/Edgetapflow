// Phone screen: a digital restaurant menu (use case 02 / AT A RESTAURANT).
export default function RestaurantMenu() {
  const sections = [
    { title: "Food", items: ["Burger & fries", "Margherita", "Butter chicken"] },
    { title: "Drinks", items: ["Mango lassi", "Cold brew", "Sparkling water"] },
    { title: "Specials", items: ["Chef's board", "Tonight's fish"] },
  ];

  return (
    <div className="flex h-full flex-col px-4 pt-12">
      <div className="pt-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--coral)]">
          Tap → Menu
        </div>
        <div className="mt-1 font-display text-[20px] font-semibold leading-none text-[var(--ink)]">
          Casa Verde
        </div>
        <div className="mt-1 text-[10px] text-[var(--ink-mid)]">
          Fresh · Local · Daily
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3">
        {sections.map((s) => (
          <div key={s.title}>
            <div className="mb-1 flex items-center gap-2">
              <span className="text-[11px] font-bold text-[var(--ink)]">{s.title}</span>
              <span className="h-px flex-1 bg-[var(--ink)]/10" />
            </div>
            <div className="flex flex-col gap-1">
              {s.items.map((item) => (
                <div
                  key={item}
                  className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[11px] text-[var(--ink)] ring-1 ring-[var(--ink)]/6"
                >
                  <span>{item}</span>
                  <span className="text-[var(--ink-faint)]">·</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-center gap-1 pb-3 pt-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-faint)]">
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--coral)]" /> Powered by EdgeTap
      </div>
    </div>
  );
}
