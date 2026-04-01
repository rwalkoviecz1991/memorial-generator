import { useState } from 'react';
import { MatriculaSelector } from './MatriculaSelector';
import type { MatriculaData } from '@/types/matricula';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerticesTable } from './VerticesTable';
import { ConjugeFields } from './ConjugeFields';
import { AnuenciaData, Vertice, emptyConjuge } from '@/types/documents';
import { generateAnuenciaDocx } from '@/utils/generateAnuencia';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

const initialData: AnuenciaData = {
  nome: '', nacionalidade: 'brasileiro(a)', estadoCivil: 'solteiro(a)',
  uniaoEstavel: 'o qual declara que não convive em união estável',
  profissao: '', rg: '', orgaoRg: 'SSP-PR', cnh: '', orgaoCnh: 'DETRAN-PR',
  cpf: '', endereco: '', bairro: '', cidade: '', uf: 'PR',
  conjuge: { ...emptyConjuge },
  denominacaoConfrontante: '', matriculaConfrontante: '', registroConfrontante: '',
  denominacaoRetificando: '', matriculaRetificando: '', codigoIncra: '', registroRetificando: '',
  nomeProfissional: '', registroProfissional: '', tipoProfissional: 'CFT',
  vertices: [],
  localData: '', dataDocumento: '',
  credenciamento: '', trt: '',
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

export function AnuenciaForm() {
  const [data, setData] = useState<AnuenciaData>(initialData);

  const update = (field: keyof AnuenciaData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleEstadoCivilChange = (value: string) => {
    const isCasado = value.toLowerCase().includes('casado') || value.toLowerCase().includes('união estável');
    update('estadoCivil', value);
    if (isCasado) {
      update('uniaoEstavel', '');
    } else {
      update('uniaoEstavel', 'o qual declara que não convive em união estável');
      update('conjuge', { ...emptyConjuge });
    }
  };

  const handleGenerate = async () => {
    if (!data.nome || !data.cpf) {
      toast.error('Preencha ao menos o nome e CPF do confrontante.');
      return;
    }
    try {
      await generateAnuenciaDocx(data);
      toast.success('Documento gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar documento.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados do Confrontante</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Nome completo" value={data.nome} onChange={v => update('nome', v)} className="lg:col-span-2" />
          <Field label="Nacionalidade" value={data.nacionalidade} onChange={v => update('nacionalidade', v)} />
          
          <ConjugeFields
            estadoCivil={data.estadoCivil}
            conjuge={data.conjuge}
            onEstadoCivilChange={handleEstadoCivilChange}
            onConjugeChange={c => update('conjuge', c)}
          />

          <Field label="União Estável" value={data.uniaoEstavel} onChange={v => update('uniaoEstavel', v)} className="lg:col-span-2" />
          <Field label="Profissão" value={data.profissao} onChange={v => update('profissao', v)} />
          <Field label="RG" value={data.rg} onChange={v => update('rg', v)} />
          <Field label="Órgão RG" value={data.orgaoRg} onChange={v => update('orgaoRg', v)} />
          <Field label="CNH (opcional)" value={data.cnh} onChange={v => update('cnh', v)} />
          <Field label="Órgão CNH" value={data.orgaoCnh} onChange={v => update('orgaoCnh', v)} />
          <Field label="CPF" value={data.cpf} onChange={v => update('cpf', v)} />
          <Field label="Endereço" value={data.endereco} onChange={v => update('endereco', v)} className="lg:col-span-2" />
          <Field label="Bairro" value={data.bairro} onChange={v => update('bairro', v)} />
          <Field label="Cidade" value={data.cidade} onChange={v => update('cidade', v)} />
          <Field label="UF" value={data.uf} onChange={v => update('uf', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Imóvel do Confrontante</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Denominação (Lote/Gleba)" value={data.denominacaoConfrontante} onChange={v => update('denominacaoConfrontante', v)} className="md:col-span-2" />
          <Field label="Matrícula nº" value={data.matriculaConfrontante} onChange={v => update('matriculaConfrontante', v)} />
          <Field label="Registro de Imóveis / Comarca" value={data.registroConfrontante} onChange={v => update('registroConfrontante', v)} className="md:col-span-3" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Imóvel Retificando</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Denominação (Lote/Gleba)" value={data.denominacaoRetificando} onChange={v => update('denominacaoRetificando', v)} className="md:col-span-2" />
          <Field label="Matrícula nº" value={data.matriculaRetificando} onChange={v => update('matriculaRetificando', v)} />
          <Field label="Código INCRA" value={data.codigoIncra} onChange={v => update('codigoIncra', v)} />
          <Field label="Registro de Imóveis / Comarca" value={data.registroRetificando} onChange={v => update('registroRetificando', v)} className="md:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Profissional Técnico</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome" value={data.nomeProfissional} onChange={v => update('nomeProfissional', v)} className="md:col-span-2" />
          <Field label="Tipo registro (CFT/CREA)" value={data.tipoProfissional} onChange={v => update('tipoProfissional', v)} />
          <Field label="Nº Registro" value={data.registroProfissional} onChange={v => update('registroProfissional', v)} />
          <Field label="Credenciamento INCRA" value={data.credenciamento} onChange={v => update('credenciamento', v)} />
          <Field label="TRT nº" value={data.trt} onChange={v => update('trt', v)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Vértices Geodésicos</CardTitle></CardHeader>
        <CardContent>
          <VerticesTable vertices={data.vertices} onChange={v => update('vertices', v)} />
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
          Gerar Anuência (DOCX)
        </Button>
      </div>
    </div>
  );
}
