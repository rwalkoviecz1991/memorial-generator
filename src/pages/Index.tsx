import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnuenciaForm } from '@/components/AnuenciaForm';
import { MemorialForm } from '@/components/MemorialForm';
import { RequerimentoForm } from '@/components/RequerimentoForm';
import { FileText, MapPin, ClipboardList } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">
                GeoDoc
              </h1>
              <p className="text-sm text-muted-foreground">
                Geração de documentos para georreferenciamento
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Tabs defaultValue="anuencia" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 h-auto p-1">
            <TabsTrigger value="anuencia" className="gap-2 py-2.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4 hidden sm:block" />
              Anuência
            </TabsTrigger>
            <TabsTrigger value="memorial" className="gap-2 py-2.5 text-xs sm:text-sm">
              <MapPin className="h-4 w-4 hidden sm:block" />
              Memorial
            </TabsTrigger>
            <TabsTrigger value="requerimento" className="gap-2 py-2.5 text-xs sm:text-sm">
              <ClipboardList className="h-4 w-4 hidden sm:block" />
              Requerimento
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anuencia">
            <AnuenciaForm />
          </TabsContent>

          <TabsContent value="memorial">
            <MemorialForm />
          </TabsContent>

          <TabsContent value="requerimento">
            <RequerimentoForm />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
