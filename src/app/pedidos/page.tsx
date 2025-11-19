import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LayoutGrid } from "lucide-react";

export default function PedidosPage() {
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
            <Button
              variant="ghost"
              size="sm"
              className="bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
            >
              Pedidos
            </Button>
          </nav>
        </div>
        <div className="flex gap-3">
          <Link href="/administracion">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 bg-slate-700 text-white hover:bg-slate-600 hover:text-white"
            >
              Administración
            </Button>
          </Link>
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Nuevo Pedido
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-center mb-6">FILTROS</h2>

        {/* Filters */}
        <Card className="p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              type="text"
              placeholder="Buscar por cliente..."
            />
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ingresado">Ingresado</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="default" className="w-full">
              Buscar
            </Button>
          </div>
          <Button variant="default" className="w-full mt-4">
            Cargar todos los pedidos
          </Button>
        </Card>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 h-64">
              <Skeleton className="h-full w-full" />
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
