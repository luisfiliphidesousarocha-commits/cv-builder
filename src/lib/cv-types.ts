export type Lang = "pt" | "es" | "en";
export type SkillLevel = "basic" | "intermediate" | "advanced" | "expert";
export type PhotoShape = "round" | "square";
export type LayoutKind = "one-col" | "two-col" | "sidebar-left" | "sidebar-right";
export type SectionKey =
  | "profile"
  | "experience"
  | "education"
  | "courses"
  | "certifications"
  | "projects"
  | "skills"
  | "languages"
  | "volunteer"
  | "objectives"
  | "additional"
  | "references";

export interface Personal {
  photo?: string;
  name: string;
  title: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  linkedin: string;
  github: string;
  website: string;
  birthdate?: string;
  driverLicense?: string;
  nationality?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  city: string;
  start: string;
  end: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  course: string;
  city: string;
  start: string;
  end: string;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  year: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  link: string;
  tech: string;
}

export interface Skill {
  id: string;
  name: string;
  level: SkillLevel;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Volunteer {
  id: string;
  org: string;
  role: string;
  description: string;
}

export interface Reference {
  id: string;
  name: string;
  company: string;
  phone: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  bg: string;
  sidebarBg: string;
  sidebarFg: string;
  fg: string;
  muted: string;
}

export interface CVData {
  lang: Lang;
  personal: Personal;
  profile: string;
  experiences: Experience[];
  educations: Education[];
  courses: Course[];
  certifications: Certification[];
  projects: Project[];
  skills: Skill[];
  languages: Language[];
  volunteers: Volunteer[];
  objectives: string;
  additional: string;
  references: Reference[];
  showReferences: boolean;
  sectionsVisible: Record<SectionKey, boolean>;
  sectionsOrder: SectionKey[];
  theme: string;
  font: string;
  primaryColor: string;
  secondaryColor: string;
  showPhoto: boolean;
  photoShape: PhotoShape;
  layout: LayoutKind;
}
