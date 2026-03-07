export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  linkedin: string;
  objective: string;
  photo: string | null;
  photoPositionX: number;
  photoPositionY: number;
  photoZoom: number;
}

export interface Education {
  id: string;
  institution: string;
  course: string;
  degree: string;
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface Experience {
  id: string;
  company: string;
  city: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Course {
  id: string;
  name: string;
  institution: string;
  hours: string;
  year: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'Básico' | 'Intermediário' | 'Avançado' | 'Especialista';
}

export interface Language {
  id: string;
  name: string;
  level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo';
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  courses: Course[];
  skills: Skill[];
  languages: Language[];
}

export const emptyResume: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    linkedin: '',
    objective: '',
    photo: null,
    photoPositionX: 50,
    photoPositionY: 50,
    photoZoom: 100,
  },
  education: [],
  experience: [],
  courses: [],
  skills: [],
  languages: [],
};
