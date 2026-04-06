import { ResumeData } from "@/types/resume";
import { Mail, Phone, Linkedin, MapPin } from "lucide-react";
import type { TemplateStyle } from "./ResumeForm";

const formatDate = (date: string) => {
  if (!date) return "";
  const [year, month] = date.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year}`;
};

interface Props {
  data: ResumeData;
  template?: TemplateStyle;
}

const ResumePreview = ({ data, template = "modern" }: Props) => {
  if (template === "minimal") return <MinimalTemplate data={data} />;
  if (template === "classic") return <ClassicTemplate data={data} />;
  if (template === "creative") return <CreativeTemplate data={data} />;
  if (template === "executive") return <ExecutiveTemplate data={data} />;
  if (template === "tech") return <TechTemplate data={data} />;
  if (template === "academic") return <AcademicTemplate data={data} />;
  if (template === "elegant") return <ElegantTemplate data={data} />;
  return <ModernTemplate data={data} />;
};

/* ========== SVG icons ========== */
const IconPhone = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012.18 1h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 8.1a16 16 0 006 6l1.46-1.46a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92z" />
  </svg>
);
const IconMail = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconMap = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
const IconLink = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const BADGE_H = 22; // altura do badge em px

const CreativeBadge = ({ icon, text, bg }: { icon: React.ReactNode; text: string; bg: string }) => (
  <span style={{
    backgroundColor: bg, color: "white", borderRadius: "999px", fontSize: "10px", fontWeight: 500,
    display: "inline-flex", alignItems: "center", paddingLeft: "10px", paddingRight: "10px",
    paddingTop: "4px", paddingBottom: "4px", whiteSpace: "nowrap", gap: "5px",
  }}>
    {icon}{text}
  </span>
);

const ExecutiveBadge = ({ text, bg, color, borderRadius = "4px", px = "8px" }: {
  text: string; bg: string; color: string; borderRadius?: string; px?: string;
}) => (
  <span style={{
    backgroundColor: bg, color, borderRadius, fontSize: "10px", fontWeight: 500,
    display: "inline-block", height: "20px", lineHeight: "20px",
    paddingLeft: px, paddingRight: px, whiteSpace: "nowrap", verticalAlign: "middle",
  }}>
    {text}
  </span>
);

/* ========== MODERN ========== */
const ModernTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const sidebar = "#1a365d";
  const accent = "#63b3ed";
  const sidebarDark = "#2d4a7a";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", minHeight: "1123px" }}>
      <div className="flex" style={{ backgroundColor: sidebar, color: "white" }}>
        <div className="w-[32%] flex items-center justify-center py-6 px-4">
          {personalInfo.photo ? (
            <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
          ) : (
            <div className="w-24 h-32 rounded-md border-2 flex items-center justify-center text-2xl font-bold" style={{ borderColor: accent, backgroundColor: sidebarDark }}>
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="w-[68%] flex items-center py-6 px-5">
          <div>
            <h1 className="text-2xl font-bold uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em", wordBreak: "break-word" }}>
              {personalInfo.fullName || "SEU NOME COMPLETO"}
            </h1>
            {personalInfo.objective && <p className="mt-2 text-xs leading-relaxed opacity-85" style={{ wordBreak: "break-word" }}>{personalInfo.objective}</p>}
          </div>
        </div>
      </div>
      <div className="flex" style={{ minHeight: "953px" }}>
        <div className="w-[32%] py-5 px-4" style={{ backgroundColor: sidebar, color: "white", fontSize: "11px", minHeight: "953px" }}>
          <ModernSidebarSection title="CONTATO" accent={accent}>
            <div className="space-y-2.5">
              {personalInfo.phone && <div className="flex items-start gap-2"><Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} /><span style={{ wordBreak: "break-word" }}>{personalInfo.phone}</span></div>}
              {personalInfo.email && <div className="flex items-start gap-2"><Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} /><span style={{ wordBreak: "break-word" }}>{personalInfo.email}</span></div>}
              {(personalInfo.city || personalInfo.state) && <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} /><span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span></div>}
              {personalInfo.linkedin && <div className="flex items-start gap-2"><Linkedin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} /><span style={{ wordBreak: "break-word" }}>{personalInfo.linkedin}</span></div>}
            </div>
          </ModernSidebarSection>
          {skills.length > 0 && <ModernSidebarSection title="HABILIDADES" accent={accent}><ul className="space-y-1.5">{skills.map(s => <li key={s.id} className="flex items-center gap-2"><span style={{ color: accent }}>•</span><span style={{ wordBreak: "break-word" }}>{s.name}</span></li>)}</ul></ModernSidebarSection>}
          {languages.length > 0 && <ModernSidebarSection title="IDIOMAS" accent={accent}><div className="space-y-3">{languages.map(l => <div key={l.id}><div className="flex justify-between mb-1"><span className="font-semibold">{l.name}</span><span className="text-[10px] opacity-75">{l.level}</span></div><LanguageBar level={l.level} accent={accent} bg={sidebarDark} /></div>)}</div></ModernSidebarSection>}
          {courses.length > 0 && <ModernSidebarSection title="CURSOS" accent={accent}><div className="space-y-2.5">{courses.map(c => <div key={c.id}><div className="font-semibold text-[11px]" style={{ wordBreak: "break-word" }}>{c.name}</div><div className="text-[10px] opacity-75">{c.institution}{c.year ? ` (${c.year})` : ""}</div></div>)}</div></ModernSidebarSection>}
        </div>
        <div className="w-[68%] py-5 px-6 space-y-5">
          {experience.length > 0 && <MainSection title="EXPERIÊNCIA PROFISSIONAL" color={sidebar}><div className="space-y-4">{experience.map(exp => <div key={exp.id}><div className="font-bold text-[12px]" style={{ color: "#1a202c", wordBreak: "break-word" }}>{exp.position}</div><div className="text-[11px] font-medium" style={{ color: "#4a5568" }}>{exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}</div>{exp.description && <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#4a5568" }}>{exp.description.split("\n").filter(Boolean).map((line, i) => <li key={i} className="flex items-center gap-2"><span className="flex-shrink-0" style={{ color: accent }}>•</span><span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span></li>)}</ul>}</div>)}</div></MainSection>}
          {education.length > 0 && <MainSection title="FORMAÇÃO ACADÊMICA" color={sidebar}><div className="space-y-3">{education.map(edu => <div key={edu.id}><div className="font-bold text-[12px]" style={{ color: "#1a202c", wordBreak: "break-word" }}>{edu.degree}: {edu.course}</div><div className="text-[11px]" style={{ color: "#4a5568" }}>{edu.institution} | {formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}</div></div>)}</div></MainSection>}
        </div>
      </div>
    </div>
  );
};

/* ========== CLASSIC ========== */
const ClassicTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "#2c3e50"; const accent = "#c0392b";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "12px", lineHeight: "1.65", minHeight: "1123px" }}>
      <div className="pt-10 pb-5 px-10" style={{ borderBottom: `3px double ${primary}` }}>
        <div className="flex items-start gap-6">
          {personalInfo.photo && <img src={personalInfo.photo} alt="Foto" className="flex-shrink-0" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />}
          <div className="flex-1">
            <h1 className="text-3xl font-bold uppercase" style={{ color: primary, letterSpacing: "0.12em", wordBreak: "break-word" }}>{personalInfo.fullName || "SEU NOME COMPLETO"}</h1>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px]" style={{ color: "#555" }}>
              {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
              {personalInfo.email && <span>✉ {personalInfo.email}</span>}
              {(personalInfo.city || personalInfo.state) && <span>📍 {[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
              {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 py-6 space-y-5">
        {personalInfo.objective && <ClassicSection title="Objetivo Profissional" color={primary} accent={accent}><p className="text-[12px] leading-relaxed" style={{ color: "#333", wordBreak: "break-word" }}>{personalInfo.objective}</p></ClassicSection>}
        {experience.length > 0 && <ClassicSection title="Experiência Profissional" color={primary} accent={accent}><div className="space-y-4">{experience.map(exp => <div key={exp.id}><div className="flex flex-wrap justify-between items-baseline gap-2"><span className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{exp.position}</span><span className="text-[10px] italic" style={{ color: "#888" }}>{formatDate(exp.startDate)} — {exp.current ? "Atual" : formatDate(exp.endDate)}</span></div><div className="text-[11px] italic" style={{ color: "#666" }}>{exp.company}{exp.city ? `, ${exp.city}` : ""}</div>{exp.description && <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>{exp.description.split("\n").filter(Boolean).map((line, i) => <li key={i} className="flex items-center gap-2"><span className="flex-shrink-0" style={{ color: accent }}>■</span><span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span></li>)}</ul>}</div>)}</div></ClassicSection>}
        {education.length > 0 && <ClassicSection title="Formação Acadêmica" color={primary} accent={accent}><div className="space-y-3">{education.map(edu => <div key={edu.id}><div className="flex flex-wrap justify-between items-baseline gap-2"><span className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{edu.degree} — {edu.course}</span><span className="text-[10px] italic" style={{ color: "#888" }}>{formatDate(edu.startDate)} — {edu.current ? "Cursando" : formatDate(edu.endDate)}</span></div><div className="text-[11px] italic" style={{ color: "#666" }}>{edu.institution}</div></div>)}</div></ClassicSection>}
        {courses.length > 0 && <ClassicSection title="Cursos e Certificações" color={primary} accent={accent}><div className="space-y-2">{courses.map(c => <div key={c.id} className="flex flex-wrap justify-between items-baseline gap-2"><span className="text-[11px]" style={{ wordBreak: "break-word" }}><span className="font-bold" style={{ color: primary }}>{c.name}</span> — {c.institution}</span><span className="text-[10px] italic" style={{ color: "#888" }}>{[c.hours, c.year].filter(Boolean).join(" | ")}</span></div>)}</div></ClassicSection>}
        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && <ClassicSection title="Habilidades" color={primary} accent={accent}><ul className="space-y-1">{skills.map(s => <li key={s.id} className="text-[11px] flex items-center gap-2" style={{ color: "#444" }}><span style={{ color: accent }}>■</span><span style={{ wordBreak: "break-word" }}>{s.name}</span></li>)}</ul></ClassicSection>}
          {languages.length > 0 && <ClassicSection title="Idiomas" color={primary} accent={accent}><div className="space-y-1.5">{languages.map(l => <div key={l.id} className="text-[11px] flex justify-between" style={{ color: "#444" }}><span className="font-semibold">{l.name}</span><span className="italic" style={{ color: "#888" }}>{l.level}</span></div>)}</div></ClassicSection>}
        </div>
      </div>
    </div>
  );
};

/* ========== MINIMAL ========== */
const MinimalTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", minHeight: "1123px" }}>
      <div className="px-10 pt-10 pb-5" style={{ borderBottom: "2px solid #222" }}>
        <div className="flex items-center gap-6">
          {personalInfo.photo && <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />}
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#222", wordBreak: "break-word" }}>{personalInfo.fullName || "SEU NOME COMPLETO"}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px]" style={{ color: "#777" }}>
              {personalInfo.email && <span>{personalInfo.email}</span>}
              {personalInfo.phone && <span>{personalInfo.phone}</span>}
              {(personalInfo.city || personalInfo.state) && <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
              {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>
      </div>
      <div className="px-10 py-6 space-y-5">
        {personalInfo.objective && <MinimalSection title="OBJETIVO"><p className="text-[12px] leading-relaxed" style={{ color: "#444", wordBreak: "break-word" }}>{personalInfo.objective}</p></MinimalSection>}
        {experience.length > 0 && <MinimalSection title="EXPERIÊNCIA PROFISSIONAL"><div className="space-y-4">{experience.map(exp => <div key={exp.id}><div className="font-bold text-[12px]" style={{ color: "#222", wordBreak: "break-word" }}>{exp.position}</div><div className="text-[11px]" style={{ color: "#777" }}>{exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}</div>{exp.description && <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>{exp.description.split("\n").filter(Boolean).map((line, i) => <li key={i} className="flex items-center gap-2"><span className="flex-shrink-0" style={{ color: "#999" }}>•</span><span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span></li>)}</ul>}</div>)}</div></MinimalSection>}
        {education.length > 0 && <MinimalSection title="FORMAÇÃO"><div className="space-y-2.5">{education.map(edu => <div key={edu.id} className="text-[12px]"><span className="font-bold" style={{ color: "#222", wordBreak: "break-word" }}>{edu.degree}: {edu.course}</span><span style={{ color: "#777" }}> — {edu.institution}</span><span className="ml-2 text-[10px]" style={{ color: "#999" }}>{formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}</span></div>)}</div></MinimalSection>}
        {courses.length > 0 && <MinimalSection title="CURSOS"><div className="space-y-1.5">{courses.map(c => <div key={c.id} className="text-[11px]"><span className="font-bold" style={{ color: "#222", wordBreak: "break-word" }}>{c.name}</span><span style={{ color: "#666" }}> — {c.institution}</span>{(c.hours || c.year) && <span style={{ color: "#999" }}> ({[c.hours, c.year].filter(Boolean).join(", ")})</span>}</div>)}</div></MinimalSection>}
        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && <MinimalSection title="HABILIDADES"><div className="flex flex-wrap gap-2">{skills.map(s => <span key={s.id} className="text-[10px] px-2.5 py-1 rounded" style={{ border: "1px solid #ddd", color: "#444", wordBreak: "break-word" }}>{s.name}</span>)}</div></MinimalSection>}
          {languages.length > 0 && <MinimalSection title="IDIOMAS"><div className="space-y-1">{languages.map(l => <div key={l.id} className="text-[11px]" style={{ color: "#444" }}><span className="font-semibold">{l.name}</span> — <span style={{ color: "#888" }}>{l.level}</span></div>)}</div></MinimalSection>}
        </div>
      </div>
    </div>
  );
};

/* ========== CREATIVE ========== */
const CreativeTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "#6c3483"; const accent = "#f39c12"; const bg = "#fdf6ec";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", minHeight: "1123px" }}>
      <div style={{ height: "6px", background: `linear-gradient(90deg, ${primary}, ${accent})` }} />
      <div className="px-10 pt-8 pb-6 flex items-center gap-6" style={{ backgroundColor: bg }}>
        {personalInfo.photo ? <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} /> : <div className="w-24 h-32 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md" style={{ border: `3px solid ${accent}`, backgroundColor: primary, color: "white" }}>{personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}</div>}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: primary, wordBreak: "break-word" }}>{personalInfo.fullName || "SEU NOME COMPLETO"}</h1>
          {personalInfo.objective && <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "#555", wordBreak: "break-word", maxWidth: "480px" }}>{personalInfo.objective}</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px]" style={{ color: primary, fontWeight: 500 }}>
            {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
            {personalInfo.email && <span>✉ {personalInfo.email}</span>}
            {(personalInfo.city || personalInfo.state) && <span>📍 {[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
            {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>
      <div className="flex px-10 py-6 gap-8">
        <div className="w-[65%] space-y-5">
          {experience.length > 0 && <CreativeSection title="Experiência" color={primary} accent={accent}><div className="space-y-4">{experience.map(exp => <div key={exp.id} className="pl-4" style={{ borderLeft: `3px solid ${accent}` }}><div className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{exp.position}</div><div className="text-[11px]" style={{ color: "#777" }}>{exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}</div>{exp.description && <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>{exp.description.split("\n").filter(Boolean).map((line, i) => <li key={i} className="flex items-center gap-2"><span className="flex-shrink-0" style={{ color: accent }}>▸</span><span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span></li>)}</ul>}</div>)}</div></CreativeSection>}
          {education.length > 0 && <CreativeSection title="Formação" color={primary} accent={accent}><div className="space-y-3">{education.map(edu => <div key={edu.id} className="pl-4" style={{ borderLeft: `3px solid ${accent}` }}><div className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{edu.degree}: {edu.course}</div><div className="text-[11px]" style={{ color: "#777" }}>{edu.institution} | {formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}</div></div>)}</div></CreativeSection>}
        </div>
        <div className="w-[35%] space-y-5">
          {skills.length > 0 && <CreativeSection title="Habilidades" color={primary} accent={accent}><ul className="space-y-1.5">{skills.map(s => <li key={s.id} className="flex items-center gap-2" style={{ fontSize: "11px", color: "#444" }}><span style={{ color: accent }}>•</span><span style={{ wordBreak: "break-word" }}>{s.name}</span></li>)}</ul></CreativeSection>}
          {languages.length > 0 && <CreativeSection title="Idiomas" color={primary} accent={accent}><div className="space-y-2">{languages.map(l => <div key={l.id}><div className="flex justify-between text-[11px] mb-1"><span className="font-semibold" style={{ color: primary }}>{l.name}</span><span style={{ color: "#888" }}>{l.level}</span></div><LanguageBar level={l.level} accent={accent} bg="#eee" /></div>)}</div></CreativeSection>}
          {courses.length > 0 && <CreativeSection title="Cursos" color={primary} accent={accent}><div className="space-y-2">{courses.map(c => <div key={c.id}><div className="font-semibold text-[11px]" style={{ color: primary, wordBreak: "break-word" }}>{c.name}</div><div className="text-[10px]" style={{ color: "#888" }}>{c.institution}{c.year ? ` (${c.year})` : ""}</div></div>)}</div></CreativeSection>}
        </div>
      </div>
    </div>
  );
};

/* ========== EXECUTIVE ========== */
const ExecutiveTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const dark = "#1a1a2e"; const gold = "#c9a84c";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", minHeight: "1123px" }}>
      <div className="px-10 pt-10 pb-6 flex items-center gap-6" style={{ backgroundColor: dark, color: "white" }}>
        {personalInfo.photo ? <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} /> : <div className="w-24 h-32 rounded flex items-center justify-center text-3xl font-bold" style={{ border: `2px solid ${gold}`, backgroundColor: "#16213e", color: gold }}>{personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}</div>}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif", color: gold, letterSpacing: "0.1em", wordBreak: "break-word" }}>{personalInfo.fullName || "SEU NOME COMPLETO"}</h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] opacity-80">
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {(personalInfo.city || personalInfo.state) && <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ height: "3px", backgroundColor: gold }} />
      <div className="px-10 py-6 space-y-5">
        {personalInfo.objective && <ExecutiveSection title="Perfil Profissional" color={dark} accent={gold}><p className="text-[12px] leading-relaxed italic" style={{ color: "#444", wordBreak: "break-word" }}>{personalInfo.objective}</p></ExecutiveSection>}
        {experience.length > 0 && <ExecutiveSection title="Experiência Profissional" color={dark} accent={gold}><div className="space-y-4">{experience.map(exp => <div key={exp.id}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}><span className="font-bold text-[12px]" style={{ color: dark, wordBreak: "break-word" }}>{exp.position}</span><span className="text-[10px]" style={{ color: "#888" }}>{formatDate(exp.startDate)} — {exp.current ? "Atual" : formatDate(exp.endDate)}</span></div><div className="text-[11px] font-medium" style={{ color: "#666" }}>{exp.company}{exp.city ? ` • ${exp.city}` : ""}</div>{exp.description && <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>{exp.description.split("\n").filter(Boolean).map((line, i) => <li key={i} className="flex items-center gap-2"><span className="flex-shrink-0 text-[8px]" style={{ color: gold }}>◆</span><span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span></li>)}</ul>}</div>)}</div></ExecutiveSection>}
        {education.length > 0 && <ExecutiveSection title="Formação Acadêmica" color={dark} accent={gold}><div className="space-y-3">{education.map(edu => <div key={edu.id}><div className="flex flex-wrap justify-between items-baseline gap-2"><span className="font-bold text-[12px]" style={{ color: dark, wordBreak: "break-word" }}>{edu.degree} — {edu.course}</span><span className="text-[10px]" style={{ color: "#888" }}>{formatDate(edu.startDate)} — {edu.current ? "Cursando" : formatDate(edu.endDate)}</span></div><div className="text-[11px]" style={{ color: "#666" }}>{edu.institution}</div></div>)}</div></ExecutiveSection>}
        {courses.length > 0 && <ExecutiveSection title="Cursos e Certificações" color={dark} accent={gold}><div className="space-y-2">{courses.map(c => <div key={c.id} className="flex flex-wrap justify-between items-baseline gap-2"><span className="text-[11px]" style={{ wordBreak: "break-word" }}><span className="font-bold" style={{ color: dark }}>{c.name}</span> — {c.institution}</span><span className="text-[10px]" style={{ color: "#888" }}>{[c.hours, c.year].filter(Boolean).join(" | ")}</span></div>)}</div></ExecutiveSection>}
        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && <ExecutiveSection title="Competências" color={dark} accent={gold}><ul className="space-y-1.5">{skills.map(s => <li key={s.id} className="flex items-center gap-2" style={{ fontSize: "11px", color: "#444" }}><span style={{ color: gold }}>◆</span><span style={{ wordBreak: "break-word" }}>{s.name}</span></li>)}</ul></ExecutiveSection>}
          {languages.length > 0 && <ExecutiveSection title="Idiomas" color={dark} accent={gold}><div className="space-y-2">{languages.map(l => <div key={l.id}><div className="flex justify-between text-[11px] mb-1"><span className="font-semibold" style={{ color: dark }}>{l.name}</span><span style={{ color: "#888" }}>{l.level}</span></div><LanguageBar level={l.level} accent={gold} bg="#eee" /></div>)}</div></ExecutiveSection>}
        </div>
      </div>
    </div>
  );
};

/* ========== TECH ========== */
const TechTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const bg = "#0d1117"; const neon = "#00ff88"; const dim = "#8b949e"; const card = "#161b22"; const border = "#30363d";
  return (
    <div id="resume-preview" className="w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Courier New', 'Consolas', monospace", fontSize: "11px", lineHeight: "1.6", minHeight: "1123px", backgroundColor: bg, color: "#e6edf3" }}>
      {/* Header */}
      <div style={{ backgroundColor: card, borderBottom: `1px solid ${border}`, padding: "32px 40px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {personalInfo.photo ? (
            <img src={personalInfo.photo} alt="Foto" style={{ width: "88px", height: "88px", borderRadius: "50%", border: `2px solid ${neon}`, objectFit: "cover" }} />
          ) : (
            <div style={{ width: "88px", height: "88px", borderRadius: "50%", border: `2px solid ${neon}`, backgroundColor: "#0d1117", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", fontWeight: "bold", color: neon }}>
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ color: dim, fontSize: "10px", marginBottom: "4px" }}>// developer profile</div>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#ffffff", letterSpacing: "0.05em", wordBreak: "break-word", marginBottom: "8px" }}>
              {personalInfo.fullName || "SEU NOME"}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "10px", color: dim }}>
              {personalInfo.email && <span style={{ color: neon }}>✉ <span style={{ color: dim }}>{personalInfo.email}</span></span>}
              {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
              {(personalInfo.city || personalInfo.state) && <span>📍 {[personalInfo.city, personalInfo.state].filter(Boolean).join(", ")}</span>}
              {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>
        {personalInfo.objective && (
          <div style={{ marginTop: "16px", padding: "12px 16px", backgroundColor: "#0d1117", borderLeft: `3px solid ${neon}`, borderRadius: "0 4px 4px 0" }}>
            <span style={{ color: neon, fontSize: "10px" }}>{"/* "}</span>
            <span style={{ color: dim, fontSize: "11px", fontStyle: "italic" }}>{personalInfo.objective}</span>
            <span style={{ color: neon, fontSize: "10px" }}>{" */"}</span>
          </div>
        )}
      </div>

      <div style={{ display: "flex", padding: "24px 40px", gap: "24px" }}>
        {/* Main */}
        <div style={{ flex: "1 1 60%", minWidth: 0 }}>
          {experience.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: neon, fontSize: "11px", fontWeight: "bold", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: dim }}>{">"}</span> EXPERIÊNCIA
                <div style={{ flex: 1, height: "1px", backgroundColor: border, marginLeft: "8px" }} />
              </div>
              {experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: "16px", padding: "12px 14px", backgroundColor: card, borderRadius: "6px", border: `1px solid ${border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: "bold", color: "#ffffff", fontSize: "12px" }}>{exp.position}</span>
                    <span style={{ color: neon, fontSize: "10px" }}>{formatDate(exp.startDate)} → {exp.current ? "now" : formatDate(exp.endDate)}</span>
                  </div>
                  <div style={{ color: dim, fontSize: "10px", marginBottom: "8px" }}>{exp.company}{exp.city ? ` · ${exp.city}` : ""}</div>
                  {exp.description && exp.description.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "10px", color: "#c9d1d9", marginBottom: "3px" }}>
                      <span style={{ color: neon }}>-</span>
                      <span>{line.replace(/^[-•]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ color: neon, fontSize: "11px", fontWeight: "bold", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: dim }}>{">"}</span> FORMAÇÃO
                <div style={{ flex: 1, height: "1px", backgroundColor: border, marginLeft: "8px" }} />
              </div>
              {education.map(edu => (
                <div key={edu.id} style={{ marginBottom: "10px", padding: "10px 14px", backgroundColor: card, borderRadius: "6px", border: `1px solid ${border}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: "#ffffff", fontSize: "11px" }}>{edu.degree}: {edu.course}</span>
                    <span style={{ color: neon, fontSize: "10px" }}>{formatDate(edu.startDate)} → {edu.current ? "now" : formatDate(edu.endDate)}</span>
                  </div>
                  <div style={{ color: dim, fontSize: "10px" }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: "0 0 35%", minWidth: 0 }}>
          {skills.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: neon, fontSize: "11px", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: dim }}>{">"}</span> STACK
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {skills.map(s => (
                  <span key={s.id} style={{ fontSize: "9px", padding: "3px 8px", backgroundColor: "#0d1117", border: `1px solid ${neon}`, borderRadius: "4px", color: neon, fontWeight: "bold" }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ color: neon, fontSize: "11px", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: dim }}>{">"}</span> IDIOMAS
              </div>
              {languages.map(l => (
                <div key={l.id} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", marginBottom: "3px" }}>
                    <span style={{ color: "#ffffff" }}>{l.name}</span>
                    <span style={{ color: dim }}>{l.level}</span>
                  </div>
                  <LanguageBar level={l.level} accent={neon} bg={border} />
                </div>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <div style={{ color: neon, fontSize: "11px", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: dim }}>{">"}</span> CURSOS
              </div>
              {courses.map(c => (
                <div key={c.id} style={{ marginBottom: "8px", padding: "8px 10px", backgroundColor: card, borderRadius: "4px", border: `1px solid ${border}` }}>
                  <div style={{ color: "#ffffff", fontSize: "10px", fontWeight: "bold" }}>{c.name}</div>
                  <div style={{ color: dim, fontSize: "9px" }}>{c.institution}{c.year ? ` (${c.year})` : ""}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== ACADEMIC ========== */
const AcademicTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "#1a237e"; const accent = "#c62828"; const light = "#e8eaf6";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Georgia', serif", fontSize: "12px", lineHeight: "1.7", minHeight: "1123px" }}>
      {/* Topo azul escuro */}
      <div style={{ backgroundColor: primary, padding: "32px 48px 24px", color: "white" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>
          {personalInfo.photo && <img src={personalInfo.photo} alt="Foto" style={{ width: "88px", height: "112px", objectFit: "cover", borderRadius: "4px", border: "2px solid white" }} />}
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: "26px", fontWeight: "bold", letterSpacing: "0.04em", marginBottom: "4px", wordBreak: "break-word" }}>{personalInfo.fullName || "SEU NOME"}</h1>
            <div style={{ width: "48px", height: "2px", backgroundColor: "#ef9a9a", marginBottom: "10px" }} />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "10px", opacity: 0.85 }}>
              {personalInfo.email && <span>✉ {personalInfo.email}</span>}
              {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
              {(personalInfo.city || personalInfo.state) && <span>⌖ {[personalInfo.city, personalInfo.state].filter(Boolean).join(", ")}</span>}
              {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
            </div>
          </div>
        </div>
        {personalInfo.objective && (
          <div style={{ marginTop: "16px", padding: "10px 16px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px", fontSize: "11px", fontStyle: "italic", lineHeight: "1.6" }}>
            {personalInfo.objective}
          </div>
        )}
      </div>

      {/* Faixa decorativa */}
      <div style={{ height: "4px", background: `linear-gradient(90deg, ${accent}, ${primary})` }} />

      <div style={{ padding: "28px 48px", display: "flex", gap: "32px" }}>
        {/* Main */}
        <div style={{ flex: "1 1 60%", minWidth: 0 }}>
          {experience.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "bold", color: primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "14px" }}>Experiência Profissional</h2>
              {experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: primary, fontSize: "12px" }}>{exp.position}</span>
                    <span style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>{formatDate(exp.startDate)} – {exp.current ? "presente" : formatDate(exp.endDate)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#444", fontStyle: "italic", marginBottom: "4px" }}>{exp.company}{exp.city ? `, ${exp.city}` : ""}</div>
                  {exp.description && exp.description.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#333", marginBottom: "2px" }}>
                      <span style={{ color: accent, fontWeight: "bold" }}>•</span>
                      <span>{line.replace(/^[-•]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "13px", fontWeight: "bold", color: primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "14px" }}>Formação Acadêmica</h2>
              {education.map(edu => (
                <div key={edu.id} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: primary, fontSize: "12px" }}>{edu.degree} em {edu.course}</span>
                    <span style={{ fontSize: "10px", color: "#666", fontStyle: "italic" }}>{formatDate(edu.startDate)} – {edu.current ? "presente" : formatDate(edu.endDate)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: "#444", fontStyle: "italic" }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <h2 style={{ fontSize: "13px", fontWeight: "bold", color: primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `2px solid ${accent}`, paddingBottom: "4px", marginBottom: "14px" }}>Cursos e Certificações</h2>
              {courses.map(c => (
                <div key={c.id} style={{ marginBottom: "6px", fontSize: "11px", display: "flex", justifyContent: "space-between" }}>
                  <span><strong style={{ color: primary }}>{c.name}</strong> — {c.institution}</span>
                  {c.year && <span style={{ color: "#888", fontStyle: "italic" }}>{c.year}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: "0 0 32%", minWidth: 0 }}>
          {skills.length > 0 && (
            <div style={{ marginBottom: "20px", padding: "14px 16px", backgroundColor: light, borderRadius: "6px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: "bold", color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Competências</h2>
              {skills.map(s => (
                <div key={s.id} style={{ fontSize: "11px", color: "#333", marginBottom: "4px", display: "flex", gap: "6px", alignItems: "center" }}>
                  <span style={{ color: accent, fontSize: "8px" }}>◆</span> {s.name}
                </div>
              ))}
            </div>
          )}

          {languages.length > 0 && (
            <div style={{ marginBottom: "20px", padding: "14px 16px", backgroundColor: light, borderRadius: "6px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: "bold", color: primary, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Idiomas</h2>
              {languages.map(l => (
                <div key={l.id} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                    <span style={{ fontWeight: "bold", color: primary }}>{l.name}</span>
                    <span style={{ color: "#666", fontStyle: "italic" }}>{l.level}</span>
                  </div>
                  <LanguageBar level={l.level} accent={accent} bg="#c5cae9" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== ELEGANT ========== */
const ElegantTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const rose = "#b76e79"; const light = "#fdf0f2"; const dark = "#2d2d2d"; const mid = "#7a7a7a";
  return (
    <div id="resume-preview" className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Georgia', serif", fontSize: "12px", lineHeight: "1.7", minHeight: "1123px" }}>
      {/* Faixa rosê no topo */}
      <div style={{ height: "8px", backgroundColor: rose }} />

      {/* Header */}
      <div style={{ padding: "36px 48px 24px", textAlign: "center", backgroundColor: light }}>
        {personalInfo.photo && (
          <img src={personalInfo.photo} alt="Foto" style={{ width: "88px", height: "88px", borderRadius: "50%", objectFit: "cover", border: `3px solid ${rose}`, display: "block", margin: "0 auto 16px" }} />
        )}
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: dark, letterSpacing: "0.12em", textTransform: "uppercase", wordBreak: "break-word", marginBottom: "8px" }}>
          {personalInfo.fullName || "SEU NOME"}
        </h1>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", marginBottom: "12px" }}>
          <div style={{ width: "32px", height: "1px", backgroundColor: rose }} />
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: rose }} />
          <div style={{ width: "32px", height: "1px", backgroundColor: rose }} />
        </div>
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px", fontSize: "10px", color: mid }}>
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {personalInfo.phone && <span>☎ {personalInfo.phone}</span>}
          {(personalInfo.city || personalInfo.state) && <span>⌖ {[personalInfo.city, personalInfo.state].filter(Boolean).join(", ")}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
        </div>
        {personalInfo.objective && (
          <p style={{ marginTop: "14px", fontSize: "11px", color: mid, fontStyle: "italic", maxWidth: "480px", margin: "14px auto 0", lineHeight: "1.7" }}>{personalInfo.objective}</p>
        )}
      </div>

      <div style={{ padding: "28px 48px", display: "flex", gap: "32px" }}>
        {/* Main */}
        <div style={{ flex: "1 1 60%", minWidth: 0 }}>
          {experience.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: "bold", color: rose, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>Experiência</h2>
              <div style={{ height: "1px", backgroundColor: rose, opacity: 0.3, marginBottom: "14px" }} />
              {experience.map(exp => (
                <div key={exp.id} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: dark, fontSize: "12px" }}>{exp.position}</span>
                    <span style={{ fontSize: "10px", color: mid, fontStyle: "italic" }}>{formatDate(exp.startDate)} – {exp.current ? "atual" : formatDate(exp.endDate)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: rose, marginBottom: "4px" }}>{exp.company}{exp.city ? ` · ${exp.city}` : ""}</div>
                  {exp.description && exp.description.split("\n").filter(Boolean).map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: "8px", fontSize: "11px", color: "#444", marginBottom: "2px" }}>
                      <span style={{ color: rose }}>◦</span>
                      <span>{line.replace(/^[-•]\s*/, "")}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {education.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <h2 style={{ fontSize: "12px", fontWeight: "bold", color: rose, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>Formação</h2>
              <div style={{ height: "1px", backgroundColor: rose, opacity: 0.3, marginBottom: "14px" }} />
              {education.map(edu => (
                <div key={edu.id} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "4px" }}>
                    <span style={{ fontWeight: "bold", color: dark, fontSize: "12px" }}>{edu.degree}: {edu.course}</span>
                    <span style={{ fontSize: "10px", color: mid, fontStyle: "italic" }}>{formatDate(edu.startDate)} – {edu.current ? "atual" : formatDate(edu.endDate)}</span>
                  </div>
                  <div style={{ fontSize: "11px", color: rose }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          )}

          {courses.length > 0 && (
            <div>
              <h2 style={{ fontSize: "12px", fontWeight: "bold", color: rose, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>Cursos</h2>
              <div style={{ height: "1px", backgroundColor: rose, opacity: 0.3, marginBottom: "14px" }} />
              {courses.map(c => (
                <div key={c.id} style={{ fontSize: "11px", marginBottom: "5px", display: "flex", justifyContent: "space-between" }}>
                  <span><strong style={{ color: dark }}>{c.name}</strong> <span style={{ color: mid }}>— {c.institution}</span></span>
                  {c.year && <span style={{ color: mid, fontStyle: "italic" }}>{c.year}</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ flex: "0 0 32%", minWidth: 0 }}>
          {skills.length > 0 && (
            <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: light, borderRadius: "8px", border: `1px solid #f0d0d5` }}>
              <h2 style={{ fontSize: "11px", fontWeight: "bold", color: rose, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>Habilidades</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                {skills.map(s => (
                  <span key={s.id} style={{ fontSize: "9px", padding: "3px 9px", backgroundColor: "white", border: `1px solid ${rose}`, borderRadius: "999px", color: rose }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {languages.length > 0 && (
            <div style={{ marginBottom: "20px", padding: "16px", backgroundColor: light, borderRadius: "8px", border: `1px solid #f0d0d5` }}>
              <h2 style={{ fontSize: "11px", fontWeight: "bold", color: rose, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "10px" }}>Idiomas</h2>
              {languages.map(l => (
                <div key={l.id} style={{ marginBottom: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "3px" }}>
                    <span style={{ color: dark, fontWeight: "bold" }}>{l.name}</span>
                    <span style={{ color: mid, fontStyle: "italic" }}>{l.level}</span>
                  </div>
                  <LanguageBar level={l.level} accent={rose} bg="#f0d0d5" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== Shared components ========== */
const ModernSidebarSection = ({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) => (
  <div className="mb-5"><h2 className="text-[11px] font-bold uppercase tracking-wider pb-1.5 mb-3 border-b" style={{ borderColor: accent, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>{children}</div>
);
const MainSection = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div><h2 className="text-[13px] font-bold uppercase tracking-wider pb-1.5 mb-3 border-b-2" style={{ color, borderColor: color, fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>{children}</div>
);
const ClassicSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div><h2 className="text-[14px] font-bold uppercase tracking-wider pb-1 mb-3" style={{ color, borderBottom: `2px solid ${accent}`, fontFamily: "'Space Grotesk', serif" }}>{title}</h2>{children}</div>
);
const MinimalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div><h2 className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2.5" style={{ borderBottom: "1px solid #ddd", color: "#555", fontFamily: "'Space Grotesk', sans-serif" }}>{title}</h2>{children}</div>
);
const CreativeSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div><h2 className="text-[12px] font-bold uppercase tracking-wider pb-1.5 mb-3 flex items-center gap-2" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}><span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />{title}</h2>{children}</div>
);
const ExecutiveSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div><h2 className="text-[13px] font-bold uppercase tracking-wider pb-1.5 mb-3" style={{ color, borderBottom: `2px solid ${accent}`, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em" }}>{title}</h2>{children}</div>
);
const LanguageBar = ({ level, accent, bg }: { level: string; accent: string; bg: string }) => {
  const levels: Record<string, number> = { "Básico": 1, "Intermediário": 2, "Avançado": 3, "Fluente": 4, "Nativo": 5 };
  const filled = levels[level] || 1;
  return <div className="flex gap-1">{[1,2,3,4,5].map(i => <div key={i} className="h-1.5 flex-1 rounded-sm" style={{ backgroundColor: i <= filled ? accent : bg }} />)}</div>;
};

export default ResumePreview;