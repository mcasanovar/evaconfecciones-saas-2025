"use client";

import { RecentPedido } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PedidoEstado } from "@prisma/client";

interface RecentOrdersProps {
  pedidos: RecentPedido[];
}

export function RecentOrders({ pedidos }: RecentOrdersProps) {
  const getEstadoBadge = (estado: PedidoEstado) => {
    switch (estado) {
      case PedidoEstado.INGRESADO:
        return <Badge variant="secondary">Ingresado</Badge>;
      case PedidoEstado.EN_PROCESO:
        return <Badge variant="default">En Proceso</Badge>;
      case PedidoEstado.ENTREGADO:
        return <Badge variant="default" className="bg-green-600">Entregado</Badge>;
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pedidos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay pedidos recientes
            </p>
          ) : (
            pedidos.map((pedido) => (
              <div
                key={pedido.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    #{pedido.codigo} - {pedido.clienteNombre} {pedido.clienteApellido || ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pedido.colegio?.nombre || "N/A"} • {formatDate(pedido.fechaCreacion)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold">
                    {formatCurrency(pedido.total)}
                  </span>
                  {getEstadoBadge(pedido.estado)}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
