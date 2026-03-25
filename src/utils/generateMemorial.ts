import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType
} from 'docx';
import { saveAs } from 'file-saver';
import { MemorialData, ConjugeData } from '@/types/documents';

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

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

export async function generateMemorialDocx(data: MemorialData) {
  const headerBg = "1B5E20";

  const verticeRows = data.vertices.map((v) =>
    new TableRow({
      children: [
        createCell(v.codigoEstacao, 1400),
        createCell(v.longitude, 1400),
        createCell(v.latitude, 1400),
        createCell(v.altitude, 960),
        createCell(v.codigoVante, 1400),
        createCell(v.azimute, 1000),
        createCell(v.distancia, 1000),
      ],
    })
  );

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
            margin: { top: 1440, right: 1080, bottom: 1440, left: 1080 },
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

          // Tabela
          new Table({
            width: { size: 9560, type: WidthType.DXA },
            columnWidths: [1400, 1400, 1400, 960, 1400, 1000, 1000],
            rows: [
              new TableRow({
                children: [
                  createHeaderCell("Sistema Geodésico de Referência (SGR): SIRGAS2000", 9560, 7, headerBg),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell("VÉRTICE ESTAÇÃO", 5160, 4, headerBg),
                  createHeaderCell("VÉRTICE VANTE", 4400, 3, headerBg),
                ],
              }),
              new TableRow({
                children: [
                  createHeaderCell("Código (Vértice)", 1400, 1, headerBg),
                  createHeaderCell("Longitude", 1400, 1, headerBg),
                  createHeaderCell("Latitude", 1400, 1, headerBg),
                  createHeaderCell("Altitude", 960, 1, headerBg),
                  createHeaderCell("Código (Vértice)", 1400, 1, headerBg),
                  createHeaderCell("Azimute SGL", 1000, 1, headerBg),
                  createHeaderCell("Distância (m)", 1000, 1, headerBg),
                ],
              }),
              ...verticeRows,
            ],
          }),

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

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Memorial_${data.matricula || 'documento'}.docx`);
}

function createCell(text: string, width: number): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: text || '', size: 18 })],
      }),
    ],
  });
}

function createHeaderCell(text: string, width: number, columnSpan: number, bgColor: string): TableCell {
  return new TableCell({
    borders: cellBorders,
    width: { size: width, type: WidthType.DXA },
    columnSpan,
    shading: { fill: bgColor, type: ShadingType.CLEAR },
    margins: { top: 40, bottom: 40, left: 60, right: 60 },
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text, bold: true, size: 18, color: "FFFFFF", font: "Arial" })],
      }),
    ],
  });
}
