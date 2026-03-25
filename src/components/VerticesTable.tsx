import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Vertice } from '@/types/documents';
import { Plus, Trash2 } from 'lucide-react';

interface VerticesTableProps {
  vertices: Vertice[];
  onChange: (vertices: Vertice[]) => void;
}

const emptyVertice = (): Vertice => ({
  id: crypto.randomUUID(),
  codigoEstacao: '',
  longitude: '',
  latitude: '',
  altitude: '',
  codigoVante: '',
  azimute: '',
  distancia: '',
});

export function VerticesTable({ vertices, onChange }: VerticesTableProps) {
  const addRow = () => onChange([...vertices, emptyVertice()]);

  const removeRow = (id: string) => onChange(vertices.filter(v => v.id !== id));

  const updateRow = (id: string, field: keyof Vertice, value: string) => {
    onChange(vertices.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Vértices Geodésicos (SIRGAS2000)
        </h3>
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="h-4 w-4 mr-1" /> Adicionar Vértice
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="px-2 py-2 text-left font-medium">Código Estação</th>
              <th className="px-2 py-2 text-left font-medium">Longitude</th>
              <th className="px-2 py-2 text-left font-medium">Latitude</th>
              <th className="px-2 py-2 text-left font-medium">Altitude</th>
              <th className="px-2 py-2 text-left font-medium">Código Vante</th>
              <th className="px-2 py-2 text-left font-medium">Azimute</th>
              <th className="px-2 py-2 text-left font-medium">Distância (m)</th>
              <th className="px-2 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {vertices.map((v) => (
              <tr key={v.id} className="border-t border-border hover:bg-muted/50">
                {(['codigoEstacao', 'longitude', 'latitude', 'altitude', 'codigoVante', 'azimute', 'distancia'] as const).map(field => (
                  <td key={field} className="px-1 py-1">
                    <Input
                      className="h-8 text-xs"
                      value={v[field]}
                      onChange={e => updateRow(v.id, field, e.target.value)}
                      placeholder={field === 'codigoEstacao' ? 'BEJE-M-0001' : ''}
                    />
                  </td>
                ))}
                <td className="px-1 py-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => removeRow(v.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {vertices.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum vértice adicionado. Clique em "Adicionar Vértice" para começar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
