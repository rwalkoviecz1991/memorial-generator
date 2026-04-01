import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { getMatriculas } from '@/utils/matriculaStorage';
import type { MatriculaData } from '@/types/matricula';

interface MatriculaSelectorProps {
  onSelect: (matricula: MatriculaData) => void;
  refreshKey?: number;
}

export function MatriculaSelector({ onSelect, refreshKey }: MatriculaSelectorProps) {
  const [matriculas, setMatriculas] = useState<MatriculaData[]>([]);

  useEffect(() => {
    setMatriculas(getMatriculas());
  }, [refreshKey]);

  if (matriculas.length === 0) return null;

  return (
    <div>
      <Label className="text-xs text-muted-foreground">Preencher com dados de matrícula</Label>
      <Select onValueChange={id => {
        const m = matriculas.find(x => x.id === id);
        if (m) onSelect(m);
      }}>
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Selecione uma matrícula cadastrada..." />
        </SelectTrigger>
        <SelectContent>
          {matriculas.map(m => (
            <SelectItem key={m.id} value={m.id}>{m.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
