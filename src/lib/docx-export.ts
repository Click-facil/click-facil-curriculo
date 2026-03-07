import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign, ShadingType } from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/types/resume";
import type { TemplateStyle } from "@/components/resume/ResumeForm";

const formatDate = (date: string) => {
  if (!date) return "";
  const [year, month] = date.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year}`;
};

const dataUrlToUint8Array = (dataUrl: string): Uint8Array => {
  const base64 = dataUrl.split(",")[1];
  const binary = atob(base64);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return arr;
};

export const exportToDocx = async (data: ResumeData, template: TemplateStyle = "modern") => {
  const colors: Record<TemplateStyle, { primary: string; accent: string; bg?: string }> = {
    modern: { primary: "1a365d", accent: "63b3ed" },
    classic: { primary: "2c3e50", accent: "c0392b" },
    minimal: { primary: "222222", accent: "777777" },
    creative: { primary: "6c3483", accent: "f39c12", bg: "fdf6ec" },
    executive: { primary: "1a1a2e", accent: "c9a84c" },
  };

  const { primary, accent, bg } = colors[template];
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const sections: Paragraph[] = [];

  let ImageRun: any = null;
  try {
    const docxModule = await import("docx");
    ImageRun = (docxModule as any).ImageRun;
  } catch { /* sem foto */ }

  // Header com estilo do template
  if (template === "modern" || template === "executive") {
    // Header com fundo colorido
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.fullName.toUpperCase(), bold: true, size: 32, font: "Arial", color: template === "executive" ? accent : "FFFFFF" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        shading: { fill: primary, type: ShadingType.SOLID },
      })
    );
  } else if (template === "creative") {
    // Header com fundo bege
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.fullName.toUpperCase(), bold: true, size: 32, font: "Arial", color: primary })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        shading: { fill: bg, type: ShadingType.SOLID },
      })
    );
  } else {
    // Header simples
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.fullName.toUpperCase(), bold: true, size: 32, font: "Arial", color: primary })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      })
    );
  }

  // Foto
  if (personalInfo.photo && ImageRun) {
    try {
      const imgData = dataUrlToUint8Array(personalInfo.photo);
      sections.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: imgData,
              transformation: { width: 72, height: 96 },
              type: personalInfo.photo.includes("image/png") ? "png" : "jpg",
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    } catch { /* fallback sem foto */ }
  }

  // Contato
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.city && personalInfo.state ? `${personalInfo.city} - ${personalInfo.state}` : "",
    personalInfo.linkedin || "",
  ].filter(Boolean);

  if (template === "creative") {
    // Badges coloridos para template criativo
    const contactRuns = contactParts.map((part, i) => 
      new TextRun({ text: i > 0 ? `  ${part}` : part, size: 20, font: "Arial", color: "FFFFFF", bold: true })
    );
    sections.push(
      new Paragraph({
        children: contactRuns,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        shading: { fill: primary, type: ShadingType.SOLID },
      })
    );
  } else {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: contactParts.join("  |  "), size: 20, font: "Arial", color: "666666" })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: accent } },
      })
    );
  }

  // Objetivo
  if (personalInfo.objective) {
    sections.push(sectionTitle("OBJETIVO PROFISSIONAL", primary, accent));
    sections.push(new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 22, font: "Arial" })], spacing: { after: 200 } }));
  }

  // Experiencia
  if (experience.length > 0) {
    sections.push(sectionTitle("EXPERIENCIA PROFISSIONAL", primary, accent));
    experience.forEach((exp) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: exp.position, bold: true, size: 22, font: "Arial", color: primary }),
          new TextRun({ text: ` - ${exp.company}${exp.city ? `, ${exp.city}` : ""}`, size: 22, font: "Arial" }),
        ],
        spacing: { before: 100 },
      }));
      sections.push(new Paragraph({
        children: [new TextRun({ text: `${formatDate(exp.startDate)} - ${exp.current ? "Atual" : formatDate(exp.endDate)}`, size: 20, font: "Arial", color: "666666" })],
      }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach((line) => {
          sections.push(new Paragraph({
            children: [new TextRun({ text: line.replace(/^[-•]\s*/, ""), size: 22, font: "Arial" })],
            bullet: { level: 0 },
          }));
        });
      }
    });
  }

  // Formacao
  if (education.length > 0) {
    sections.push(sectionTitle("FORMACAO ACADEMICA", primary, accent));
    education.forEach((edu) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree}: `, bold: true, size: 22, font: "Arial", color: primary }),
          new TextRun({ text: `${edu.course} - ${edu.institution}`, size: 22, font: "Arial" }),
        ],
        spacing: { before: 100 },
      }));
      sections.push(new Paragraph({
        children: [new TextRun({ text: `${formatDate(edu.startDate)} - ${edu.current ? "Cursando" : formatDate(edu.endDate)}`, size: 20, font: "Arial", color: "666666" })],
      }));
    });
  }

  // Cursos
  if (courses.length > 0) {
    sections.push(sectionTitle("CURSOS E CERTIFICACOES", primary, accent));
    courses.forEach((c) => {
      sections.push(new Paragraph({
        children: [
          new TextRun({ text: c.name, bold: true, size: 22, font: "Arial", color: primary }),
          new TextRun({ text: ` - ${c.institution}${c.hours || c.year ? ` (${[c.hours, c.year].filter(Boolean).join(", ")})` : ""}`, size: 22, font: "Arial" }),
        ],
        bullet: { level: 0 },
      }));
    });
  }

  // Habilidades
  if (skills.length > 0) {
    sections.push(sectionTitle("HABILIDADES", primary, accent));
    sections.push(new Paragraph({
      children: [new TextRun({ text: skills.map((s) => `${s.name} (${s.level})`).join(" - "), size: 22, font: "Arial" })],
    }));
  }

  // Idiomas
  if (languages.length > 0) {
    sections.push(sectionTitle("IDIOMAS", primary, accent));
    sections.push(new Paragraph({
      children: [new TextRun({ text: languages.map((l) => `${l.name} - ${l.level}`).join(" - "), size: 22, font: "Arial" })],
    }));
  }

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `curriculo-${personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "meu"}.docx`;
  saveAs(blob, fileName);
};

const sectionTitle = (text: string, primary: string, accent: string) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: primary })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: accent } },
  });