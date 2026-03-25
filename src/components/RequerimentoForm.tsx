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
  profissao: '', rg: '', cpf: '', endereco: '', cidade: '', uf: 'PR',
  conjuge: { ...emptyConjuge },
  denominacaoImovel: '', matricula: '', registro: '', comarca: '', codigoIncra: '',
  nomeOficial: '', cartorios: '',
  nomeProfissional: '', registroProfissional: '',
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
    if (!isCasado) {
      update('conjuge', { ...emptyConjuge });
    }
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
        <CardHeader><CardTitle className="text-base">Destinatário</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome do Oficial" value={data.nomeOficial} onChange={v => update('nomeOficial', v)} placeholder="Dr.(a) Nome do Oficial" />
          <Field label="Cartório / Registro de Imóveis" value={data.cartorios} onChange={v => update('cartorios', v)} placeholder="Registro de Imóveis da Comarca de..." />
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

          <Field label="Profissão" value={data.profissao} onChange={v => update('profissao', v)} />
          <Field label="RG" value={data.rg} onChange={v => update('rg', v)} />
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
          <Field label="Registro de Imóveis / Comarca" value={data.registro} onChange={v => update('registro', v)} />
          <Field label="Comarca" value={data.comarca} onChange={v => update('comarca', v)} />
          <Field label="Código INCRA" value={data.codigoIncra} onChange={v => update('codigoIncra', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Profissional Técnico</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Nome" value={data.nomeProfissional} onChange={v => update('nomeProfissional', v)} />
          <Field label="Nº Registro" value={data.registroProfissional} onChange={v => update('registroProfissional', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Local e Data</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Local" value={data.localData} onChange={v => update('localData', v)} placeholder="Marmeleiro/PR" />
          <Field label="Data" value={data.dataDocumento} onChange={v => update('dataDocumento', v)} placeholder="24 de março 2026" />
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
