import {
  Document, Packer, Paragraph, TextRun, ImageRun,
  AlignmentType, BorderStyle, TabStopType
} from 'docx';
import { saveAs } from 'file-saver';
import { RequerimentoData, ConjugeData } from '@/types/documents';

function buildConjugeTextReq(conjuge: ConjugeData, estadoCivil: string, regimeBens: string): TextRun[] {
  const isCasado = estadoCivil.toLowerCase().includes('casado') || estadoCivil.toLowerCase().includes('união estável');
  if (!isCasado || !conjuge.nome) return [];

  const parts: TextRun[] = [];
  if (regimeBens) {
    parts.push(new TextRun({ text: `, casados pelo regime de ${regimeBens}` }));
  }

  parts.push(new TextRun({ text: `, ele, ${conjuge.profissao || 'profissão não informada'}` }));
  if (conjuge.rg) parts.push(new TextRun({ text: `, portador(a) da C.I.R.G. n° ${conjuge.rg} ${conjuge.orgaoRg}` }));
  if (conjuge.cpf) parts.push(new TextRun({ text: ` e inscrito(a) no CPF/MF sob n° ${conjuge.cpf}` }));

  return parts;
}

function calcDiferenca(areaAtual: string, areaGeo: string): { texto: string; tipo: string } {
  const parseNum = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, ''));
  const atual = parseNum(areaAtual);
  const geo = parseNum(areaGeo);
  if (isNaN(atual) || isNaN(geo) || atual === 0) return { texto: '', tipo: '' };
  const diff = geo - atual;
  const absDiff = Math.abs(diff);
  const pct = ((absDiff / atual) * 100).toFixed(2).replace('.', ',');
  const formatted = absDiff.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const tipo = diff > 0 ? 'Acréscimo' : diff < 0 ? 'Decréscimo' : '';
  return { texto: `${formatted} m², que corresponde à ${pct}%`, tipo };
}

async function fetchLogoAsBuffer(): Promise<ArrayBuffer | null> {
  try {
    const response = await fetch('/templates/cabecalho-ri.png');
    if (!response.ok) return null;
    return await response.arrayBuffer();
  } catch {
    return null;
  }
}

function createDotLeaderRow(label: string, value: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { after: 60 },
    tabStops: [{ type: TabStopType.RIGHT, position: 9026 }],
    children: [
      new TextRun({ text: label }),
      new TextRun({ text: `\t${value}` }),
    ],
  });
}

