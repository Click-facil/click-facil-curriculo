import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from "docx";
import { saveAs } from "file-saver";
import { ResumeData } from "@/types/resume";

const formatDate = (date: string) => {
  if (!date) return "";
  const [year, month] = date.split("-");
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
  return `${months[parseInt(month) - 1]}/${year}`;
};

export const exportToDocx = async (data: ResumeData) => {
  const { personalInfo, education, experience, courses, skills, languages } = data;

  const sections: Paragraph[] = [];

  // Nome
  sections.push(
    new Paragraph({
      children: [new TextRun({ text: personalInfo.fullName.toUpperCase(), bold: true, size: 32, font: "Arial" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Contato
  const contactParts = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.city && personalInfo.state ? `${personalInfo.city} - ${personalInfo.state}` : "",
    personalInfo.linkedin || "",
  ].filter(Boolean);

  sections.push(
    new Paragraph({
      children: [new TextRun({ text: contactParts.join("  |  "), size: 20, font: "Arial", color: "666666" })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "1a365d" } },
    })
  );

  // Nota sobre foto
  if (personalInfo.photo) {
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: "Foto disponivel no curriculo em PDF", size: 18, font: "Arial", color: "999999", italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Objetivo
  if (personalInfo.objective) {
    sections.push(sectionTitle("OBJETIVO PROFISSIONAL"));
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: personalInfo.objective, size: 22, font: "Arial" })],
        spacing: { after: 200 },
      })
    );
  }

  // Experiencia
  if (experience.length > 0) {
    sections.push(sectionTitle("EXPERIENCIA PROFISSIONAL"));
    experience.forEach((exp) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: ` — ${exp.company}${exp.city ? `, ${exp.city}` : ""}`, size: 22, font: "Arial" }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${formatDate(exp.startDate)} - ${exp.current ? "Atual" : formatDate(exp.endDate)}`,
              size: 20,
              font: "Arial",
              color: "666666",
            }),
          ],
        })
      );
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach((line) => {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: line.replace(/^[-•]\s*/, ""), size: 22, font: "Arial" })],
              bullet: { level: 0 },
            })
          );
        });
      }
    });
  }

  // Formacao
  if (education.length > 0) {
    sections.push(sectionTitle("FORMACAO ACADEMICA"));
    education.forEach((edu) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${edu.degree}: `, bold: true, size: 22, font: "Arial" }),
            new TextRun({ text: `${edu.course} — ${edu.institution}`, size: 22, font: "Arial" }),
          ],
          spacing: { before: 100 },
        })
      );
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${formatDate(edu.startDate)} - ${edu.current ? "Cursando" : formatDate(edu.endDate)}`,
              size: 20,
              font: "Arial",
              color: "666666",
            }),
          ],
        })
      );
    });
  }

  // Cursos
  if (courses.length > 0) {
    sections.push(sectionTitle("CURSOS E CERTIFICACOES"));
    courses.forEach((c) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({ text: c.name, bold: true, size: 22, font: "Arial" }),
            new TextRun({
              text: ` — ${c.institution}${c.hours || c.year ? ` (${[c.hours, c.year].filter(Boolean).join(", ")})` : ""}`,
              size: 22,
              font: "Arial",
            }),
          ],
          bullet: { level: 0 },
        })
      );
    });
  }

  // Habilidades
  if (skills.length > 0) {
    sections.push(sectionTitle("HABILIDADES"));
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: skills.map((s) => `${s.name} (${s.level})`).join(" • "), size: 22, font: "Arial" })],
      })
    );
  }

  // Idiomas
  if (languages.length > 0) {
    sections.push(sectionTitle("IDIOMAS"));
    sections.push(
      new Paragraph({
        children: [new TextRun({ text: languages.map((l) => `${l.name} — ${l.level}`).join(" • "), size: 22, font: "Arial" })],
      })
    );
  }

  const doc = new Document({
    sections: [{ properties: {}, children: sections }],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `curriculo-${personalInfo.fullName.replace(/\s+/g, "-").toLowerCase() || "meu"}.docx`;
  saveAs(blob, fileName);
};

const sectionTitle = (text: string) =>
  new Paragraph({
    children: [new TextRun({ text, bold: true, size: 24, font: "Arial", color: "1a365d" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 100 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: "1a365d" } },
  });