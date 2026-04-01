import * as pdfjsLib from 'pdfjs-dist';
import type { MatriculaData } from '@/types/matricula';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
}

function findMatch(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) return match[1].trim();
  }
  return '';
}

function extractCpf(text: string): string {
  const match = text.match(/CPF[:\s]*(?:n[ºo°]?\s*)?(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2})/i);
  return match ? match[1] : '';
}

function extractRg(text: string): string {
  const match = text.match(/(?:RG|R\.G\.|cédula de identidade)[:\s]*(?:n[ºo°]?\s*)?([0-9][0-9.\-\/]+[0-9])/i);
  return match ? match[1] : '';
}

export function parseMatriculaText(text: string, fileName: string): Partial<MatriculaData> {
  const t = text.replace(/\s+/g, ' ');

  // Matrícula number
  const numMatricula = findMatch(t, [
    /matr[ií]cula\s*(?:n[ºo°]?\s*)?(\d+[\.\d]*)/i,
    /(?:sob\s*(?:o\s*)?n[ºo°]?\s*)(\d+[\.\d]*)/i,
  ]);

  // CPF - find all CPFs
  const cpfPattern = /CPF[:\s]*(?:n[ºo°]?\s*)?(\d{3}[.\s]?\d{3}[.\s]?\d{3}[-.\s]?\d{2})/gi;
  const cpfs: string[] = [];
  let cpfMatch;
  while ((cpfMatch = cpfPattern.exec(t)) !== null) {
    cpfs.push(cpfMatch[1]);
  }

  // RG - find all RGs
  const rgPattern = /(?:RG|R\.G\.|cédula de identidade)[:\s]*(?:n[ºo°]?\s*)?([0-9][0-9.\-\/]+[0-9])/gi;
  const rgs: string[] = [];
  let rgMatch;
  while ((rgMatch = rgPattern.exec(t)) !== null) {
    rgs.push(rgMatch[1]);
  }

  // Nome - typically appears before nationality or CPF
  const nome = findMatch(t, [
    /(?:propriet[aá]ri[oa]s?)[:\s]*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
    /(?:adquirentes?|outorgad[oa]s?)[:\s]*([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
    /(?:em\s+(?:favor|nome)\s+de)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
  ]);

  // Estado civil
  const estadoCivil = findMatch(t, [
    /(casad[oa]|solteir[oa]|divorciad[oa]|viúv[oa]|separad[oa]|uni[aã]o est[aá]vel)/i,
  ]).toLowerCase();

  // Nacionalidade
  const nacionalidade = findMatch(t, [
    /(brasileir[oa]|estrangeir[oa]|português|portuguesa)/i,
  ]).toLowerCase();

  // Profissão
  const profissao = findMatch(t, [
    /(?:profiss[aã]o|profissional)[:\s]*([^,;]+?)(?:,|;|\s+portador|\s+inscrit|\s+residente)/i,
    new RegExp(`(?:${estadoCivil || 'casad[oa]'})[,\\s]+([^,;]+?)(?:,|;|\\s+portador|\\s+inscrit|\\s+residente)`, 'i'),
  ]);

  // Endereço
  const endereco = findMatch(t, [
    /(?:residente|domiciliad[oa]|morador)[:\s]*(?:e domiciliad[oa])?\s*(?:na?[oa]?\s*)?(.+?)(?:,\s*(?:na cidade|no munic|CEP|nesta))/i,
  ]);

  // Município/Cidade
  const cidade = findMatch(t, [
    /(?:cidade|munic[ií]pio)\s+(?:de\s+)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç\s]+?)(?:\s*[-/]\s*[A-Z]{2}|,)/i,
  ]);

  // UF
  const uf = findMatch(t, [
    /(?:estado\s+(?:do?\s+)?|[-\/]\s*)([A-Z]{2})(?:\s|,|\.)/,
    /([A-Z]{2})(?:\s*,?\s*(?:CEP|Brasil))/,
  ]);

  // Comarca
  const comarca = findMatch(t, [
    /comarca\s+(?:de\s+)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç\s]+?)(?:\s*[-/]\s*[A-Z]{2}|,|\.|$)/i,
  ]);

  // Denominação do imóvel
  const denominacao = findMatch(t, [
    /(?:denominad[oa]|im[oó]vel)\s+(?:rural\s+)?(?:denominad[oa]\s+)?[""]?([^""",;]+?)[""]?(?:,|\s+com\s+[aá]rea|\s+situad|\s+matriculad)/i,
    /(?:lote|gleba|fazenda|s[ií]tio|ch[aá]cara)\s+([^,;]+?)(?:,|\s+com\s+[aá]rea|\s+situad|\s+matriculad)/i,
  ]);

  // Área
  const area = findMatch(t, [
    /[aá]rea\s+(?:total\s+)?(?:de\s+)?([\d.,]+\s*(?:m[²2]|ha|hectares?|alqueires?))/i,
    /([\d.,]+)\s*(?:m[²2]|ha|hectares?)/i,
  ]);

  // Registro
  const registro = findMatch(t, [
    /R[.-]?\s*(\d+)[\s-]*(?:matr|mat)/i,
    /registro\s*(?:n[ºo°]?\s*)?(\d+)/i,
  ]);

  // Livro
  const livro = findMatch(t, [
    /livro\s*(?:n[ºo°]?\s*)?(\d+[-\w]*)/i,
  ]);

  // Cônjuge - find the name after "casado(a) com"
  const nomeConjuge = findMatch(t, [
    /casad[oa]\s+(?:(?:sob o )?regime .+? com|com)\s+([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ\s]+?)(?:,|\s+(?:brasileiro|portador|inscrit|nascid))/i,
  ]);

  // Município do imóvel
  const municipioImovel = findMatch(t, [
    /(?:situad[oa]|localizad[oa])\s+(?:no?\s+)?(?:munic[ií]pio\s+(?:de\s+)?)?([A-ZÁÀÂÃÉÊÍÓÔÕÚÜÇ][a-záàâãéêíóôõúüç\s]+?)(?:\s*[-/]\s*[A-Z]{2}|,)/i,
  ]);

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
    endereco,
    cidade: cidade || municipioImovel,
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
    municipioImovel: municipioImovel || cidade,
    area,
    livro: livro || '02',
    textoCompleto: text,
  };
}
