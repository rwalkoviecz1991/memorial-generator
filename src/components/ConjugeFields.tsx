import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConjugeData, emptyConjuge } from '@/types/documents';

interface ConjugeFieldsProps {
  estadoCivil: string;
  conjuge: ConjugeData;
  onEstadoCivilChange: (value: string) => void;
  onConjugeChange: (conjuge: ConjugeData) => void;
}

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

const estadoCivilOptions = [
  'solteiro(a)',
  'casado(a)',
  'divorciado(a)',
  'viúvo(a)',
  'separado(a) judicialmente',
  'união estável',
];

export function ConjugeFields({ estadoCivil, conjuge, onEstadoCivilChange, onConjugeChange }: ConjugeFieldsProps) {
  const isCasado = estadoCivil.toLowerCase().includes('casado') || estadoCivil.toLowerCase().includes('união estável');

  const updateConjuge = (field: keyof ConjugeData, value: string) => {
    onConjugeChange({ ...conjuge, [field]: value });
  };

  return (
    <>
      <div>
        <Label className="text-xs text-muted-foreground">Estado Civil</Label>
        <select
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={estadoCivil}
          onChange={e => onEstadoCivilChange(e.target.value)}
        >
          {estadoCivilOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {isCasado && (
        <Card className="col-span-full border-accent bg-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent-foreground flex items-center gap-2">
              👤 Dados do Cônjuge
              <span className="text-xs font-normal text-muted-foreground">(campos opcionais)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Nome completo" value={conjuge.nome} onChange={v => updateConjuge('nome', v)} className="lg:col-span-2" />
            <Field label="Nacionalidade" value={conjuge.nacionalidade} onChange={v => updateConjuge('nacionalidade', v)} />
            <Field label="Profissão" value={conjuge.profissao} onChange={v => updateConjuge('profissao', v)} />
            <Field label="RG (opcional)" value={conjuge.rg} onChange={v => updateConjuge('rg', v)} />
            <Field label="Órgão RG" value={conjuge.orgaoRg} onChange={v => updateConjuge('orgaoRg', v)} />
            <Field label="CPF (opcional)" value={conjuge.cpf} onChange={v => updateConjuge('cpf', v)} />
            <Field label="CNH (opcional)" value={conjuge.cnh} onChange={v => updateConjuge('cnh', v)} />
            <Field label="Órgão CNH" value={conjuge.orgaoCnh} onChange={v => updateConjuge('orgaoCnh', v)} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
