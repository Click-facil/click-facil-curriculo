/**
 * docx-export.ts
 * Gera um arquivo .docx fiel ao visual de cada template do currículo.
 * Usa a lib `docx` (já instalada via npm install docx).
 */

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType,
} from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "@/types/resume";
import type { TemplateStyle } from "@/components/resume/ResumeForm";

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (date: string) => {
  if (!date) return "";
  const [year, month] = date.split("-");
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  return `${months[parseInt(month) - 1]}/${year}`;
};

const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

const thinBorder = (color: string) => ({ style: BorderStyle.SINGLE, size: 4, color });

const hex = (c: string) => c.replace("#", "");

const emptyPara = (size = 4) =>
  new Paragraph({ children: [new TextRun({ text: "", size })] });

const dividerPara = (color: string) =>
  new Paragraph({
    children: [new TextRun("")],
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: hex(color), space: 1 } },
    spacing: { after: 120 },
  });

// ── MODERN ────────────────────────────────────────────────────────────────────

function buildModern(data: ResumeData): Document {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const sidebarColor = "1a365d";
  const accentColor  = "63b3ed";
  const PAGE_W = 11906; // A4 DXA
  const SIDEBAR_W = Math.round(PAGE_W * 0.32);
  const MAIN_W = PAGE_W - SIDEBAR_W - 1800; // descontando margens

  const sidebarCell = (children: Paragraph[]) =>
    new TableCell({
      width: { size: SIDEBAR_W, type: WidthType.DXA },
      shading: { fill: sidebarColor, type: ShadingType.CLEAR },
      borders: noBorders,
      margins: { top: 200, bottom: 200, left: 300, right: 300 },
      children,
    });

  const mainCell = (children: Paragraph[]) =>
    new TableCell({
      width: { size: MAIN_W, type: WidthType.DXA },
      borders: noBorders,
      margins: { top: 200, bottom: 200, left: 400, right: 300 },
      children,
    });

  // Sidebar content
  const sidebarItems: Paragraph[] = [];

  const sidebarSection = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 18, color: accentColor, font: "Arial" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accentColor, space: 1 } },
      spacing: { before: 200, after: 100 },
    });

  // Contato
  sidebarItems.push(sidebarSection("CONTATO"));
  if (personalInfo.phone) sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `☎ ${personalInfo.phone}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 60 } }));
  if (personalInfo.email) sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `✉ ${personalInfo.email}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 60 } }));
  if (personalInfo.city || personalInfo.state) sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `⌖ ${[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 60 } }));
  if (personalInfo.linkedin) sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `in ${personalInfo.linkedin}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 60 } }));

  if (skills.length > 0) {
    sidebarItems.push(emptyPara(), sidebarSection("HABILIDADES"));
    skills.forEach(s => sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `• ${s.name}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 40 } })));
  }

  if (languages.length > 0) {
    sidebarItems.push(emptyPara(), sidebarSection("IDIOMAS"));
    languages.forEach(l => sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `${l.name} — ${l.level}`, size: 18, color: "FFFFFF", font: "Arial" })], spacing: { after: 60 } })));
  }

  if (courses.length > 0) {
    sidebarItems.push(emptyPara(), sidebarSection("CURSOS"));
    courses.forEach(c => {
      sidebarItems.push(new Paragraph({ children: [new TextRun({ text: c.name, bold: true, size: 18, color: "FFFFFF", font: "Arial" })] }));
      sidebarItems.push(new Paragraph({ children: [new TextRun({ text: `${c.institution}${c.year ? ` (${c.year})` : ""}`, size: 16, color: "AAAAAA", font: "Arial" })], spacing: { after: 80 } }));
    });
  }

  // Main content
  const mainItems: Paragraph[] = [];

  const mainSection = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 22, color: sidebarColor, font: "Arial" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: sidebarColor, space: 1 } },
      spacing: { before: 200, after: 120 },
    });

  if (experience.length > 0) {
    mainItems.push(mainSection("EXPERIÊNCIA PROFISSIONAL"));
    experience.forEach(exp => {
      mainItems.push(new Paragraph({ children: [new TextRun({ text: exp.position, bold: true, size: 22, color: "1a202c", font: "Arial" })] }));
      mainItems.push(new Paragraph({ children: [new TextRun({ text: `${exp.company}${exp.city ? ` — ${exp.city}` : ""} | ${fmtDate(exp.startDate)} - ${exp.current ? "Atual" : fmtDate(exp.endDate)}`, size: 20, color: "4a5568", font: "Arial" })], spacing: { after: 60 } }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach(line => {
          mainItems.push(new Paragraph({ children: [new TextRun({ text: `• ${line.replace(/^[-•]\s*/, "")}`, size: 20, color: "4a5568", font: "Arial" })], spacing: { after: 40 } }));
        });
      }
      mainItems.push(emptyPara());
    });
  }

  if (education.length > 0) {
    mainItems.push(mainSection("FORMAÇÃO ACADÊMICA"));
    education.forEach(edu => {
      mainItems.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree}: ${edu.course}`, bold: true, size: 22, color: "1a202c", font: "Arial" })] }));
      mainItems.push(new Paragraph({ children: [new TextRun({ text: `${edu.institution} | ${fmtDate(edu.startDate)} - ${edu.current ? "Cursando" : fmtDate(edu.endDate)}`, size: 20, color: "4a5568", font: "Arial" })], spacing: { after: 80 } }));
    });
  }

  // Header row
  const headerRow = new TableRow({
    children: [
      new TableCell({
        columnSpan: 2,
        shading: { fill: sidebarColor, type: ShadingType.CLEAR },
        borders: noBorders,
        margins: { top: 300, bottom: 300, left: 400, right: 400 },
        children: [
          new Paragraph({ children: [new TextRun({ text: personalInfo.fullName || "SEU NOME", bold: true, size: 40, color: "FFFFFF", font: "Arial" })] }),
          ...(personalInfo.objective ? [new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 18, color: "CCCCCC", font: "Arial" })] })] : []),
        ],
      }),
    ],
  });

  const contentRow = new TableRow({
    children: [sidebarCell(sidebarItems), mainCell(mainItems)],
  });

  return new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 720, left: 0, right: 0 } } },
      children: [
        new Table({
          width: { size: 11906, type: WidthType.DXA },
          columnWidths: [SIDEBAR_W, MAIN_W + 1800],
          rows: [headerRow, contentRow],
        }),
      ],
    }],
  });
}

