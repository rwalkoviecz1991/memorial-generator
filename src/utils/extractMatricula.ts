import * as pdfjsLib from 'pdfjs-dist';
import type { MatriculaData } from '@/types/matricula';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
    disableFontFace: false,
    verbosity: 0,
  }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent({ includeMarkedContent: false });
    const viewport = page.getViewport({ scale: 1.0 });

    // Sort items by vertical position (top to bottom), then horizontal (left to right)
    const items = (content.items as any[])
      .filter(item => item.str && item.str.trim() !== '')
      .map(item => ({
        str: item.str,
        x: item.transform[4],
        y: viewport.height - item.transform[5], // flip Y axis
        width: item.width,
        height: item.height || item.transform[0],
        fontName: item.fontName,
      }));

    // Group items into lines based on Y position (tolerance for same line)
    const lines: { y: number; items: typeof items }[] = [];
    const LINE_TOLERANCE = 3;

    for (const item of items) {
      const existingLine = lines.find(l => Math.abs(l.y - item.y) < LINE_TOLERANCE);
      if (existingLine) {
        existingLine.items.push(item);
      } else {
        lines.push({ y: item.y, items: [item] });
      }
    }

    // Sort lines top-to-bottom, items left-to-right within each line
    lines.sort((a, b) => a.y - b.y);
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x);
    }

    // Build text with smart spacing
    const pageLines: string[] = [];
    for (const line of lines) {
      let lineText = '';
      for (let j = 0; j < line.items.length; j++) {
        const item = line.items[j];
        if (j > 0) {
          const prev = line.items[j - 1];
          const gap = item.x - (prev.x + prev.width);
          // Add space if gap is significant
          if (gap > 2) {
            lineText += gap > 15 ? '   ' : ' ';
          }
        }
        lineText += item.str;
      }
      pageLines.push(lineText.trim());
    }

    fullText += pageLines.filter(l => l.length > 0).join('\n') + '\n\n';
  }

  return fullText.trim();
}

function findMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function findAllMatches(text: string, pattern: RegExp): string[] {
  const results: string[] = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    results.push(match[1].trim());
  }
  return results;
}

