import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, HeadingLevel
} from 'docx';
import { saveAs } from 'file-saver';
import { AnuenciaData } from '@/types/documents';

const cellBorder = { style: BorderStyle.SINGLE, size: 1, color: "000000" };
const cellBorders = { top: cellBorder, bottom: cellBorder, left: cellBorder, right: cellBorder };

export async function generateAnuenciaDocx(data: AnuenciaData) {
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
        document: {
          run: { font: "Arial", size: 22 },
        },
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
          // Título
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "DECLARAÇÃO DE ANUÊNCIA DE CONFRONTANTE",
                bold: true,
                size: 28,
                font: "Arial",
              }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),

          // Corpo do texto
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: data.nome, bold: true }),
              new TextRun({ text: `, ${data.nacionalidade}, ${data.estadoCivil}, ${data.uniaoEstavel}, ${data.profissao}, portador da C.I.RG n° ` }),
              new TextRun({ text: `${data.rg} ${data.orgaoRg}` }),
              new TextRun({ text: data.cnh ? `, da Carteira Nacional de Habilitação n° ${data.cnh} ${data.orgaoCnh}` : '' }),
              new TextRun({ text: ` e inscrito no CPF n° ${data.cpf}` }),
              new TextRun({ text: `, residente e domiciliado na ${data.endereco}, Bairro ${data.bairro}, na Cidade de ${data.cidade}-${data.uf}. ` }),
              new TextRun({ text: `Proprietário do imóvel rural denominado ${data.denominacaoConfrontante}, Matrícula nº ${data.matriculaConfrontante} do Registro de Imóveis da comarca de ${data.registroConfrontante}, ` }),
              new TextRun({ text: `na qualidade de ` }),
              new TextRun({ text: "CONFRONTANTE", bold: true }),
              new TextRun({ text: ` do imóvel rural denominado ${data.denominacaoRetificando}, Matrícula nº ${data.matriculaRetificando} do Registro de Imóveis da comarca de ${data.registroRetificando}, ` }),
              new TextRun({ text: `cadastrado no INCRA sob o código nº ${data.codigoIncra}, declaro, para todos os efeitos legais, que analisamos os mapa(s) e memorial(is) descritivo(s) do processo de retificação administrativa e/ou georreferenciamento do referido imóvel, elaborados pelo profissional técnico ` }),
              new TextRun({ text: data.nomeProfissional, bold: true }),
              new TextRun({ text: ` ${data.tipoProfissional} nº ${data.registroProfissional}` }),
              new TextRun({ text: `, e que foram respeitados os limites de "divisas in loco" entre aquele e o imóvel de minha propriedade, não havendo qualquer litígio entre as partes, razão pela qual dou minha anuência, nos termos do artigo 213, II da Lei n.º 6.015/73, sendo que a minha anuência supre de coproprietário(s) e/ou cônjuge(s), nos termos do art. 213, § 10º, I da Lei nº 6.015/73.` }),
            ],
          }),

          new Paragraph({
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({
                text: "O trecho confrontante para o qual confiro minha anuência possui os seguintes elementos técnicos:",
                bold: true,
              }),
            ],
          }),

          // Tabela de vértices
          new Table({
            width: { size: 9560, type: WidthType.DXA },
            columnWidths: [1400, 1400, 1400, 960, 1400, 1000, 1000],
            rows: [
              // Header row 1
              new TableRow({
                children: [
                  createHeaderCell("Sistema Geodésico de Referência (SGR): SIRGAS2000", 9560, 7, headerBg),
                ],
              }),
              // Header row 2
              new TableRow({
                children: [
                  createHeaderCell("VÉRTICE ESTAÇÃO", 5160, 4, headerBg),
                  createHeaderCell("VÉRTICE VANTE", 4400, 3, headerBg),
                ],
              }),
              // Header row 3
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

          // Local e data
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
            children: [
              new TextRun({ text: `${data.localData}, ${data.dataDocumento}.` }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),

          // Assinaturas
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Confrontante:___________________________________________________________" }),
            ],
          }),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: "Credenciado como testemunha:____________________________________________" }),
            ],
          }),

          new Paragraph({ spacing: { after: 100 }, children: [] }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: data.nomeProfissional.toUpperCase(), bold: true, size: 20 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: data.tipoProfissional?.toUpperCase() || "TÉCNICO EM AGRIMENSURA", size: 18 }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: `${data.tipoProfissional}: ${data.registroProfissional}`, size: 18 }),
            ],
          }),
          ...(data.trt ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: `TRT nº ${data.trt}`, size: 18 }),
              ],
            }),
          ] : []),
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
  saveAs(blob, `Anuencia_${data.matriculaRetificando || 'documento'}.docx`);
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
