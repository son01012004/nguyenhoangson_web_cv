export interface GenericSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  htmlContent?: string;
  url?: string;
  type?: string;
}

export interface GenericSection {
  id: string;
  title: string;
  items: GenericSectionItem[];
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  type: 'image' | 'pdf';
  url: string;
}

export interface Project {
  id: string;
  name: string;
  role?: string;
  date?: string;
  tech: string[];
  bulletPoints: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  date: string;
  description?: string[];
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  date: string;
  details: string[];
}

export interface CVData {
  id: string;
  cvName: string;
  lastUpdated: string;
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone?: string;
    location?: string;
    links?: { label: string; url: string }[];
    photo?: string;
  };
  sections?: GenericSection[];
  summary?: string;
  skills?: {
    languages: string[];
    tools: string[];
    other?: string[];
  };
  experience?: Experience[];
  projects?: Project[];
  education?: Education[];
  certifications?: Certification[];
}
