"use client";

import { TopPrenda } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

interface TopPrendasChartProps {
  prendas: TopPrenda[];
}

export function TopPrendasChart({ prendas }: TopPrendasChartProps) {
  const maxCantidad = prendas.length > 0 ? Math.max(...prendas.map(p => p.totalCantidad)) : 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Top 5 Prendas Más Vendidas</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prendas.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay datos disponibles
            </p>
          ) : (
            prendas.map((prenda, index) => (
              <div key={prenda.prendaId} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-500 w-6">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">{prenda.prendaNombre}</span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    {prenda.totalCantidad} unidades
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${(prenda.totalCantidad / maxCantidad) * 100}%`,
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