// ── CLASSIC ───────────────────────────────────────────────────────────────────

function buildClassic(data: ResumeData): Document {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "2c3e50";
  const accent  = "c0392b";

  const sectionTitle = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 26, color: primary, font: "Georgia" })],
      border: { bottom: { style: BorderStyle.DOUBLE, size: 6, color: accent, space: 1 } },
      spacing: { before: 240, after: 120 },
    });

  const children: Paragraph[] = [
    // Nome
    new Paragraph({ children: [new TextRun({ text: personalInfo.fullName || "SEU NOME", bold: true, size: 48, color: primary, font: "Arial" })], alignment: AlignmentType.CENTER }),
    new Paragraph({
      children: [
        ...(personalInfo.phone ? [new TextRun({ text: `☎ ${personalInfo.phone}   `, size: 20, color: "555555", font: "Georgia" })] : []),
        ...(personalInfo.email ? [new TextRun({ text: `✉ ${personalInfo.email}   `, size: 20, color: "555555", font: "Georgia" })] : []),
        ...((personalInfo.city || personalInfo.state) ? [new TextRun({ text: `⌖ ${[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}   `, size: 20, color: "555555", font: "Georgia" })] : []),
        ...(personalInfo.linkedin ? [new TextRun({ text: `in ${personalInfo.linkedin}`, size: 20, color: "555555", font: "Georgia" })] : []),
      ],
      alignment: AlignmentType.CENTER,
      border: { bottom: { style: BorderStyle.DOUBLE, size: 8, color: primary, space: 1 } },
      spacing: { after: 200 },
    }),
  ];

  if (personalInfo.objective) {
    children.push(sectionTitle("Objetivo Profissional"), new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 22, color: "333333", font: "Georgia" })], spacing: { after: 120 } }));
  }

  if (experience.length > 0) {
    children.push(sectionTitle("Experiência Profissional"));
    experience.forEach(exp => {
      children.push(new Paragraph({ children: [new TextRun({ text: exp.position, bold: true, size: 22, color: primary, font: "Georgia" }), new TextRun({ text: `   ${fmtDate(exp.startDate)} — ${exp.current ? "Atual" : fmtDate(exp.endDate)}`, size: 18, color: "888888", italics: true, font: "Georgia" })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: `${exp.company}${exp.city ? `, ${exp.city}` : ""}`, size: 20, italics: true, color: "666666", font: "Georgia" })], spacing: { after: 60 } }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach(line => {
          children.push(new Paragraph({ children: [new TextRun({ text: `■ ${line.replace(/^[-•]\s*/, "")}`, size: 20, color: "444444", font: "Georgia" })], spacing: { after: 40 } }));
        });
      }
      children.push(emptyPara());
    });
  }

  if (education.length > 0) {
    children.push(sectionTitle("Formação Acadêmica"));
    education.forEach(edu => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree} — ${edu.course}`, bold: true, size: 22, color: primary, font: "Georgia" }), new TextRun({ text: `   ${fmtDate(edu.startDate)} — ${edu.current ? "Cursando" : fmtDate(edu.endDate)}`, size: 18, color: "888888", italics: true, font: "Georgia" })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: edu.institution, size: 20, italics: true, color: "666666", font: "Georgia" })], spacing: { after: 80 } }));
    });
  }

  if (courses.length > 0) {
    children.push(sectionTitle("Cursos e Certificações"));
    courses.forEach(c => {
      children.push(new Paragraph({ children: [new TextRun({ text: c.name, bold: true, size: 20, color: primary, font: "Georgia" }), new TextRun({ text: ` — ${c.institution}${c.year ? ` (${c.year})` : ""}`, size: 20, color: "444444", font: "Georgia" })], spacing: { after: 60 } }));
    });
  }

  if (skills.length > 0) {
    children.push(sectionTitle("Habilidades"));
    skills.forEach(s => children.push(new Paragraph({ children: [new TextRun({ text: `■ ${s.name}`, size: 20, color: "444444", font: "Georgia" })], spacing: { after: 40 } })));
  }

  if (languages.length > 0) {
    children.push(sectionTitle("Idiomas"));
    languages.forEach(l => children.push(new Paragraph({ children: [new TextRun({ text: `${l.name}`, bold: true, size: 20, color: "444444", font: "Georgia" }), new TextRun({ text: ` — ${l.level}`, size: 20, italics: true, color: "888888", font: "Georgia" })], spacing: { after: 60 } })));
  }

  return new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children,
    }],
  });
}

// ── MINIMAL ───────────────────────────────────────────────────────────────────

function buildMinimal(data: ResumeData): Document {
  const { personalInfo, education, experience, courses, skills, languages } = data;

  const sectionTitle = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 20, color: "555555", font: "Arial" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD", space: 1 } },
      spacing: { before: 240, after: 120 },
    });

  const children: Paragraph[] = [
    new Paragraph({ children: [new TextRun({ text: personalInfo.fullName || "SEU NOME", bold: true, size: 40, color: "222222", font: "Arial" })] }),
    new Paragraph({
      children: [
        new TextRun({ text: [personalInfo.email, personalInfo.phone, [personalInfo.city, personalInfo.state].filter(Boolean).join(" - "), personalInfo.linkedin].filter(Boolean).join("   ·   "), size: 18, color: "777777", font: "Arial" }),
      ],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "222222", space: 1 } },
      spacing: { after: 200 },
    }),
  ];

  if (personalInfo.objective) {
    children.push(sectionTitle("OBJETIVO"), new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 22, color: "444444", font: "Arial" })], spacing: { after: 120 } }));
  }

  if (experience.length > 0) {
    children.push(sectionTitle("EXPERIÊNCIA PROFISSIONAL"));
    experience.forEach(exp => {
      children.push(new Paragraph({ children: [new TextRun({ text: exp.position, bold: true, size: 22, color: "222222", font: "Arial" })] }));
      children.push(new Paragraph({ children: [new TextRun({ text: `${exp.company}${exp.city ? ` — ${exp.city}` : ""} | ${fmtDate(exp.startDate)} - ${exp.current ? "Atual" : fmtDate(exp.endDate)}`, size: 20, color: "777777", font: "Arial" })], spacing: { after: 60 } }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach(line => {
          children.push(new Paragraph({ children: [new TextRun({ text: `• ${line.replace(/^[-•]\s*/, "")}`, size: 20, color: "444444", font: "Arial" })], spacing: { after: 40 } }));
        });
      }
      children.push(emptyPara());
    });
  }

  if (education.length > 0) {
    children.push(sectionTitle("FORMAÇÃO"));
    education.forEach(edu => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${edu.degree}: ${edu.course}`, bold: true, size: 22, color: "222222", font: "Arial" }),
          new TextRun({ text: ` — ${edu.institution}`, size: 22, color: "777777", font: "Arial" }),
          new TextRun({ text: `  ${fmtDate(edu.startDate)} - ${edu.current ? "Cursando" : fmtDate(edu.endDate)}`, size: 18, color: "999999", font: "Arial" }),
        ],
        spacing: { after: 80 },
      }));
    });
  }

  if (courses.length > 0) {
    children.push(sectionTitle("CURSOS"));
    courses.forEach(c => {
      children.push(new Paragraph({ children: [new TextRun({ text: c.name, bold: true, size: 20, color: "222222", font: "Arial" }), new TextRun({ text: ` — ${c.institution}${c.year ? ` (${c.year})` : ""}`, size: 20, color: "666666", font: "Arial" })], spacing: { after: 60 } }));
    });
  }

  if (skills.length > 0) {
    children.push(sectionTitle("HABILIDADES"));
    children.push(new Paragraph({ children: skills.map(s => new TextRun({ text: `[${s.name}]  `, size: 20, color: "444444", font: "Arial" })) }));
  }

  if (languages.length > 0) {
    children.push(sectionTitle("IDIOMAS"));
    languages.forEach(l => children.push(new Paragraph({ children: [new TextRun({ text: `${l.name}`, bold: true, size: 20, color: "444444", font: "Arial" }), new TextRun({ text: ` — ${l.level}`, size: 20, color: "888888", font: "Arial" })], spacing: { after: 60 } })));
  }

  return new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
      children,
    }],
  });
}

