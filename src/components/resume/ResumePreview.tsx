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
  return <ModernTemplate data={data} />;
};

/* ========== MODERN: Two-column sidebar layout ========== */
const ModernTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const sidebar = "#1a365d";
  const accent = "#63b3ed";
  const sidebarDark = "#2d4a7a";

  return (
    <div
      id="resume-preview"
      className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", letterSpacing: "0.01em", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased", minHeight: "297mm" }}
    >
      {/* Header */}
      <div className="flex" style={{ backgroundColor: sidebar, color: "white" }}>
        <div className="w-[32%] flex items-center justify-center py-6 px-4">
          {personalInfo.photo ? (
            <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
          ) : (
            <div className="w-24 h-32 rounded-md border-2 flex items-center justify-center text-2xl font-bold shadow-md ring-1 ring-black/10" style={{ borderColor: accent, backgroundColor: sidebarDark }}>
              {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
            </div>
          )}
        </div>
        <div className="w-[68%] flex items-center py-6 px-5">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em", wordBreak: "break-word" }}>
              {personalInfo.fullName || "SEU NOME COMPLETO"}
            </h1>
            {personalInfo.objective && (
              <p className="mt-2 text-xs leading-relaxed opacity-85" style={{ wordBreak: "break-word" }}>
                {personalInfo.objective}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex" style={{ minHeight: "calc(297mm - 170px)" }}>
        {/* Sidebar */}
        <div className="w-[32%] py-5 px-4" style={{ backgroundColor: sidebar, color: "white", fontSize: "11px", lineHeight: "1.55" }}>
          <ModernSidebarSection title="CONTATO" accent={accent}>
            <div className="space-y-2.5">
              {personalInfo.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span style={{ wordBreak: "break-word" }}>{personalInfo.phone}</span>
                </div>
              )}
              {personalInfo.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span style={{ wordBreak: "break-word" }}>{personalInfo.email}</span>
                </div>
              )}
              {(personalInfo.city || personalInfo.state) && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>
                </div>
              )}
              {personalInfo.linkedin && (
                <div className="flex items-start gap-2">
                  <Linkedin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: accent }} />
                  <span style={{ wordBreak: "break-word" }}>{personalInfo.linkedin}</span>
                </div>
              )}
            </div>
          </ModernSidebarSection>

          {skills.length > 0 && (
            <ModernSidebarSection title="HABILIDADES" accent={accent}>
              <ul className="space-y-1.5">
                {skills.map((s) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <span style={{ color: accent }} className="mt-0.5">•</span>
                    <span style={{ wordBreak: "break-word" }}>{s.name}</span>
                  </li>
                ))}
              </ul>
            </ModernSidebarSection>
          )}

          {languages.length > 0 && (
            <ModernSidebarSection title="IDIOMAS" accent={accent}>
              <div className="space-y-3">
                {languages.map((l) => (
                  <div key={l.id}>
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold">{l.name}</span>
                      <span className="text-[10px] opacity-75">{l.level}</span>
                    </div>
                    <LanguageBar level={l.level} accent={accent} bg={sidebarDark} />
                  </div>
                ))}
              </div>
            </ModernSidebarSection>
          )}

          {courses.length > 0 && (
            <ModernSidebarSection title="CURSOS" accent={accent}>
              <div className="space-y-2.5">
                {courses.map((c) => (
                  <div key={c.id}>
                    <div className="font-semibold text-[11px]" style={{ wordBreak: "break-word" }}>{c.name}</div>
                    <div className="text-[10px] opacity-75">{c.institution}{c.year ? ` (${c.year})` : ""}</div>
                  </div>
                ))}
              </div>
            </ModernSidebarSection>
          )}
        </div>

        {/* Content */}
        <div className="w-[68%] py-5 px-6 space-y-5">
          {experience.length > 0 && (
            <MainSection title="EXPERIÊNCIA PROFISSIONAL" color={sidebar}>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="font-bold text-[12px]" style={{ color: "#1a202c", wordBreak: "break-word" }}>
                      {exp.position}
                    </div>
                    <div className="text-[11px] font-medium" style={{ color: "#4a5568" }}>
                      {exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}
                    </div>
                    {exp.description && (
                      <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#4a5568" }}>
                        {exp.description.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0" style={{ color: accent }}>•</span>
                            <span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </MainSection>
          )}

          {education.length > 0 && (
            <MainSection title="FORMAÇÃO ACADÊMICA" color={sidebar}>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-bold text-[12px]" style={{ color: "#1a202c", wordBreak: "break-word" }}>
                      {edu.degree}: {edu.course}
                    </div>
                    <div className="text-[11px]" style={{ color: "#4a5568" }}>
                      {edu.institution} | {formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            </MainSection>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== CLASSIC: Single-column, traditional formal resume ========== */
const ClassicTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "#2c3e50";
  const accent = "#c0392b";

  return (
    <div
      id="resume-preview"
      className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontSize: "12px", lineHeight: "1.65", letterSpacing: "0.01em", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased", minHeight: "297mm" }}
    >
      {/* Header - centered, traditional */}
      <div className="text-center pt-10 pb-5 px-10" style={{ borderBottom: `3px double ${primary}` }}>
        {personalInfo.photo && (
          <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
        )}
        <h1 className="text-3xl font-bold uppercase" style={{ color: primary, letterSpacing: "0.12em", fontFamily: "'Space Grotesk', serif", wordBreak: "break-word" }}>
          {personalInfo.fullName || "SEU NOME COMPLETO"}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mt-3 text-[11px]" style={{ color: "#555" }}>
          {personalInfo.phone && <span>📞 {personalInfo.phone}</span>}
          {personalInfo.email && <span>✉ {personalInfo.email}</span>}
          {(personalInfo.city || personalInfo.state) && <span>📍 {[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
          {personalInfo.linkedin && <span>🔗 {personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Content - single column */}
      <div className="px-10 py-6 space-y-5">
        {personalInfo.objective && (
          <ClassicSection title="Objetivo Profissional" color={primary} accent={accent}>
            <p className="text-[12px] leading-relaxed" style={{ color: "#333", wordBreak: "break-word" }}>{personalInfo.objective}</p>
          </ClassicSection>
        )}

        {experience.length > 0 && (
          <ClassicSection title="Experiência Profissional" color={primary} accent={accent}>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{exp.position}</span>
                    <span className="text-[10px] italic" style={{ color: "#888" }}>
                      {formatDate(exp.startDate)} — {exp.current ? "Atual" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div className="text-[11px] italic" style={{ color: "#666" }}>
                    {exp.company}{exp.city ? `, ${exp.city}` : ""}
                  </div>
                  {exp.description && (
                    <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>
                      {exp.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0" style={{ color: accent }}>■</span>
                          <span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ClassicSection>
        )}

        {education.length > 0 && (
          <ClassicSection title="Formação Acadêmica" color={primary} accent={accent}>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>
                      {edu.degree} — {edu.course}
                    </span>
                    <span className="text-[10px] italic" style={{ color: "#888" }}>
                      {formatDate(edu.startDate)} — {edu.current ? "Cursando" : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="text-[11px] italic" style={{ color: "#666" }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          </ClassicSection>
        )}

        {courses.length > 0 && (
          <ClassicSection title="Cursos e Certificações" color={primary} accent={accent}>
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="flex flex-wrap justify-between items-baseline gap-2">
                  <span className="text-[11px]" style={{ wordBreak: "break-word" }}>
                    <span className="font-bold" style={{ color: primary }}>{c.name}</span> — {c.institution}
                  </span>
                  <span className="text-[10px] italic" style={{ color: "#888" }}>
                    {[c.hours, c.year].filter(Boolean).join(" | ")}
                  </span>
                </div>
              ))}
            </div>
          </ClassicSection>
        )}

        {/* Two columns for skills and languages */}
        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && (
            <ClassicSection title="Habilidades" color={primary} accent={accent}>
              <ul className="space-y-1">
                {skills.map((s) => (
                  <li key={s.id} className="text-[11px] flex items-start gap-2" style={{ color: "#444" }}>
                    <span style={{ color: accent }} className="mt-0.5">■</span>
                    <span style={{ wordBreak: "break-word" }}>{s.name}</span>
                  </li>
                ))}
              </ul>
            </ClassicSection>
          )}
          {languages.length > 0 && (
            <ClassicSection title="Idiomas" color={primary} accent={accent}>
              <div className="space-y-1.5">
                {languages.map((l) => (
                  <div key={l.id} className="text-[11px] flex justify-between" style={{ color: "#444" }}>
                    <span className="font-semibold">{l.name}</span>
                    <span className="italic" style={{ color: "#888" }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </ClassicSection>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== MINIMAL: Clean, modern flat design, no sidebar ========== */
const MinimalTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;

  return (
    <div
      id="resume-preview"
      className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", letterSpacing: "0.01em", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased", minHeight: "297mm" }}
    >
      {/* Header */}
      <div className="px-10 pt-10 pb-5" style={{ borderBottom: "2px solid #222" }}>
        <div className="flex items-center gap-6">
          {personalInfo.photo && (
            <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
          )}
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#222", wordBreak: "break-word" }}>
              {personalInfo.fullName || "SEU NOME COMPLETO"}
            </h1>
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
        {personalInfo.objective && (
          <MinimalSection title="OBJETIVO">
            <p className="text-[12px] leading-relaxed" style={{ color: "#444", wordBreak: "break-word" }}>{personalInfo.objective}</p>
          </MinimalSection>
        )}

        {experience.length > 0 && (
          <MinimalSection title="EXPERIÊNCIA PROFISSIONAL">
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="font-bold text-[12px]" style={{ color: "#222", wordBreak: "break-word" }}>{exp.position}</div>
                  <div className="text-[11px]" style={{ color: "#777" }}>
                    {exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}
                  </div>
                  {exp.description && (
                    <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>
                      {exp.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 flex-shrink-0" style={{ color: "#999" }}>•</span>
                          <span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </MinimalSection>
        )}

        {education.length > 0 && (
          <MinimalSection title="FORMAÇÃO">
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id} className="text-[12px]">
                  <span className="font-bold" style={{ color: "#222", wordBreak: "break-word" }}>{edu.degree}: {edu.course}</span>
                  <span style={{ color: "#777" }}> — {edu.institution}</span>
                  <span className="ml-2 text-[10px]" style={{ color: "#999" }}>
                    {formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}
                  </span>
                </div>
              ))}
            </div>
          </MinimalSection>
        )}

        {courses.length > 0 && (
          <MinimalSection title="CURSOS">
            <div className="space-y-1.5">
              {courses.map((c) => (
                <div key={c.id} className="text-[11px]">
                  <span className="font-bold" style={{ color: "#222", wordBreak: "break-word" }}>{c.name}</span>
                  <span style={{ color: "#666" }}> — {c.institution}</span>
                  {(c.hours || c.year) && <span style={{ color: "#999" }}> ({[c.hours, c.year].filter(Boolean).join(", ")})</span>}
                </div>
              ))}
            </div>
          </MinimalSection>
        )}

        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && (
            <MinimalSection title="HABILIDADES">
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id} className="text-[10px] px-2.5 py-1 rounded" style={{ border: "1px solid #ddd", color: "#444", wordBreak: "break-word" }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </MinimalSection>
          )}
          {languages.length > 0 && (
            <MinimalSection title="IDIOMAS">
              <div className="space-y-1">
                {languages.map((l) => (
                  <div key={l.id} className="text-[11px]" style={{ color: "#444" }}>
                    <span className="font-semibold">{l.name}</span> — <span style={{ color: "#888" }}>{l.level}</span>
                  </div>
                ))}
              </div>
            </MinimalSection>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== CREATIVE: Bold, colorful, two-column with accent bar ========== */
const CreativeTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "#6c3483";
  const accent = "#f39c12";
  const bg = "#fdf6ec";

  return (
    <div
      id="resume-preview"
      className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", letterSpacing: "0.01em", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased", minHeight: "297mm" }}
    >
      {/* Top accent bar */}
      <div style={{ height: "6px", background: `linear-gradient(90deg, ${primary}, ${accent})` }} />

      {/* Header */}
      <div className="px-10 pt-8 pb-6 flex items-center gap-6" style={{ backgroundColor: bg }}>
        {personalInfo.photo ? (
          <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
        ) : (
          <div className="w-24 h-32 rounded-lg flex items-center justify-center text-3xl font-bold shadow-md" style={{ border: `3px solid ${accent}`, backgroundColor: primary, color: "white" }}>
            {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif", color: primary, wordBreak: "break-word" }}>
            {personalInfo.fullName || "SEU NOME COMPLETO"}
          </h1>
          {personalInfo.objective && (
            <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "#555", wordBreak: "break-word", maxWidth: "480px" }}>{personalInfo.objective}</p>
          )}
          <div className="flex flex-wrap gap-3 mt-3">
            {personalInfo.phone && <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: primary, color: "white" }}>📞 {personalInfo.phone}</span>}
            {personalInfo.email && <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: primary, color: "white" }}>✉ {personalInfo.email}</span>}
            {(personalInfo.city || personalInfo.state) && <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: primary, color: "white" }}>📍 {[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
            {personalInfo.linkedin && <span className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: primary, color: "white" }}>🔗 {personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>

      {/* Body - two columns */}
      <div className="flex px-10 py-6 gap-8">
        {/* Main column */}
        <div className="w-[65%] space-y-5">
          {experience.length > 0 && (
            <CreativeSection title="Experiência" color={primary} accent={accent}>
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="pl-4" style={{ borderLeft: `3px solid ${accent}` }}>
                    <div className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{exp.position}</div>
                    <div className="text-[11px]" style={{ color: "#777" }}>
                      {exp.company}{exp.city ? ` — ${exp.city}` : ""} | {formatDate(exp.startDate)} - {exp.current ? "Atual" : formatDate(exp.endDate)}
                    </div>
                    {exp.description && (
                      <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>
                        {exp.description.split("\n").filter(Boolean).map((line, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="mt-1 flex-shrink-0" style={{ color: accent }}>▸</span>
                            <span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </CreativeSection>
          )}

          {education.length > 0 && (
            <CreativeSection title="Formação" color={primary} accent={accent}>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="pl-4" style={{ borderLeft: `3px solid ${accent}` }}>
                    <div className="font-bold text-[12px]" style={{ color: primary, wordBreak: "break-word" }}>{edu.degree}: {edu.course}</div>
                    <div className="text-[11px]" style={{ color: "#777" }}>
                      {edu.institution} | {formatDate(edu.startDate)} - {edu.current ? "Cursando" : formatDate(edu.endDate)}
                    </div>
                  </div>
                ))}
              </div>
            </CreativeSection>
          )}
        </div>

        {/* Side column */}
        <div className="w-[35%] space-y-5">
          {skills.length > 0 && (
            <CreativeSection title="Habilidades" color={primary} accent={accent}>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((s) => (
                  <span key={s.id} className="text-[10px] px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: bg, color: primary, border: `1px solid ${accent}`, wordBreak: "break-word" }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </CreativeSection>
          )}

          {languages.length > 0 && (
            <CreativeSection title="Idiomas" color={primary} accent={accent}>
              <div className="space-y-2">
                {languages.map((l) => (
                  <div key={l.id}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold" style={{ color: primary }}>{l.name}</span>
                      <span style={{ color: "#888" }}>{l.level}</span>
                    </div>
                    <LanguageBar level={l.level} accent={accent} bg="#eee" />
                  </div>
                ))}
              </div>
            </CreativeSection>
          )}

          {courses.length > 0 && (
            <CreativeSection title="Cursos" color={primary} accent={accent}>
              <div className="space-y-2">
                {courses.map((c) => (
                  <div key={c.id}>
                    <div className="font-semibold text-[11px]" style={{ color: primary, wordBreak: "break-word" }}>{c.name}</div>
                    <div className="text-[10px]" style={{ color: "#888" }}>{c.institution}{c.year ? ` (${c.year})` : ""}</div>
                  </div>
                ))}
              </div>
            </CreativeSection>
          )}
        </div>
      </div>
    </div>
  );
};

/* ========== EXECUTIVE: Elegant, dark header, sophisticated ========== */
const ExecutiveTemplate = ({ data }: { data: ResumeData }) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const dark = "#1a1a2e";
  const gold = "#c9a84c";

  return (
    <div
      id="resume-preview"
      className="bg-white w-full max-w-[210mm] mx-auto shadow-elevated"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "12px", lineHeight: "1.6", letterSpacing: "0.01em", textRendering: "optimizeLegibility", WebkitFontSmoothing: "antialiased", minHeight: "297mm" }}
    >
      {/* Header */}
      <div className="px-10 pt-10 pb-6 flex items-center gap-6" style={{ backgroundColor: dark, color: "white" }}>
        {personalInfo.photo ? (
          <img src={personalInfo.photo} alt="Foto" style={{ width: "96px", height: "128px", display: "block", borderRadius: "6px" }} />
        ) : (
          <div className="w-24 h-32 rounded flex items-center justify-center text-3xl font-bold" style={{ border: `2px solid ${gold}`, backgroundColor: "#16213e", color: gold }}>
            {personalInfo.fullName ? personalInfo.fullName.charAt(0).toUpperCase() : "?"}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', sans-serif", color: gold, letterSpacing: "0.1em", wordBreak: "break-word" }}>
            {personalInfo.fullName || "SEU NOME COMPLETO"}
          </h1>
          <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] opacity-80">
            {personalInfo.phone && <span>{personalInfo.phone}</span>}
            {personalInfo.email && <span>{personalInfo.email}</span>}
            {(personalInfo.city || personalInfo.state) && <span>{[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}</span>}
            {personalInfo.linkedin && <span>{personalInfo.linkedin}</span>}
          </div>
        </div>
      </div>
      <div style={{ height: "3px", backgroundColor: gold }} />

      {/* Body */}
      <div className="px-10 py-6 space-y-5">
        {personalInfo.objective && (
          <ExecutiveSection title="Perfil Profissional" color={dark} accent={gold}>
            <p className="text-[12px] leading-relaxed italic" style={{ color: "#444", wordBreak: "break-word" }}>{personalInfo.objective}</p>
          </ExecutiveSection>
        )}

        {experience.length > 0 && (
          <ExecutiveSection title="Experiência Profissional" color={dark} accent={gold}>
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="font-bold text-[12px]" style={{ color: dark, wordBreak: "break-word" }}>{exp.position}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: dark, color: gold }}>
                      {formatDate(exp.startDate)} — {exp.current ? "Atual" : formatDate(exp.endDate)}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium" style={{ color: "#666" }}>
                    {exp.company}{exp.city ? ` • ${exp.city}` : ""}
                  </div>
                  {exp.description && (
                    <ul className="mt-1.5 space-y-1 text-[11px]" style={{ color: "#444" }}>
                      {exp.description.split("\n").filter(Boolean).map((line, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-0.5 flex-shrink-0 text-[8px]" style={{ color: gold }}>◆</span>
                          <span style={{ wordBreak: "break-word" }}>{line.replace(/^[-•]\s*/, "")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </ExecutiveSection>
        )}

        {education.length > 0 && (
          <ExecutiveSection title="Formação Acadêmica" color={dark} accent={gold}>
            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap justify-between items-baseline gap-2">
                    <span className="font-bold text-[12px]" style={{ color: dark, wordBreak: "break-word" }}>{edu.degree} — {edu.course}</span>
                    <span className="text-[10px]" style={{ color: "#888" }}>
                      {formatDate(edu.startDate)} — {edu.current ? "Cursando" : formatDate(edu.endDate)}
                    </span>
                  </div>
                  <div className="text-[11px]" style={{ color: "#666" }}>{edu.institution}</div>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        )}

        {courses.length > 0 && (
          <ExecutiveSection title="Cursos e Certificações" color={dark} accent={gold}>
            <div className="space-y-2">
              {courses.map((c) => (
                <div key={c.id} className="flex flex-wrap justify-between items-baseline gap-2">
                  <span className="text-[11px]" style={{ wordBreak: "break-word" }}>
                    <span className="font-bold" style={{ color: dark }}>{c.name}</span> — {c.institution}
                  </span>
                  <span className="text-[10px]" style={{ color: "#888" }}>{[c.hours, c.year].filter(Boolean).join(" | ")}</span>
                </div>
              ))}
            </div>
          </ExecutiveSection>
        )}

        <div className="grid grid-cols-2 gap-8">
          {skills.length > 0 && (
            <ExecutiveSection title="Competências" color={dark} accent={gold}>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id} className="text-[10px] px-3 py-1 rounded font-medium" style={{ backgroundColor: dark, color: gold, wordBreak: "break-word" }}>
                    {s.name}
                  </span>
                ))}
              </div>
            </ExecutiveSection>
          )}
          {languages.length > 0 && (
            <ExecutiveSection title="Idiomas" color={dark} accent={gold}>
              <div className="space-y-2">
                {languages.map((l) => (
                  <div key={l.id}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold" style={{ color: dark }}>{l.name}</span>
                      <span style={{ color: "#888" }}>{l.level}</span>
                    </div>
                    <LanguageBar level={l.level} accent={gold} bg="#eee" />
                  </div>
                ))}
              </div>
            </ExecutiveSection>
          )}
        </div>
      </div>
    </div>
  );
};



const ModernSidebarSection = ({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) => (
  <div className="mb-5">
    <h2 className="text-[11px] font-bold uppercase tracking-wider pb-1.5 mb-3 border-b" style={{ borderColor: accent, fontFamily: "'Space Grotesk', sans-serif" }}>
      {title}
    </h2>
    {children}
  </div>
);

const MainSection = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[13px] font-bold uppercase tracking-wider pb-1.5 mb-3 border-b-2" style={{ color, borderColor: color, fontFamily: "'Space Grotesk', sans-serif" }}>
      {title}
    </h2>
    {children}
  </div>
);

const ClassicSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[14px] font-bold uppercase tracking-wider pb-1 mb-3" style={{ color, borderBottom: `2px solid ${accent}`, fontFamily: "'Space Grotesk', serif" }}>
      {title}
    </h2>
    {children}
  </div>
);

const MinimalSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[11px] font-bold uppercase tracking-widest pb-1 mb-2.5" style={{ borderBottom: "1px solid #ddd", color: "#555", fontFamily: "'Space Grotesk', sans-serif" }}>
      {title}
    </h2>
    {children}
  </div>
);

const CreativeSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[12px] font-bold uppercase tracking-wider pb-1.5 mb-3 flex items-center gap-2" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
      <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
      {title}
    </h2>
    {children}
  </div>
);

const ExecutiveSection = ({ title, color, accent, children }: { title: string; color: string; accent: string; children: React.ReactNode }) => (
  <div>
    <h2 className="text-[13px] font-bold uppercase tracking-wider pb-1.5 mb-3" style={{ color, borderBottom: `2px solid ${accent}`, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.08em" }}>
      {title}
    </h2>
    {children}
  </div>
);

const LanguageBar = ({ level, accent, bg }: { level: string; accent: string; bg: string }) => {
  const levels: Record<string, number> = { "Básico": 1, "Intermediário": 2, "Avançado": 3, "Fluente": 4, "Nativo": 5 };
  const filled = levels[level] || 1;
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-1.5 flex-1 rounded-sm" style={{ backgroundColor: i <= filled ? accent : bg }} />
      ))}
    </div>
  );
};

export default ResumePreview;