export function parseMatriculaText(text: string, fileName: string): Partial<MatriculaData> {
  const t = text.replace(/\s+/g, ' ');

  // ── Matrícula number ──
  const numMatricula = findMatch(t, [
    /matr[ií]cula\s*n[.ºo°]?\s*([\d.]+)/i,
    /REGISTRO\s*\*?\*?([\d.]+)\*?\*?/i,
    /(?:sob\s*(?:o\s*)?n[ºo°]?\s*)([\d.]+)/i,
  ]).replace(/\./g, '');

  // ── Comarca ──
  const comarca = findMatch(t, [
    /[Cc]omarca\s+(?:de\s+)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇa-záàâãéêíóôõúüç\s]+?)(?:\s*[-–]\s*[A-Z]{2})/,
    /[Cc]omarca\s+(?:de\s+)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇa-záàâãéêíóôõúüç\s]+?)(?:,|\.|$)/,
  ]);

  // ── Seção PROPRIETÁRIOS ──
  const propSection = t.match(/PROPRIET[AÁ]RIOS?:?\s*(.*?)(?:T[IÍ]TULO AQUISITIVO|Dou f[eé]|AV-\d|R-\d|$)/is);
  const propText = propSection ? propSection[1] : '';

  // ── Nome proprietário ──
  // Pattern: "PROPRIETÁRIOS: NOME COMPLETO, e sua mulher..." or "PROPRIETÁRIOS: NOME, brasileiro..."
  let nome = '';
  if (propText) {
    const nomeMatch = propText.match(/^\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,\s*e\s+su[ao]\s+(?:mulher|esposa?|marido)|,\s*(?:brasileiro|brasileira|solteiro|solteira|casado|casada|divorciado|divorciada|viúvo|viúva|portador|inscrit))/i);
    if (nomeMatch) {
      nome = nomeMatch[1].trim();
    }
  }
  if (!nome) {
    nome = findMatch(t, [
      /PROPRIET[AÁ]RIOS?:?\s*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
      /(?:adquirentes?|outorgad[oa]s?)[:\s]*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
    ]);
  }

  // ── Cônjuge ──
  let nomeConjuge = '';
  if (propText) {
    const conjugeMatch = propText.match(/(?:su[ao]\s+(?:mulher|esposa?|marido|companheira?|companheiro))\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s*casad)/i);
    if (conjugeMatch) {
      nomeConjuge = conjugeMatch[1].trim();
    }
  }
  if (!nomeConjuge) {
    nomeConjuge = findMatch(t, [
      /casad[oa]s?\s+(?:(?:sob\s+o\s+|pelo\s+)?regime\s+.+?\s+com|com)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
    ]);
  }

  // ── Estado civil ──
  const estadoCivil = findMatch(propText || t, [
    /(casad[oa]s?|solteir[oa]|divorciad[oa]|viúv[oa]|separad[oa]|uni[aã]o\s*est[aá]vel)/i,
  ]).toLowerCase().replace(/s$/, ''); // normalize "casados" -> "casado"

  // ── Nacionalidade ──
  const nacionalidade = findMatch(propText || t, [
    /(?:ele|ela)?,?\s*(brasileir[oa])/i,
    /(brasileir[oa]|estrangeir[oa]|português|portuguesa)/i,
  ]).toLowerCase();

  // ── Profissão ── (after nationality or estado civil, before "portador")
  let profissao = '';
  if (propText) {
    const profMatch = propText.match(/(?:brasileir[oa]|nacionalidade\s+\w+),?\s+([a-záàâãéêíóôõúüç][a-záàâãéêíóôõúüç\s]+?)(?:,|\s+portador|\s+inscrit|\s+residente)/i);
    if (profMatch) profissao = profMatch[1].trim();
  }
  if (!profissao) {
    profissao = findMatch(propText || t, [
      /(?:profiss[aã]o|profissional)[:\s]*([^,;]+?)(?:,|;|\s+portador|\s+inscrit|\s+residente)/i,
    ]);
  }

  // ── CPF - find all (supports CPF/MF, CPF, C.P.F.) ──
  const cpfs = findAllMatches(t, /(?:CPF|C\.P\.F|CPF\/MF)\s*(?:sob\s+)?(?:n[ºo°.]?\s*)?(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2})/gi);

  // ── RG / C.R.C. / Cédula / CI ──
  const rgs = findAllMatches(t, /(?:RG|R\.G\.|C\.R\.C\.|C\.I\.|cédula\s+de\s+identidade|carteira\s+de\s+identidade)\s*(?:n[ºo°.]?\s*)?([0-9][0-9.\-\/\s]+[0-9])(?:\s*[-–]\s*[A-Z]{2})?/gi);

  // ── Endereço / Domicílio ──
  const endereco = findMatch(propText || t, [
    /(?:residente|domiciliad)[oa]s?\s*(?:e\s+domiciliad[oa]s?)?\s*(?:,?\s*em|,?\s*na?[oa]?\s+)(.+?)(?:[-–]\s*[A-Z]{2}|,\s*(?:CEP|nesta|Estado)|\.\s)/i,
  ]);

  // ── Município do proprietário (residência) ──
  const cidade = findMatch(propText || t, [
    /(?:residente|domiciliad)[oa]s?.*?(?:em|na?)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-Za-záàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:\s*[-–]\s*[A-Z]{2})/i,
  ]);

  // ── UF ──
  const uf = findMatch(propText || t, [
    /(?:residente|domiciliad).*?[-–]\s*([A-Z]{2})/i,
    /Estado\s+(?:do?\s+)?(?:Paran[aá]|[A-Z][a-z]+)\s*[-–]?\s*([A-Z]{2})/i,
  ]);

  // ── Seção IMÓVEL ──
  const imovelSection = t.match(/IM[OÓ]VEL\s+RURAL:?\s*(.*?)(?:PROPRIET[AÁ]RIOS?|$)/is);
  const imovelText = imovelSection ? imovelSection[1] : t;

  // ── Denominação do imóvel ──
  const denominacao = findMatch(imovelText, [
    /(?:Lote\s+n[.ºo°]?\s*\d+.*?(?:do\s+)?(?:Im[oó]vel|Gleba))\s+([^,]+?)(?:,\s+no\s+Munic)/i,
    /(?:denominad[oa])\s+[""]?([^""",;]+?)[""]?(?:,|\s+com\s+[aá]rea|\s+situad)/i,
    /(?:Im[oó]vel)\s+([^,]+?)(?:,\s+no\s+Munic)/i,
    /(?:Lote|Gleba|Fazenda|S[ií]tio|Ch[aá]cara)\s+(.+?)(?:,\s+(?:no|com)\s)/i,
  ]);

  // ── Município do imóvel ──
  const municipioImovel = findMatch(imovelText, [
    /Munic[ií]pio\s+(?:de\s+)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-Za-záàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:\s*[-–]\s*[A-Z]{2})/i,
    /(?:situad[oa]|localizad[oa])\s+.*?(?:Munic[ií]pio\s+(?:de\s+)?)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-Za-záàâãéêíóôõúüçÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:\s*[-–]\s*[A-Z]{2})/i,
  ]);

  // ── Área ──
  const area = findMatch(imovelText || t, [
    /[aá]rea\s+(?:total\s+)?(?:de\s+)?\*?\*?([\d.,]+\s*m[²2])\*?\*?/i,
    /([\d.,]+\s*m[²2])/i,
    /[aá]rea\s+(?:total\s+)?(?:de\s+)?([\d.,]+\s*(?:ha|hectares?))/i,
  ]);

  // ── Registro (R-XX) ──
  const registro = findMatch(t, [
    /R[.-]?\s*(\d+)[\s-]*(?:matr|mat|[-–])/i,
    /registro\s*(?:n[ºo°]?\s*)?(\d+)/i,
    /REGISTRO\s*\*?\*?([\d.]+)\*?\*?/i,
  ]);

  // ── Livro ──
  const livro = findMatch(t, [
    /[Ll]ivro\s*(?:n[ºo°]?\s*)?(\d+[-\w]*)/i,
  ]);

  // ── Descrição completa do imóvel (para referência) ──
  let descricaoImovel = '';
  if (imovelSection) {
    descricaoImovel = imovelSection[1].trim().substring(0, 500);
  }

  const id = crypto.randomUUID();
  const label = `Matrícula ${numMatricula || '?'} - ${nome || fileName}`;

  return {
    id,
    label,
    fileName,
    nomeProprietario: nome,
    nacionalidade: nacionalidade || 'brasileiro(a)',
    estadoCivil: estadoCivil || '',
    profissao,
    rg: rgs[0] || '',
    cpf: cpfs[0] || '',
    endereco: endereco || cidade || '',
    cidade: cidade || municipioImovel || '',
    uf: uf || 'PR',
    nomeConjuge,
    cpfConjuge: cpfs[1] || '',
    rgConjuge: rgs[1] || '',
    profissaoConjuge: '',
    nacionalidadeConjuge: nacionalidade || 'brasileiro(a)',
    denominacaoImovel: denominacao,
    numeroMatricula: numMatricula,
    registro,
    comarca,
    municipioImovel: municipioImovel || cidade || '',
    area,
    livro: livro || '02',
    textoCompleto: text,
  };
}
