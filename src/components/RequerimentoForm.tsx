import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConjugeFields } from './ConjugeFields';
import { RequerimentoData, emptyConjuge } from '@/types/documents';
import { generateRequerimentoDocx } from '@/utils/generateRequerimento';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

const initialData: RequerimentoData = {
  nomeRequerente: '', nacionalidade: 'brasileiro(a)', estadoCivil: 'solteiro(a)',
  regimeBens: '', profissao: '', rg: '', orgaoRg: 'SSP-PR', cpf: '',
  endereco: '', cidade: '', uf: 'PR',
  conjuge: { ...emptyConjuge },
  denominacaoImovel: '', matricula: '', livro: '02', registro: '', comarca: '',
  codigoIncra: '', areaAtual: '', areaGeorreferenciada: '', valorImovel: '', linkSigef: '',
  nomeOficial: '', cargoOficial: 'REGISTRADORA', comarcaOficial: '',
  nomeRepresentante: '', cpfRepresentante: '', rgRepresentante: '', oabRepresentante: '',
  telefoneCartorio: '', emailCartorio: '',
  localData: '', dataDocumento: '',
};

function Field({ label, value, onChange, className, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; className?: string; placeholder?: string;
}) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="mt-1" />
    </div>
  );
}

export function RequerimentoForm() {
  const [data, setData] = useState<RequerimentoData>(initialData);

  const update = (field: keyof RequerimentoData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleEstadoCivilChange = (value: string) => {
    update('estadoCivil', value);
    const isCasado = value.toLowerCase().includes('casado') || value.toLowerCase().includes('união estável');
    if (!isCasado) update('conjuge', { ...emptyConjuge });
  };

  const handleGenerate = async () => {
    if (!data.nomeRequerente || !data.cpf) {
      toast.error('Preencha ao menos o nome e CPF do requerente.');
      return;
    }
    try {
      await generateRequerimentoDocx(data);
      toast.success('Requerimento gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar documento.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Destinatário (Cartório)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome do(a) Oficial" value={data.nomeOficial} onChange={v => update('nomeOficial', v)} placeholder="BIANCA MAIA DE BRITTO" />
          <Field label="Cargo" value={data.cargoOficial} onChange={v => update('cargoOficial', v)} placeholder="REGISTRADORA" />
          <Field label="Comarca" value={data.comarcaOficial} onChange={v => update('comarcaOficial', v)} placeholder="FRANCISCO BELTRÃO/PR" />
          <Field label="Telefone do Cartório" value={data.telefoneCartorio} onChange={v => update('telefoneCartorio', v)} placeholder="(46) 3525-1865" />
          <Field label="Email do Cartório" value={data.emailCartorio} onChange={v => update('emailCartorio', v)} placeholder="cartoriomarmeleiro@gmail.com" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados do Requerente</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome completo" value={data.nomeRequerente} onChange={v => update('nomeRequerente', v)} className="md:col-span-2" />
          <Field label="Nacionalidade" value={data.nacionalidade} onChange={v => update('nacionalidade', v)} />
          
          <ConjugeFields
            estadoCivil={data.estadoCivil}
            conjuge={data.conjuge}
            onEstadoCivilChange={handleEstadoCivilChange}
            onConjugeChange={c => update('conjuge', c)}
          />

          <Field label="Regime de bens" value={data.regimeBens} onChange={v => update('regimeBens', v)} placeholder="comunhão universal de bens" />
          <Field label="Profissão" value={data.profissao} onChange={v => update('profissao', v)} />
          <Field label="RG" value={data.rg} onChange={v => update('rg', v)} />
          <Field label="Órgão RG" value={data.orgaoRg} onChange={v => update('orgaoRg', v)} />
          <Field label="CPF" value={data.cpf} onChange={v => update('cpf', v)} />
          <Field label="Endereço" value={data.endereco} onChange={v => update('endereco', v)} className="md:col-span-2" />
          <Field label="Cidade" value={data.cidade} onChange={v => update('cidade', v)} />
          <Field label="UF" value={data.uf} onChange={v => update('uf', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados do Imóvel</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Denominação (Lote/Gleba)" value={data.denominacaoImovel} onChange={v => update('denominacaoImovel', v)} className="md:col-span-2" />
          <Field label="Matrícula nº" value={data.matricula} onChange={v => update('matricula', v)} />
          <Field label="Livro" value={data.livro} onChange={v => update('livro', v)} placeholder="02" />
          <Field label="Registro de Imóveis / Comarca" value={data.registro} onChange={v => update('registro', v)} />
          <Field label="Comarca" value={data.comarca} onChange={v => update('comarca', v)} />
          <Field label="Código INCRA (Certificação)" value={data.codigoIncra} onChange={v => update('codigoIncra', v)} />
          <Field label="Área atual do imóvel (m²)" value={data.areaAtual} onChange={v => update('areaAtual', v)} placeholder="211.936,00 m²" />
          <Field label="Área após georreferenciamento (m²)" value={data.areaGeorreferenciada} onChange={v => update('areaGeorreferenciada', v)} placeholder="212.240,00 m²" />
          <Field label="Valor do imóvel (R$)" value={data.valorImovel} onChange={v => update('valorImovel', v)} placeholder="1.421.654,19" />
          <Field label="Link SIGEF (autenticidade)" value={data.linkSigef} onChange={v => update('linkSigef', v)} className="md:col-span-3" placeholder="http://sigef.incra.gov.br/autenticidade/..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Representante Legal (opcional)</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome" value={data.nomeRepresentante} onChange={v => update('nomeRepresentante', v)} />
          <Field label="CPF" value={data.cpfRepresentante} onChange={v => update('cpfRepresentante', v)} />
          <Field label="RG" value={data.rgRepresentante} onChange={v => update('rgRepresentante', v)} />
          <Field label="OAB" value={data.oabRepresentante} onChange={v => update('oabRepresentante', v)} placeholder="104.795-O.A.B.- P.R." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Local e Data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Local" value={data.localData} onChange={v => update('localData', v)} placeholder="Marmeleiro/PR" />
          <Field label="Data" value={data.dataDocumento} onChange={v => update('dataDocumento', v)} placeholder="24 de março de 2026" />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="lg" onClick={handleGenerate} className="gap-2">
          <FileDown className="h-5 w-5" />
          Gerar Requerimento (DOCX)
        </Button>
      </div>
    </div>
  );
}
