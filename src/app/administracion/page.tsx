import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";

export default function AdministracionPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="administracion" />

      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold mb-6">Administración del Catálogo</h2>

        <Card className="p-6">
          <p className="text-muted-foreground">
            Gestión de Colegios, Prendas, Tallas y Precios
          </p>
        </Card>
      </main>
    </div>
  );
}
