import type { CVData, SectionKey } from "@/lib/cv-types";
import { sectionTitle, skillLevelLabel, i18n } from "@/lib/cv-i18n";
import { getTheme } from "@/lib/cv-themes";
import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Globe,
  Calendar,
  IdCard,
  Flag,
} from "lucide-react";
import type { CSSProperties, ReactNode } from "react";

interface Props {
  data: CVData;
}

const fmtRange = (start: string, end: string, current: boolean, lang: CVData["lang"]) => {
  const s = start || "";
  const e = current ? i18n[lang].present : end || "";
  if (!s && !e) return "";
  return `${s}${s && e ? " — " : ""}${e}`;
};

const isSectionNonEmpty = (key: SectionKey, d: CVData): boolean => {
  switch (key) {
    case "profile":
      return d.profile.trim().length > 0;
    case "experience":
      return d.experiences.length > 0;
    case "education":
      return d.educations.length > 0;
    case "courses":
      return d.courses.length > 0;
    case "certifications":
      return d.certifications.length > 0;
    case "projects":
      return d.projects.length > 0;
    case "skills":
      return d.skills.length > 0;
    case "languages":
      return d.languages.length > 0;
    case "volunteer":
      return d.volunteers.length > 0;
    case "objectives":
      return d.objectives.trim().length > 0;
    case "additional":
      return d.additional.trim().length > 0;
    case "references":
      return d.showReferences && d.references.length > 0;
  }
};

const skillPercent = (level: string) =>
  ({ basic: 25, intermediate: 50, advanced: 75, expert: 100 })[level] ?? 50;

export function CVPreview({ data }: Props) {
  const theme = getTheme(data.theme);
  const primary = data.primaryColor || theme.primary;
  const secondary = data.secondaryColor || theme.secondary;
  const lang = data.lang;

  const style: CSSProperties = {
    fontFamily: `${data.font}, ui-sans-serif, system-ui, sans-serif`,
    color: theme.fg,
    background: theme.bg,
    "--cv-primary": primary,
    "--cv-secondary": secondary,
    "--cv-fg": theme.fg,
    "--cv-muted": theme.muted,
    "--cv-sidebar-bg": theme.sidebarBg,
    "--cv-sidebar-fg": theme.sidebarFg,
  } as CSSProperties;

  const sections = data.sectionsOrder.filter(
    (k) => data.sectionsVisible[k] && isSectionNonEmpty(k, data),
  );

  // Sidebar sections vs main sections
  const sidebarKeys: SectionKey[] = ["skills", "languages", "courses", "certifications"];
  const mainKeys = sections.filter((k) => !sidebarKeys.includes(k));
  const sideKeys = sections.filter((k) => sidebarKeys.includes(k));

  const layout = data.layout;

  return (
    <div id="cv-preview" className="cv-root a4" style={style}>
      {layout === "one-col" && <OneCol data={data} sections={sections} theme={theme} />}
      {layout === "two-col" && <TwoCol data={data} main={mainKeys} side={sideKeys} theme={theme} />}
      {layout === "sidebar-left" && (
        <Sidebar data={data} main={mainKeys} side={sideKeys} theme={theme} side_="left" />
      )}
      {layout === "sidebar-right" && (
        <Sidebar data={data} main={mainKeys} side={sideKeys} theme={theme} side_="right" />
      )}
    </div>
  );
}

// ---------- Layout components ----------

function OneCol({ data, sections }: { data: CVData; sections: SectionKey[]; theme: ReturnType<typeof getTheme> }) {
  return (
    <div className="p-10 space-y-6">
      <Header data={data} variant="top" />
      {sections.map((k) => (
        <Section key={k} k={k} data={data} />
      ))}
    </div>
  );
}

function TwoCol({
  data,
  main,
  side,
}: {
  data: CVData;
  main: SectionKey[];
  side: SectionKey[];
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <div className="p-10 space-y-6">
      <Header data={data} variant="top" />
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 space-y-5">
          {main.map((k) => (
            <Section key={k} k={k} data={data} />
          ))}
        </div>
        <div className="col-span-1 space-y-5">
          {side.map((k) => (
            <Section key={k} k={k} data={data} compact />
          ))}
        </div>
      </div>
    </div>
  );
}

