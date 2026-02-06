"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

  const handleEstadoCheckboxChange = (value: string) => {
    if (value === "TODOS") {
      onEstadoChange("TODOS");
    } else if (estado === value) {
      onEstadoChange("TODOS");
    } else {
      onEstadoChange(value);
    }
  };

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6">FILTROS</h2>

      <Card className="p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Input
            type="text"
            placeholder="Buscar por cliente o código..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
            className="sm:col-span-2 md:col-span-2"
          />

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

        <Button variant="default" className="w-full mt-3 sm:mt-4" onClick={onLoadAll}>
          Cargar todos los pedidos
        </Button>

        <div className="mt-3 sm:mt-4 space-y-2">
          <Label className="text-sm font-medium">Filtrar por estado:</Label>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="estado-todos"
                checked={estado === "TODOS"}
                onCheckedChange={() => handleEstadoCheckboxChange("TODOS")}
              />
              <Label
                htmlFor="estado-todos"
                className="text-sm font-normal cursor-pointer"
              >
                Todos
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="estado-ingresado"
                checked={estado === PedidoEstado.INGRESADO}
                onCheckedChange={() => handleEstadoCheckboxChange(PedidoEstado.INGRESADO)}
              />
              <Label
                htmlFor="estado-ingresado"
                className="text-sm font-normal cursor-pointer text-blue-600"
              >
                Ingresado
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="estado-en-proceso"
                checked={estado === PedidoEstado.EN_PROCESO}
                onCheckedChange={() => handleEstadoCheckboxChange(PedidoEstado.EN_PROCESO)}
              />
              <Label
                htmlFor="estado-en-proceso"
                className="text-sm font-normal cursor-pointer text-orange-600"
              >
                En Proceso
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="estado-entregado"
                checked={estado === PedidoEstado.ENTREGADO}
                onCheckedChange={() => handleEstadoCheckboxChange(PedidoEstado.ENTREGADO)}
              />
              <Label
                htmlFor="estado-entregado"
                className="text-sm font-normal cursor-pointer text-green-600"
              >
                Entregado
              </Label>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
