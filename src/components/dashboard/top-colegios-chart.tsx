"use client";

import { TopColegio } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { School } from "lucide-react";

interface TopColegiosChartProps {
  colegios: TopColegio[];
}

export function TopColegiosChart({ colegios }: TopColegiosChartProps) {
  const maxCantidad = colegios.length > 0 ? Math.max(...colegios.map(c => c.totalCantidad)) : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <School className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Top 5 Colegios Más Vendidos</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {colegios.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos disponibles
            </p>
          ) : (
            colegios.map((colegio, index) => (
              <div key={colegio.colegioId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{colegio.colegioNombre}</span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    {colegio.totalCantidad} unidades
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(colegio.totalCantidad / maxCantidad) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