function Sidebar({
  data,
  main,
  side,
  side_,
}: {
  data: CVData;
  main: SectionKey[];
  side: SectionKey[];
  theme: ReturnType<typeof getTheme>;
  side_: "left" | "right";
}) {
  const sidebar = (
    <aside
      className="p-7 space-y-6"
      style={{ background: "var(--cv-sidebar-bg)", color: "var(--cv-sidebar-fg)" }}
    >
      <Header data={data} variant="sidebar" />
      <ContactBlock data={data} onDark />
      {side.map((k) => (
        <Section key={k} k={k} data={data} onDark compact />
      ))}
    </aside>
  );
  const mainCol = (
    <main className="p-8 space-y-5">
      <div className="pb-4 border-b" style={{ borderColor: "color-mix(in oklab, var(--cv-primary) 30%, transparent)" }}>
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--cv-primary)" }}>
          {data.personal.name}
        </h1>
        <div className="text-base mt-1" style={{ color: "var(--cv-muted)" }}>
          {data.personal.title}
        </div>
      </div>
      {main.map((k) => (
        <Section key={k} k={k} data={data} />
      ))}
    </main>
  );
  return (
    <div className="grid grid-cols-[260px_1fr] h-full">
      {side_ === "left" ? (
        <>
          {sidebar}
          {mainCol}
        </>
      ) : (
        <>
          {mainCol}
          {sidebar}
        </>
      )}
    </div>
  );
}

// ---------- Header ----------

