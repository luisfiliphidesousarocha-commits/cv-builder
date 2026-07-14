import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CVData, SectionKey } from "./cv-types";

const STORAGE_KEY = "cv-builder-data-v1";

const uid = () => Math.random().toString(36).slice(2, 10);

const DEFAULT_ORDER: SectionKey[] = [
  "profile",
  "experience",
  "education",
  "skills",
  "languages",
  "projects",
  "courses",
  "certifications",
  "volunteer",
  "objectives",
  "additional",
  "references",
];

export const emptyCV = (): CVData => ({
  lang: "pt",
  personal: {
    photo: "",
    name: "Ana Silva",
    title: "Product Designer",
    phone: "+55 11 99999-9999",
    email: "ana.silva@email.com",
    city: "São Paulo",
    country: "Brasil",
    linkedin: "linkedin.com/in/anasilva",
    github: "",
    website: "",
    birthdate: "",
    driverLicense: "",
    nationality: "",
  },
  profile:
    "Designer com 6+ anos de experiência criando produtos digitais centrados no usuário. Especialista em pesquisa, design systems e prototipagem.",
  experiences: [
    {
      id: uid(),
      company: "Acme Corp",
      role: "Senior Product Designer",
      city: "São Paulo",
      start: "2022-01",
      end: "",
      current: true,
      description:
        "Liderança do redesign do produto principal, aumentando engajamento em 32%. Criação e manutenção do design system.",
    },
    {
      id: uid(),
      company: "StartupXYZ",
      role: "Product Designer",
      city: "Remoto",
      start: "2019-03",
      end: "2021-12",
      current: false,
      description:
        "Design de novas features de onboarding, checkout e dashboard analytics.",
    },
  ],
  educations: [
    {
      id: uid(),
      institution: "Universidade de São Paulo",
      course: "Design Digital",
      city: "São Paulo",
      start: "2014",
      end: "2018",
      description: "",
    },
  ],
  courses: [],
  certifications: [],
  projects: [],
  skills: [
    { id: uid(), name: "Figma", level: "expert" },
    { id: uid(), name: "Design System", level: "advanced" },
    { id: uid(), name: "User Research", level: "advanced" },
    { id: uid(), name: "Prototipagem", level: "expert" },
  ],
  languages: [
    { id: uid(), name: "Português", level: "Nativo" },
    { id: uid(), name: "Inglês", level: "Fluente" },
    { id: uid(), name: "Espanhol", level: "Intermediário" },
  ],
  volunteers: [],
  objectives: "",
  additional: "",
  references: [],
  showReferences: false,
  sectionsVisible: {
    profile: true,
    experience: true,
    education: true,
    courses: true,
    certifications: true,
    projects: true,
    skills: true,
    languages: true,
    volunteer: true,
    objectives: true,
    additional: true,
    references: true,
  },
  sectionsOrder: DEFAULT_ORDER,
  theme: "modern",
  font: "Inter",
  primaryColor: "",
  secondaryColor: "",
  showPhoto: true,
  photoShape: "round",
  layout: "sidebar-left",
});

interface Ctx {
  data: CVData;
  set: <K extends keyof CVData>(key: K, value: CVData[K]) => void;
  update: (patch: Partial<CVData>) => void;
  replace: (d: CVData) => void;
  makeId: () => string;
}

const CVContext = createContext<Ctx | null>(null);

export function CVProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CVData>(() => {
    if (typeof window === "undefined") return emptyCV();
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...emptyCV(), ...JSON.parse(raw) };
    } catch {
      // ignore
    }
    return emptyCV();
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // ignore
    }
  }, [data]);

  const set: Ctx["set"] = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const update: Ctx["update"] = (patch) => setData((d) => ({ ...d, ...patch }));
  const replace = (d: CVData) => setData({ ...emptyCV(), ...d });

  return (
    <CVContext.Provider value={{ data, set, update, replace, makeId: uid }}>
      {children}
    </CVContext.Provider>
  );
}

export const useCV = () => {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCV must be used inside CVProvider");
  return ctx;
};
