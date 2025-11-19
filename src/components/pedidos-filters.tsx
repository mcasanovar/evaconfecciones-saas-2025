"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { PedidoEstado } from "@prisma/client";

interface PedidosFiltersProps {
  search: string;
  estado: string;
  anio: string;
  onSearchChange: (value: string) => void;
  onEstadoChange: (value: string) => void;
  onAnioChange: (value: string) => void;
  onSearch: () => void;
  onLoadAll: () => void;
}

export function PedidosFilters({
  search,
  estado,
  anio,
  onSearchChange,
  onEstadoChange,
  onAnioChange,
  onSearch,
  onLoadAll,
}: PedidosFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div>
      <h2 className="text-2xl font-bold text-center mb-6">FILTROS</h2>

      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            type="text"
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
          />

          <Select value={estado} onValueChange={onEstadoChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              <SelectItem value={PedidoEstado.INGRESADO}>Ingresado</SelectItem>
              <SelectItem value={PedidoEstado.EN_PROCESO}>En Proceso</SelectItem>
              <SelectItem value={PedidoEstado.ENTREGADO}>Entregado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={anio} onValueChange={onAnioChange}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar año..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="default" className="w-full" onClick={onSearch}>
            Buscar
          </Button>
        </div>

        <Button variant="default" className="w-full mt-4" onClick={onLoadAll}>
          Cargar todos los pedidos
        </Button>
      </Card>
    </div>
  );
}
