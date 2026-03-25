import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VerticesTable } from './VerticesTable';
import { ConjugeFields } from './ConjugeFields';
import { MemorialData, Vertice, emptyConjuge } from '@/types/documents';
import { generateMemorialDocx } from '@/utils/generateMemorial';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

const initialData: MemorialData = {
  nomeProprietario: '', cpfProprietario: '', rgProprietario: '',
  estadoCivil: 'solteiro(a)',
  conjuge: { ...emptyConjuge },
  denominacaoImovel: '', municipio: '', uf: 'PR', matricula: '', registro: '',
  codigoIncra: '', areaTotal: '', perimetroTotal: '',
  vertices: [],
  nomeProfissional: '', registroProfissional: '', tipoProfissional: 'CFT',
  credenciamento: '', trt: '',
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

export function MemorialForm() {
  const [data, setData] = useState<MemorialData>(initialData);

  const update = (field: keyof MemorialData, value: any) => {
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
    if (!data.nomeProprietario || !data.denominacaoImovel) {
      toast.error('Preencha ao menos o nome do proprietário e denominação do imóvel.');
      return;
    }
    try {
      await generateMemorialDocx(data);
      toast.success('Memorial descritivo gerado com sucesso!');
    } catch {
      toast.error('Erro ao gerar documento.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Proprietário</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Nome completo" value={data.nomeProprietario} onChange={v => update('nomeProprietario', v)} className="md:col-span-2" />
          <Field label="CPF" value={data.cpfProprietario} onChange={v => update('cpfProprietario', v)} />
          <Field label="RG (opcional)" value={data.rgProprietario} onChange={v => update('rgProprietario', v)} />
          
          <ConjugeFields
            estadoCivil={data.estadoCivil}
            conjuge={data.conjuge}
            onEstadoCivilChange={handleEstadoCivilChange}
            onConjugeChange={c => update('conjuge', c)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Dados do Imóvel</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="Denominação (Lote/Gleba)" value={data.denominacaoImovel} onChange={v => update('denominacaoImovel', v)} className="md:col-span-2" />
          <Field label="Município" value={data.municipio} onChange={v => update('municipio', v)} />
          <Field label="UF" value={data.uf} onChange={v => update('uf', v)} />
          <Field label="Matrícula nº" value={data.matricula} onChange={v => update('matricula', v)} />
          <Field label="Registro de Imóveis / Comarca" value={data.registro} onChange={v => update('registro', v)} />
          <Field label="Código INCRA" value={data.codigoIncra} onChange={v => update('codigoIncra', v)} />
          <Field label="Área Total" value={data.areaTotal} onChange={v => update('areaTotal', v)} placeholder="10,5432 ha" />
          <Field label="Perímetro Total" value={data.perimetroTotal} onChange={v => update('perimetroTotal', v)} placeholder="1.523,45 m" />
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
          Gerar Memorial Descritivo (DOCX)
        </Button>
      </div>
    </div>
  );
}