function Header({ data, variant }: { data: CVData; variant: "top" | "sidebar" }) {
  const showPhoto = data.showPhoto && data.personal.photo;
  const shape = data.photoShape === "round" ? "rounded-full" : "rounded-xl";
  if (variant === "sidebar") {
    return (
      <div className="flex flex-col items-center text-center gap-3">
        {showPhoto && (
          <img
            src={data.personal.photo}
            alt=""
            className={`${shape} w-28 h-28 object-cover border-2`}
            style={{ borderColor: "var(--cv-primary)" }}
          />
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-5 pb-5 border-b" style={{ borderColor: "color-mix(in oklab, var(--cv-primary) 30%, transparent)" }}>
      {showPhoto && (
        <img
          src={data.personal.photo}
          alt=""
          className={`${shape} w-24 h-24 object-cover shrink-0`}
        />
      )}
      <div className="min-w-0 flex-1">
        <h1 className="text-4xl font-bold tracking-tight" style={{ color: "var(--cv-primary)" }}>
          {data.personal.name}
        </h1>
        <div className="text-lg mt-1" style={{ color: "var(--cv-muted)" }}>
          {data.personal.title}
        </div>
        <div className="mt-3">
          <ContactBlock data={data} inline />
        </div>
      </div>
    </div>
  );
}

function ContactBlock({ data, inline, onDark }: { data: CVData; inline?: boolean; onDark?: boolean }) {
  const p = data.personal;
  const rawItems: Array<[ReactNode, string | undefined]> = [
    [<Phone key="ph" className="w-3.5 h-3.5" />, p.phone],
    [<Mail key="em" className="w-3.5 h-3.5" />, p.email],
    [<MapPin key="mp" className="w-3.5 h-3.5" />, [p.city, p.country].filter(Boolean).join(", ")],
    [<Linkedin key="ln" className="w-3.5 h-3.5" />, p.linkedin],
    [<Github key="gh" className="w-3.5 h-3.5" />, p.github],
    [<Globe key="gl" className="w-3.5 h-3.5" />, p.website],
    [<Calendar key="bd" className="w-3.5 h-3.5" />, p.birthdate],
    [<IdCard key="dl" className="w-3.5 h-3.5" />, p.driverLicense],
    [<Flag key="nt" className="w-3.5 h-3.5" />, p.nationality],
  ];
  const items = rawItems.filter((x): x is [ReactNode, string] => Boolean(x[1]));

  const cls = inline
    ? "flex flex-wrap gap-x-4 gap-y-1 text-xs"
    : "flex flex-col gap-2 text-xs break-words";
  return (
    <div className={cls} style={{ color: onDark ? "var(--cv-sidebar-fg)" : "var(--cv-muted)" }}>
      {items.map(([icon, val], i) => (
        <div key={i} className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="truncate">{val}</span>
        </div>
      ))}
    </div>
  );
}

// ---------- Sections ----------

function SectionHeading({ title, onDark }: { title: string; onDark?: boolean }) {
  return (
    <h2
      className="text-[11px] font-bold uppercase tracking-[0.14em] pb-1.5 mb-3 border-b"
      style={{
        color: onDark ? "var(--cv-sidebar-fg)" : "var(--cv-primary)",
        borderColor: onDark
          ? "color-mix(in oklab, var(--cv-sidebar-fg) 25%, transparent)"
          : "color-mix(in oklab, var(--cv-primary) 25%, transparent)",
      }}
    >
      {title}
    </h2>
  );
}

function Section({
  k,
  data,
  onDark,
  compact,
}: {
  k: SectionKey;
  data: CVData;
  onDark?: boolean;
  compact?: boolean;
}) {
  const title = sectionTitle(k, data.lang);
  return (
    <section>
      <SectionHeading title={title} onDark={onDark} />
      <SectionBody k={k} data={data} onDark={onDark} compact={compact} />
    </section>
  );
}

function SectionBody({
  k,
  data,
  onDark,
  compact,
}: {
  k: SectionKey;
  data: CVData;
  onDark?: boolean;
  compact?: boolean;
}) {
  const lang = data.lang;
  const muted = onDark ? "color-mix(in oklab, var(--cv-sidebar-fg) 75%, transparent)" : "var(--cv-muted)";

  switch (k) {
    case "profile":
      return <p className="text-sm leading-relaxed whitespace-pre-line">{data.profile}</p>;
    case "objectives":
      return <p className="text-sm leading-relaxed whitespace-pre-line">{data.objectives}</p>;
    case "additional":
      return <p className="text-sm leading-relaxed whitespace-pre-line">{data.additional}</p>;
    case "experience":
      return (
        <div className="space-y-4">
          {data.experiences.map((x) => (
            <div key={x.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <div className="font-semibold text-sm">{x.role}</div>
                <div className="text-xs" style={{ color: muted }}>
                  {fmtRange(x.start, x.end, x.current, lang)}
                </div>
              </div>
              <div className="text-xs" style={{ color: "var(--cv-secondary)" }}>
                {[x.company, x.city].filter(Boolean).join(" · ")}
              </div>
              {x.description && (
                <p className="text-xs mt-1 leading-relaxed whitespace-pre-line" style={{ color: muted }}>
                  {x.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    case "education":
      return (
        <div className="space-y-3">
          {data.educations.map((x) => (
            <div key={x.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <div className="font-semibold text-sm">{x.course}</div>
                <div className="text-xs" style={{ color: muted }}>
                  {[x.start, x.end].filter(Boolean).join(" — ")}
                </div>
              </div>
              <div className="text-xs" style={{ color: "var(--cv-secondary)" }}>
                {[x.institution, x.city].filter(Boolean).join(" · ")}
              </div>
              {x.description && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: muted }}>
                  {x.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    case "courses":
      return (
        <ul className="space-y-1.5 text-xs">
          {data.courses.map((c) => (
            <li key={c.id} className="flex justify-between gap-2">
              <span>
                <span className="font-medium">{c.name}</span>
                {c.institution && <span style={{ color: muted }}> — {c.institution}</span>}
              </span>
              {c.year && <span style={{ color: muted }}>{c.year}</span>}
            </li>
          ))}
        </ul>
      );
    case "certifications":
      return (
        <ul className="space-y-1.5 text-xs">
          {data.certifications.map((c) => (
            <li key={c.id} className="flex justify-between gap-2">
              <span>
                <span className="font-medium">{c.name}</span>
                {c.issuer && <span style={{ color: muted }}> — {c.issuer}</span>}
              </span>
              {c.year && <span style={{ color: muted }}>{c.year}</span>}
            </li>
          ))}
        </ul>
      );
    case "projects":
      return (
        <div className="space-y-3">
          {data.projects.map((p) => (
            <div key={p.id}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <div className="font-semibold text-sm">{p.title}</div>
                {p.link && (
                  <span className="text-xs" style={{ color: "var(--cv-secondary)" }}>
                    {p.link}
                  </span>
                )}
              </div>
              {p.tech && (
                <div className="text-xs" style={{ color: muted }}>
                  {p.tech}
                </div>
              )}
              {p.description && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: muted }}>
                  {p.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    case "skills":
      return (
        <div className={compact ? "space-y-2" : "grid grid-cols-2 gap-x-6 gap-y-2"}>
          {data.skills.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between text-xs mb-1">
                <span>{s.name}</span>
                <span style={{ color: muted }}>{skillLevelLabel(s.level, lang)}</span>
              </div>
              <div
                className="h-1 rounded-full overflow-hidden"
                style={{ background: onDark ? "color-mix(in oklab, var(--cv-sidebar-fg) 20%, transparent)" : "color-mix(in oklab, var(--cv-primary) 15%, transparent)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${skillPercent(s.level)}%`,
                    background: onDark ? "var(--cv-sidebar-fg)" : "var(--cv-primary)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    case "languages":
      return (
        <ul className="space-y-1.5 text-xs">
          {data.languages.map((l) => (
            <li key={l.id} className="flex justify-between gap-2">
              <span className="font-medium">{l.name}</span>
              <span style={{ color: muted }}>{l.level}</span>
            </li>
          ))}
        </ul>
      );
    case "volunteer":
      return (
        <div className="space-y-3">
          {data.volunteers.map((v) => (
            <div key={v.id}>
              <div className="font-semibold text-sm">{v.role}</div>
              <div className="text-xs" style={{ color: "var(--cv-secondary)" }}>
                {v.org}
              </div>
              {v.description && (
                <p className="text-xs mt-1 leading-relaxed" style={{ color: muted }}>
                  {v.description}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    case "references":
      return (
        <div className="grid grid-cols-2 gap-3 text-xs">
          {data.references.map((r) => (
            <div key={r.id}>
              <div className="font-semibold">{r.name}</div>
              <div style={{ color: muted }}>{r.company}</div>
              <div style={{ color: muted }}>{r.phone}</div>
            </div>
          ))}
        </div>
      );
  }
}
