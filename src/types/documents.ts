export interface Vertice {
  id: string;
  codigoEstacao: string;
  longitude: string;
  latitude: string;
  altitude: string;
  codigoVante: string;
  azimute: string;
  distancia: string;
}

export interface ConjugeData {
  nome: string;
  nacionalidade: string;
  profissao: string;
  rg: string;
  orgaoRg: string;
  cpf: string;
  cnh: string;
  orgaoCnh: string;
}

export const emptyConjuge: ConjugeData = {
  nome: '', nacionalidade: 'brasileiro(a)', profissao: '',
  rg: '', orgaoRg: 'SSP-PR', cpf: '', cnh: '', orgaoCnh: 'DETRAN-PR',
};

export interface AnuenciaData {
  // Confrontante
  nome: string;
  nacionalidade: string;
  estadoCivil: string;
  uniaoEstavel: string;
  profissao: string;
  rg: string;
  orgaoRg: string;
  cnh: string;
  orgaoCnh: string;
  cpf: string;
  endereco: string;
  bairro: string;
  cidade: string;
  uf: string;

  // Cônjuge
  conjuge: ConjugeData;

  // Imóvel do confrontante
  denominacaoConfrontante: string;
  matriculaConfrontante: string;
  registroConfrontante: string;

  // Imóvel retificando
  denominacaoRetificando: string;
  matriculaRetificando: string;
  codigoIncra: string;
  registroRetificando: string;

  // Profissional
  nomeProfissional: string;
  registroProfissional: string;
  tipoProfissional: string;

  // Vértices
  vertices: Vertice[];

  // Local e data
  localData: string;
  dataDocumento: string;

  // Credenciamento
  credenciamento: string;
  trt: string;
}

export interface MemorialData {
  // Proprietário
  nomeProprietario: string;
  cpfProprietario: string;
  rgProprietario: string;
  estadoCivil: string;

  // Cônjuge
  conjuge: ConjugeData;

  // Imóvel
  denominacaoImovel: string;
  municipio: string;
  uf: string;
  matricula: string;
  registro: string;
  codigoIncra: string;
  areaTotal: string;
  perimetroTotal: string;

  // Vértices
  vertices: Vertice[];

  // Profissional
  nomeProfissional: string;
  registroProfissional: string;
  tipoProfissional: string;
  credenciamento: string;
  trt: string;

  // Data
  localData: string;
  dataDocumento: string;
}

export interface RequerimentoData {
  // Requerente
  nomeRequerente: string;
  nacionalidade: string;
  estadoCivil: string;
  regimeBens: string;
  profissao: string;
  rg: string;
  orgaoRg: string;
  cpf: string;
  endereco: string;
  cidade: string;
  uf: string;

  // Cônjuge
  conjuge: ConjugeData;

  // Imóvel
  denominacaoImovel: string;
  matricula: string;
  livro: string;
  registro: string;
  comarca: string;
  codigoIncra: string;
  areaAtual: string;
  areaGeorreferenciada: string;
  valorImovel: string;
  linkSigef: string;

  // Destinatário
  nomeOficial: string;
  cargoOficial: string;
  comarcaOficial: string;

  // Representante Legal
  nomeRepresentante: string;
  cpfRepresentante: string;
  rgRepresentante: string;
  oabRepresentante: string;

  // Rodapé cartório
  telefoneCartorio: string;
  emailCartorio: string;

  // Data
  localData: string;
  dataDocumento: string;
}
