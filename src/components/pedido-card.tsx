"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PedidoEstado } from "@prisma/client";
import { motion } from "framer-motion";
import { Calendar, BarcodeIcon } from "lucide-react";

interface PedidoCardProps {
  pedido: {
    id: number;
    codigo: string;
    clienteNombre: string;
    clienteApellido: string | null;
    estado: PedidoEstado;
    fechaCreacion: Date;
    fechaEntrega: Date | null;
    colegio: {
      nombre: string;
    } | null;
    items: {
      cantidad: number;
      estaLista: boolean;
    }[];
  };
  onClick: () => void;
}

export function PedidoCard({ pedido, onClick }: PedidoCardProps) {
  // Calculate progress
  const totalItems = pedido.items.reduce((sum, item) => sum + item.cantidad, 0);
  const completedItems = pedido.items
    .filter((item) => item.estaLista)
    .reduce((sum, item) => sum + item.cantidad, 0);
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  // Estado badge colors
  const estadoColors = {
    [PedidoEstado.INGRESADO]: "bg-blue-500 hover:bg-blue-600",
    [PedidoEstado.EN_PROCESO]: "bg-amber-500 hover:bg-amber-600",
    [PedidoEstado.ENTREGADO]: "bg-green-500 hover:bg-green-600",
  };

  const estadoLabels = {
    [PedidoEstado.INGRESADO]: "Ingresado",
    [PedidoEstado.EN_PROCESO]: "En Proceso",
    [PedidoEstado.ENTREGADO]: "Entregado",
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="p-6 h-full cursor-pointer hover:shadow-lg transition-all duration-200"
        onClick={onClick}
      >
        <div className="flex flex-col h-full gap-4">
          {/* Header with codigo and estado */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{pedido.clienteNombre + " " + pedido.clienteApellido}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <BarcodeIcon className="h-4 w-4" />
                <span>
                  {pedido.codigo}
                </span>
              </div>
            </div>
            <Badge className={estadoColors[pedido.estado]}>
              {estadoLabels[pedido.estado]}
            </Badge>
          </div>
          {/* Dates */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Creación: {formatDate(pedido.fechaCreacion)}
              </span>
            </div>
            {pedido.fechaEntrega && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Entrega: {formatDate(pedido.fechaEntrega)}
                </span>
              </div>
            )}
          </div>

          {/* Progress */}
          <div className="mt-auto space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="text-xs text-muted-foreground">
              {completedItems} de {totalItems} prendas listas
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export function PedidoCardSkeleton() {
  return (
    <Card className="p-6 h-64">
      <div className="flex flex-col h-full gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
        <div className="mt-auto space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-2 w-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    </Card>
  );
}
