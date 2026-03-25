import {
  Document, Packer, Paragraph, TextRun,
  AlignmentType
} from 'docx';
import { saveAs } from 'file-saver';
import { RequerimentoData, ConjugeData } from '@/types/documents';

function buildConjugeTextReq(conjuge: ConjugeData, estadoCivil: string): TextRun[] {
  const isCasado = estadoCivil.toLowerCase().includes('casado') || estadoCivil.toLowerCase().includes('união estável');
  if (!isCasado || !conjuge.nome) return [];
  const idParts: string[] = [];
  if (conjuge.rg) idParts.push(`RG nº ${conjuge.rg}`);
  if (conjuge.cpf) idParts.push(`CPF nº ${conjuge.cpf}`);
  return [
    new TextRun({ text: `, casado(a) com ` }),
    new TextRun({ text: conjuge.nome, bold: true }),
    new TextRun({ text: idParts.length ? `, ${idParts.join(', ')}` : '' }),
  ];
}

export async function generateRequerimentoDocx(data: RequerimentoData) {
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
              new TextRun({ text: "REQUERIMENTO", bold: true, size: 32 }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: `Ilmo.(a) Sr.(a) ${data.nomeOficial}` }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 300 },
            children: [
              new TextRun({ text: data.cartorios, italics: true }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: data.nomeRequerente, bold: true }),
              new TextRun({ text: `, ${data.nacionalidade}, ${data.estadoCivil}` }),
              ...buildConjugeTextReq(data.conjuge, data.estadoCivil),
              new TextRun({ text: `, ${data.profissao}, ` }),
              new TextRun({ text: `portador do RG nº ${data.rg} e inscrito no CPF nº ${data.cpf}, ` }),
              new TextRun({ text: `residente e domiciliado em ${data.endereco}, na Cidade de ${data.cidade}-${data.uf}, ` }),
              new TextRun({ text: "vem, respeitosamente, à presença de Vossa Senhoria " }),
              new TextRun({ text: "REQUERER", bold: true }),
              new TextRun({ text: ` a retificação administrativa do imóvel rural denominado ` }),
              new TextRun({ text: data.denominacaoImovel, bold: true }),
              new TextRun({ text: `, registrado sob a Matrícula nº ${data.matricula} do Registro de Imóveis da comarca de ${data.registro}` }),
              new TextRun({ text: data.codigoIncra ? `, cadastrado no INCRA sob o código nº ${data.codigoIncra}` : '' }),
              new TextRun({ text: `, nos termos do artigo 213, II da Lei nº 6.015/73, para fins de retificação de área, de acordo com o memorial descritivo e mapa apresentados.` }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: "Declara, sob as penas da lei, que as informações prestadas são a expressão da verdade e que o presente requerimento visa exclusivamente à adequação da descrição tabular do imóvel à sua realidade física, sem alteração de área ou confrontações." }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            children: [
              new TextRun({ text: "Nestes termos," }),
            ],
          }),

          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "Pede deferimento." }),
            ],
          }),

          new Paragraph({ spacing: { after: 200 }, children: [] }),

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
              new TextRun({ text: data.nomeRequerente.toUpperCase(), bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `CPF: ${data.cpf}`, size: 20 }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Requerimento_${data.matricula || 'documento'}.docx`);
}
