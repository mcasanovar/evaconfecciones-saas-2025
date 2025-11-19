import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

export default function AdministracionPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-slate-800 text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <LayoutGrid className="h-6 w-6" />
            <h1 className="text-xl font-semibold">Evaconfecciones</h1>
          </div>
          <nav className="flex gap-4">
            <Link href="/pedidos">
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
              >
                Pedidos
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
            >
              Administración
            </Button>
          </nav>
        </div>
      </header>

      {/* Content */}
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
