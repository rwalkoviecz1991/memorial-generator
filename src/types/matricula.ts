export interface MatriculaData {
  id: string;
  label: string; // e.g. "Matrícula 12345 - João Silva"
  fileName: string;

  // Proprietário
  nomeProprietario: string;
  nacionalidade: string;
  estadoCivil: string;
  profissao: string;
  rg: string;
  cpf: string;
  endereco: string;
  cidade: string;
  uf: string;

  // Cônjuge
  nomeConjuge: string;
  cpfConjuge: string;
  rgConjuge: string;
  profissaoConjuge: string;
  nacionalidadeConjuge: string;

  // Imóvel
  denominacaoImovel: string;
  numeroMatricula: string;
  registro: string;
  comarca: string;
  municipioImovel: string;
  area: string;
  livro: string;

  // Texto bruto para referência
  textoCompleto: string;
}

export const emptyMatricula: MatriculaData = {
  id: '',
  label: '',
  fileName: '',
  nomeProprietario: '', nacionalidade: '', estadoCivil: '', profissao: '',
  rg: '', cpf: '', endereco: '', cidade: '', uf: '',
  nomeConjuge: '', cpfConjuge: '', rgConjuge: '', profissaoConjuge: '', nacionalidadeConjuge: '',
  denominacaoImovel: '', numeroMatricula: '', registro: '', comarca: '', municipioImovel: '',
  area: '', livro: '',
  textoCompleto: '',
};