export async function generateRequerimentoDocx(data: RequerimentoData) {
  const conjugeRuns = buildConjugeTextReq(data.conjuge, data.estadoCivil, data.regimeBens);
  const { texto: diferenca, tipo: tipoDiferenca } = calcDiferenca(data.areaAtual, data.areaGeorreferenciada);

  const logoBuffer = await fetchLogoAsBuffer();

  const headerChildren: Paragraph[] = [];

  // Logo image
  if (logoBuffer) {
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new ImageRun({
            type: 'png',
            data: logoBuffer,
            transformation: { width: 350, height: 100 },
            altText: { title: "Logo RI", description: "Registro de Imóveis", name: "logo-ri" },
          }),
        ],
      })
    );
  } else {
    // Fallback text header
    headerChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 40 },
        children: [new TextRun({ text: "REGISTRO DE IMÓVEIS", bold: true, size: 28 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: data.comarcaOficial || 'MARMELEIRO-PR', italics: true, size: 22 })],
      })
    );
  }

  // Nome do oficial
  headerChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({ text: `${data.nomeOficial || ''}`, size: 18 }),
        new TextRun({ text: ` - `, size: 18 }),
        new TextRun({ text: `${data.cargoOficial || 'REGISTRADORA OFICIAL'}`, bold: true, size: 18 }),
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
          ...headerChildren,

          // Barra cinza - Destinatário
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            border: {
              top: { style: BorderStyle.SINGLE, size: 1, color: "000000", space: 4 },
              bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000", space: 4 },
            },
            shading: { fill: "D9D9D9" },
            children: [
              new TextRun({
                text: `ILUSTRÍSSIMA SENHORA ${(data.cargoOficial || 'REGISTRADORA').toUpperCase()} DO REGISTRO DE IMÓVEIS DA COMARCA DE ${(data.comarcaOficial || '').toUpperCase()}.`,
                bold: true,
                size: 20,
              }),
            ],
          }),

          // Título
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: "REQUERIMENTO PARA GEORREFERENCIAMENTO", bold: true, size: 24, underline: {} }),
            ],
          }),

          // Corpo principal
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            indent: { firstLine: 720 },
            children: [
              new TextRun({ text: data.nomeRequerente, bold: true }),
              new TextRun({ text: `, ${data.nacionalidade}, ${data.estadoCivil}` }),
              ...conjugeRuns,
              new TextRun({ text: `, ${data.profissao}, portador(a) da C.I.R.G. n° ${data.rg} ${data.orgaoRg} e inscrito(a) no CPF/MF sob n° ${data.cpf}` }),
              ...(data.conjuge.nome ? [
                new TextRun({ text: `, ela, ${data.conjuge.nacionalidade || 'brasileira'}, ${data.conjuge.profissao || 'do lar'}` }),
                new TextRun({ text: data.conjuge.rg ? `, portadora da C.I.RG ${data.conjuge.rg} ${data.conjuge.orgaoRg}` : '' }),
                new TextRun({ text: data.conjuge.cpf ? ` e CPF: ${data.conjuge.cpf}` : '' }),
              ] : []),
              new TextRun({ text: `, residente${data.conjuge.nome ? 's' : ''} e domiciliado${data.conjuge.nome ? 's' : ''} na ${data.endereco}, nesta cidade e comarca.` }),
              new TextRun({ text: ` Vem perante Vossa Senhoria, ` }),
              new TextRun({ text: "requerer", bold: true }),
              new TextRun({ text: ` a averbação de memorial descritivo georreferenciado ao Sistema Geodésico Brasileiro/retificação de registro, na matrícula nº ` }),
              new TextRun({ text: data.matricula, bold: true }),
              new TextRun({ text: `, com área total de ${data.areaAtual}, do Livro ${data.livro || '02'}, de Registro Geral, deste Serviço de Registro de Imóveis` }),
              new TextRun({ text: data.codigoIncra ? `, Certificação no Incra sob o n° ${data.codigoIncra}` : '' }),
              new TextRun({ text: `, nos termos da Lei nº 10.267/2001, regulamentada pelos Decretos nº(s) 4.449/2002, 5.570/2005 e 7.620/2011.` }),
            ],
          }),

          // Declaração
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            indent: { firstLine: 720 },
            children: [
              new TextRun({ text: "Assim, declaro sob pena de responsabilidade civil e criminal, que não houve alteração das divisas e que foram respeitados os direitos dos confrontantes, nos termos do art. 212 e 213 da Lei 6.015/73, alterados pela Lei 10.931/2004 c/c art. 1.612 da Consolidação das Normas Gerais da Corregedoria-Geral da Justiça relativas ao Foro Extrajudicial - CNGCE - 2ª Edição." }),
            ],
          }),

          // Tabela de áreas com dot leaders
          new Paragraph({ spacing: { after: 60 }, children: [] }),
          createDotLeaderRow("Área atual do imóvel", data.areaAtual),
          createDotLeaderRow("Área após o georreferenciamento", data.areaGeorreferenciada),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: `Total de ${tipoDiferenca || 'Acréscimo/Decréscimo'} de área ${diferenca}` }),
            ],
          }),

          // Valor do imóvel
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            indent: { firstLine: 720 },
            children: [
              new TextRun({ text: `Declaro ainda, para os efeitos do art. 1.612 § 2º da Consolidação das Normas Gerais da Corregedoria-Geral da Justiça relativas ao Foro Extrajudicial - CNGCE - 2ª Edição que o imóvel tem o valor de R$ ${data.valorImovel}.` }),
            ],
          }),

          // Autorização encerramento matrícula
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200, line: 360 },
            indent: { firstLine: 720 },
            children: [
              new TextRun({ text: "Autorizo o encerramento da matrícula acima citada, procedendo-se a abertura de nova matrícula em decorrência do georreferenciamento, conforme memorial descritivo, mapa e ART apresentados para tanto, lavrando-se ainda as averbações necessárias." }),
            ],
          }),

          // Link SIGEF
          ...(data.linkSigef ? [
            new Paragraph({
              alignment: AlignmentType.JUSTIFIED,
              spacing: { after: 200, line: 360 },
              indent: { firstLine: 720 },
              children: [
                new TextRun({ text: "Informo que a parcela Certificada pelo INCRA referente ao imóvel citado encontra-se disponível para consulta no site do SIGEF, por meio do endereço eletrônico: " }),
                new TextRun({ text: data.linkSigef, color: "0563C1", underline: {} }),
              ],
            }),
          ] : []),

          // Nestes termos
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 60 },
            children: [new TextRun({ text: "Nestes termos," })],
          }),
          new Paragraph({
            alignment: AlignmentType.LEFT,
            spacing: { after: 400 },
            children: [new TextRun({ text: "Pede Deferimento." })],
          }),

          new Paragraph({ spacing: { after: 300 }, children: [] }),

          // Assinatura
          ...(data.nomeRepresentante ? [
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "___________________________________________" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: data.nomeRepresentante })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Representante Legal" })] }),
            new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `C.P.F. ${data.cpfRepresentante}`, size: 20 })] }),
            ...(data.rgRepresentante ? [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `R.G. ${data.rgRepresentante}`, size: 20 })] })] : []),
            ...(data.oabRepresentante ? [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: data.oabRepresentante, size: 20 })] })] : []),
          ] : [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: "___________________________________________" })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ text: data.nomeRequerente.toUpperCase(), bold: true })],
            }),
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 },
              children: [new TextRun({ text: `CPF: ${data.cpf}`, size: 20 })],
            }),
          ]),

          new Paragraph({ spacing: { after: 200 }, children: [] }),

          // Rodapé com dados do cartório
          ...(data.telefoneCartorio || data.emailCartorio ? [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 1, color: "000000", space: 4 } },
              spacing: { before: 200 },
              children: [
                new TextRun({ text: `TELEFONE: ${data.telefoneCartorio}`, bold: true, size: 18 }),
                new TextRun({ text: ` – `, size: 18 }),
                new TextRun({ text: `EMAIL: ${data.emailCartorio}`, bold: true, size: 18 }),
              ],
            }),
          ] : []),

          // Nota sobre reconhecimento de firma
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 60 },
            children: [
              new TextRun({ text: "* O requerimento deve conter reconhecimento de firma da assinatura do requerente (art. 506 do Código de Normas da CGJ/PR).", size: 16, italics: true }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Requerimento_${data.matricula || 'documento'}.docx`);
}