// ── CREATIVE ──────────────────────────────────────────────────────────────────

function buildCreative(data: ResumeData): Document {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const primary = "6c3483";
  const accent  = "f39c12";
  const bg      = "fdf6ec";

  const sectionTitle = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: `● ${title}`, bold: true, size: 22, color: primary, font: "Arial" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: accent, space: 1 } },
      spacing: { before: 200, after: 100 },
    });

  const children: Paragraph[] = [
    // Barra colorida no topo
    new Paragraph({
      children: [new TextRun({ text: "", size: 8 })],
      shading: { fill: primary, type: ShadingType.CLEAR },
      border: { bottom: { style: BorderStyle.SINGLE, size: 16, color: accent, space: 0 } },
    }),
    // Header com fundo
    new Paragraph({
      children: [new TextRun({ text: personalInfo.fullName || "SEU NOME", bold: true, size: 40, color: primary, font: "Arial" })],
      shading: { fill: bg, type: ShadingType.CLEAR },
      spacing: { before: 200, after: 80 },
    }),
    new Paragraph({
      children: [
        ...(personalInfo.phone ? [new TextRun({ text: `☎ ${personalInfo.phone}   `, size: 18, color: primary, font: "Arial" })] : []),
        ...(personalInfo.email ? [new TextRun({ text: `✉ ${personalInfo.email}   `, size: 18, color: primary, font: "Arial" })] : []),
        ...((personalInfo.city || personalInfo.state) ? [new TextRun({ text: `⌖ ${[personalInfo.city, personalInfo.state].filter(Boolean).join(" - ")}   `, size: 18, color: primary, font: "Arial" })] : []),
        ...(personalInfo.linkedin ? [new TextRun({ text: `in ${personalInfo.linkedin}`, size: 18, color: primary, font: "Arial" })] : []),
      ],
      shading: { fill: bg, type: ShadingType.CLEAR },
      spacing: { after: 80 },
    }),
    ...(personalInfo.objective ? [new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 20, color: "555555", font: "Arial" })], shading: { fill: bg, type: ShadingType.CLEAR }, spacing: { after: 200 } })] : []),
  ];

  if (experience.length > 0) {
    children.push(sectionTitle("Experiência"));
    experience.forEach(exp => {
      children.push(new Paragraph({
        children: [new TextRun({ text: exp.position, bold: true, size: 22, color: primary, font: "Arial" })],
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: `${exp.company}${exp.city ? ` — ${exp.city}` : ""} | ${fmtDate(exp.startDate)} - ${exp.current ? "Atual" : fmtDate(exp.endDate)}`, size: 20, color: "777777", font: "Arial" })],
        border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } },
        spacing: { after: 60 },
      }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach(line => {
          children.push(new Paragraph({
            children: [new TextRun({ text: `▸ ${line.replace(/^[-•]\s*/, "")}`, size: 20, color: "444444", font: "Arial" })],
            border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } },
            spacing: { after: 40 },
          }));
        });
      }
      children.push(emptyPara());
    });
  }

  if (education.length > 0) {
    children.push(sectionTitle("Formação"));
    education.forEach(edu => {
      children.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree}: ${edu.course}`, bold: true, size: 22, color: primary, font: "Arial" })], border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } } }));
      children.push(new Paragraph({ children: [new TextRun({ text: `${edu.institution} | ${fmtDate(edu.startDate)} - ${edu.current ? "Cursando" : fmtDate(edu.endDate)}`, size: 20, color: "777777", font: "Arial" })], border: { left: { style: BorderStyle.SINGLE, size: 12, color: accent, space: 4 } }, spacing: { after: 80 } }));
    });
  }

  if (skills.length > 0) {
    children.push(sectionTitle("Habilidades"));
    skills.forEach(s => children.push(new Paragraph({ children: [new TextRun({ text: `• ${s.name}`, size: 20, color: "444444", font: "Arial" })], spacing: { after: 40 } })));
  }

  if (languages.length > 0) {
    children.push(sectionTitle("Idiomas"));
    languages.forEach(l => children.push(new Paragraph({ children: [new TextRun({ text: `${l.name}`, bold: true, size: 20, color: primary, font: "Arial" }), new TextRun({ text: ` — ${l.level}`, size: 20, color: "888888", font: "Arial" })], spacing: { after: 60 } })));
  }

  if (courses.length > 0) {
    children.push(sectionTitle("Cursos"));
    courses.forEach(c => {
      children.push(new Paragraph({ children: [new TextRun({ text: c.name, bold: true, size: 20, color: primary, font: "Arial" })], spacing: { after: 20 } }));
      children.push(new Paragraph({ children: [new TextRun({ text: `${c.institution}${c.year ? ` (${c.year})` : ""}`, size: 18, color: "888888", font: "Arial" })], spacing: { after: 80 } }));
    });
  }

  return new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 720, bottom: 1440, left: 1440, right: 1440 } } },
      children,
    }],
  });
}

// ── EXECUTIVE ─────────────────────────────────────────────────────────────────

function buildExecutive(data: ResumeData): Document {
  const { personalInfo, education, experience, courses, skills, languages } = data;
  const dark = "1a1a2e";
  const gold = "c9a84c";

  const sectionTitle = (title: string) =>
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 24, color: dark, font: "Arial" })],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: gold, space: 1 } },
      spacing: { before: 240, after: 120 },
    });

  const headerChildren = [
    new Paragraph({ children: [new TextRun({ text: (personalInfo.fullName || "SEU NOME").toUpperCase(), bold: true, size: 40, color: gold, font: "Arial" })] }),
    new Paragraph({
      children: [
        new TextRun({ text: [personalInfo.phone, personalInfo.email, [personalInfo.city, personalInfo.state].filter(Boolean).join(" - "), personalInfo.linkedin].filter(Boolean).join("   ·   "), size: 20, color: "CCCCCC", font: "Arial" }),
      ],
      spacing: { after: 0 },
    }),
  ];

  const bodyChildren: Paragraph[] = [];

  if (personalInfo.objective) {
    bodyChildren.push(sectionTitle("Perfil Profissional"), new Paragraph({ children: [new TextRun({ text: personalInfo.objective, size: 22, italics: true, color: "444444", font: "Arial" })], spacing: { after: 120 } }));
  }

  if (experience.length > 0) {
    bodyChildren.push(sectionTitle("Experiência Profissional"));
    experience.forEach(exp => {
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: exp.position, bold: true, size: 22, color: dark, font: "Arial" }), new TextRun({ text: `   ${fmtDate(exp.startDate)} — ${exp.current ? "Atual" : fmtDate(exp.endDate)}`, size: 18, color: "888888", font: "Arial" })] }));
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `${exp.company}${exp.city ? ` • ${exp.city}` : ""}`, size: 20, color: "666666", font: "Arial" })], spacing: { after: 60 } }));
      if (exp.description) {
        exp.description.split("\n").filter(Boolean).forEach(line => {
          bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `◆ ${line.replace(/^[-•]\s*/, "")}`, size: 20, color: "444444", font: "Arial" })], spacing: { after: 40 } }));
        });
      }
      bodyChildren.push(emptyPara());
    });
  }

  if (education.length > 0) {
    bodyChildren.push(sectionTitle("Formação Acadêmica"));
    education.forEach(edu => {
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `${edu.degree} — ${edu.course}`, bold: true, size: 22, color: dark, font: "Arial" }), new TextRun({ text: `   ${fmtDate(edu.startDate)} — ${edu.current ? "Cursando" : fmtDate(edu.endDate)}`, size: 18, color: "888888", font: "Arial" })] }));
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: edu.institution, size: 20, color: "666666", font: "Arial" })], spacing: { after: 80 } }));
    });
  }

  if (courses.length > 0) {
    bodyChildren.push(sectionTitle("Cursos e Certificações"));
    courses.forEach(c => {
      bodyChildren.push(new Paragraph({ children: [new TextRun({ text: c.name, bold: true, size: 20, color: dark, font: "Arial" }), new TextRun({ text: ` — ${c.institution}${c.year ? ` (${c.year})` : ""}`, size: 20, color: "444444", font: "Arial" })], spacing: { after: 60 } }));
    });
  }

  if (skills.length > 0) {
    bodyChildren.push(sectionTitle("Competências"));
    skills.forEach(s => bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `◆ ${s.name}`, size: 20, color: "444444", font: "Arial" })], spacing: { after: 40 } })));
  }

  if (languages.length > 0) {
    bodyChildren.push(sectionTitle("Idiomas"));
    languages.forEach(l => bodyChildren.push(new Paragraph({ children: [new TextRun({ text: `${l.name}`, bold: true, size: 20, color: dark, font: "Arial" }), new TextRun({ text: ` — ${l.level}`, size: 20, color: "888888", font: "Arial" })], spacing: { after: 60 } })));
  }

  return new Document({
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 0, bottom: 1440, left: 0, right: 0 } } },
      children: [
        // Header escuro
        new Table({
          width: { size: 11906, type: WidthType.DXA },
          columnWidths: [11906],
          rows: [new TableRow({ children: [new TableCell({ borders: noBorders, shading: { fill: dark, type: ShadingType.CLEAR }, margins: { top: 400, bottom: 200, left: 1440, right: 1440 }, children: headerChildren })] })],
        }),
        // Linha dourada
        new Paragraph({ children: [new TextRun("")], border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: gold, space: 0 } } }),
        // Body com margem
        ...bodyChildren.map(p => {
          // adiciona margem lateral ao body
          return p;
        }),
      ],
    }],
  });
}

// ── Export principal ──────────────────────────────────────────────────────────

export async function exportToDocx(data: ResumeData, template: TemplateStyle): Promise<void> {
  let doc: Document;

  switch (template) {
    case "modern":    doc = buildModern(data);    break;
    case "classic":   doc = buildClassic(data);   break;
    case "minimal":   doc = buildMinimal(data);   break;
    case "creative":  doc = buildCreative(data);  break;
    case "executive": doc = buildExecutive(data); break;
    default:          doc = buildClassic(data);
  }

  const buffer = await Packer.toBlob(doc);
  const name = data.personalInfo.fullName?.replace(/\s+/g, "-").toLowerCase() || "curriculo";
  saveAs(buffer, `curriculo-${name}.docx`);
}