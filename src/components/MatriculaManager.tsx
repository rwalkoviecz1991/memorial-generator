import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Trash2, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { MatriculaData } from '@/types/matricula';
import { emptyMatricula } from '@/types/matricula';
import { extractTextFromPdf, parseMatriculaText } from '@/utils/extractMatricula';
import { getMatriculas, saveMatricula, removeMatricula } from '@/utils/matriculaStorage';

export function MatriculaManager({ onUpdate }: { onUpdate?: () => void }) {
  const [matriculas, setMatriculas] = useState<MatriculaData[]>(getMatriculas);
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<MatriculaData | null>(null);
  const [editing, setEditing] = useState<MatriculaData | null>(null);

  const refresh = useCallback(() => {
    setMatriculas(getMatriculas());
    onUpdate?.();
  }, [onUpdate]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.name.toLowerCase().endsWith('.pdf')) {
          toast.error(`${file.name} não é um PDF.`);
          continue;
        }
        const text = await extractTextFromPdf(file);
        const parsed = parseMatriculaText(text, file.name);
        const data: MatriculaData = { ...emptyMatricula, ...parsed };
        saveMatricula(data);
        toast.success(`Matrícula extraída: ${data.label}`);
      }
      refresh();
    } catch (err) {
      console.error(err);
      toast.error('Erro ao processar PDF.');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleRemove = (id: string) => {
    removeMatricula(id);
    refresh();
    toast.success('Matrícula removida.');
  };

  const handleSaveEdit = () => {
    if (!editing) return;
    editing.label = `Matrícula ${editing.numeroMatricula || '?'} - ${editing.nomeProprietario || editing.fileName}`;
    saveMatricula(editing);
    refresh();
    setEditing(null);
    toast.success('Dados atualizados.');
  };

  const EditField = ({ label, field }: { label: string; field: keyof MatriculaData }) => (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={(editing as any)?.[field] || ''}
        onChange={e => setEditing(prev => prev ? { ...prev, [field]: e.target.value } : null)}
        className="mt-1"
      />
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Matrículas Cadastradas
          </span>
          <label className="cursor-pointer">
            <Button size="sm" className="gap-2" disabled={loading} asChild>
              <span>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Importar PDF
              </span>
            </Button>
            <input type="file" accept=".pdf" multiple className="hidden" onChange={handleUpload} />
          </label>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {matriculas.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma matrícula cadastrada. Importe um PDF para começar.
          </p>
        ) : (
          <div className="space-y-2">
            {matriculas.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.fileName}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {/* View raw text */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewing(m)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Texto extraído - {m.fileName}</DialogTitle>
                      </DialogHeader>
                      <Textarea value={m.textoCompleto} readOnly rows={20} className="font-mono text-xs" />
                    </DialogContent>
                  </Dialog>

                  {/* Edit extracted data */}
                  <Dialog open={editing?.id === m.id} onOpenChange={open => !open && setEditing(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" onClick={() => setEditing({ ...m })}>
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Editar dados - {m.fileName}</DialogTitle>
                      </DialogHeader>
                      {editing && (
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold">Proprietário</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <EditField label="Nome" field="nomeProprietario" />
                            <EditField label="Nacionalidade" field="nacionalidade" />
                            <EditField label="Estado Civil" field="estadoCivil" />
                            <EditField label="Profissão" field="profissao" />
                            <EditField label="RG" field="rg" />
                            <EditField label="CPF" field="cpf" />
                            <EditField label="Endereço" field="endereco" />
                            <EditField label="Cidade" field="cidade" />
                            <EditField label="UF" field="uf" />
                          </div>
                          <h4 className="text-sm font-semibold">Cônjuge</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <EditField label="Nome" field="nomeConjuge" />
                            <EditField label="CPF" field="cpfConjuge" />
                            <EditField label="RG" field="rgConjuge" />
                          </div>
                          <h4 className="text-sm font-semibold">Imóvel</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <EditField label="Denominação" field="denominacaoImovel" />
                            <EditField label="Nº Matrícula" field="numeroMatricula" />
                            <EditField label="Registro" field="registro" />
                            <EditField label="Comarca" field="comarca" />
                            <EditField label="Município" field="municipioImovel" />
                            <EditField label="Área" field="area" />
                            <EditField label="Livro" field="livro" />
                          </div>
                          <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
                            <Button onClick={handleSaveEdit}>Salvar</Button>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>

                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleRemove(m.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
