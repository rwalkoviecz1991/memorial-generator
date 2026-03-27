import {
  Document, Paragraph, TextRun, AlignmentType
} from 'docx';
import { MemorialData, ConjugeData } from '@/types/documents';
import { generateWithTemplate, createVerticeTable } from './templateUtils';

function buildConjugeTextMemorial(conjuge: ConjugeData, estadoCivil: string): TextRun[] {
  const isCasado = estadoCivil.toLowerCase().includes('casado') || estadoCivil.toLowerCase().includes('união estável');
  if (!isCasado || !conjuge.nome) return [];
  const idParts: string[] = [];
  if (conjuge.cpf) idParts.push(`CPF nº ${conjuge.cpf}`);
  if (conjuge.rg) idParts.push(`RG nº ${conjuge.rg}`);
  return [
    new TextRun({ text: ` e seu cônjuge ` }),
    new TextRun({ text: conjuge.nome, bold: true }),
    new TextRun({ text: idParts.length ? `, ${idParts.join(', ')}` : '' }),
  ];
}

export async function generateMemorialDocx(data: MemorialData) {
  const headerBg = "1B5E20";

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Arial", size: 22 } },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 2200, right: 1080, bottom: 1440, left: 1080 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: "MEMORIAL DESCRITIVO", bold: true, size: 32 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: "Imóvel rural denominado " }),
              new TextRun({ text: data.denominacaoImovel, bold: true }),
              new TextRun({ text: `, situado no município de ${data.municipio}/${data.uf}, ` }),
              new TextRun({ text: `registrado sob a Matrícula nº ${data.matricula} do Registro de Imóveis da comarca de ${data.registro}` }),
              new TextRun({ text: data.codigoIncra ? `, cadastrado no INCRA sob o código nº ${data.codigoIncra}` : '' }),
              new TextRun({ text: `, de propriedade de ` }),
              new TextRun({ text: data.nomeProprietario, bold: true }),
              new TextRun({ text: `, CPF nº ${data.cpfProprietario}` }),
              new TextRun({ text: data.rgProprietario ? `, RG nº ${data.rgProprietario}` : '' }),
              ...buildConjugeTextMemorial(data.conjuge, data.estadoCivil),
              new TextRun({ text: "." }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: `O imóvel possui área total de ` }),
              new TextRun({ text: data.areaTotal, bold: true }),
              new TextRun({ text: ` e perímetro total de ` }),
              new TextRun({ text: data.perimetroTotal, bold: true }),
              new TextRun({ text: ", conforme levantamento topográfico georreferenciado ao Sistema Geodésico Brasileiro, descrito pelos seguintes vértices e suas respectivas coordenadas:" }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),

          createVerticeTable(data.vertices, headerBg),

          new Paragraph({ spacing: { after: 400 }, children: [] }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: `${data.localData}, ${data.dataDocumento}.` }),
            ],
          }),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "___________________________________________" }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: data.nomeProfissional.toUpperCase(), bold: true, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${data.tipoProfissional}: ${data.registroProfissional}`, size: 18 }),
            ],
          }),
          ...(data.credenciamento ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `Credenciamento INCRA: ${data.credenciamento}`, size: 18 }),
              ],
            }),
          ] : []),
        ],
      },
    ],
  });

  await generateWithTemplate(doc, `Memorial_${data.matricula || 'documento'}.docx`);
}
