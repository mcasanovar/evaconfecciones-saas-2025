"use client";

import { useState, useEffect } from "react";
import { PedidoWithRelations } from "@/types";
import { PedidoEstado } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PedidoDetailSkeleton } from "@/components/pedido-detail-skeleton";
import { updatePedidoItemStatus, updatePedidoEstado } from "@/actions/pedidos";
import { useToast } from "@/hooks/use-toast";
import { Calendar, User, Phone, Mail, Building2, CheckCircle2, Save } from "lucide-react";

interface PedidoDetailModalProps {
  pedido: PedidoWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  isLoading?: boolean;
}

export function PedidoDetailModal({ pedido, open, onOpenChange, onUpdate, isLoading = false }: PedidoDetailModalProps) {
  const [pendingChanges, setPendingChanges] = useState<Map<number, boolean>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Reset pending changes when modal closes or pedido changes
  useEffect(() => {
    if (!open) {
      setPendingChanges(new Map());
    }
  }, [open]);

  const handleItemToggle = (itemId: number, currentStatus: boolean) => {
    const newChanges = new Map(pendingChanges);
    const newStatus = !currentStatus;

    // If there's already a pending change, toggle it back (remove from pending)
    if (pendingChanges.has(itemId)) {
      newChanges.delete(itemId);
    } else {
      newChanges.set(itemId, newStatus);
    }

    setPendingChanges(newChanges);
  };

  const handleSaveChanges = async () => {
    if (!pedido || pendingChanges.size === 0) return;

    setIsSaving(true);
    try {
      // Update all changed items
      const updates = Array.from(pendingChanges.entries()).map(([itemId, newStatus]) =>
        updatePedidoItemStatus(itemId, newStatus)
      );

      const results = await Promise.all(updates);
      const hasErrors = results.some((r) => !r.success);

      if (hasErrors) {
        toast({
          title: "Error",
          description: "Algunos items no pudieron actualizarse",
          variant: "destructive",
        });
      } else {
        // Check if at least one item is ready to update estado to EN_PROCESO
        const anyItemReady = pedido.items.some((item) => {
          const hasPendingChange = pendingChanges.has(item.id);
          return hasPendingChange ? pendingChanges.get(item.id) : item.estaLista;
        });

        // Auto-update estado if needed
        if (anyItemReady && pedido.estado === PedidoEstado.INGRESADO) {
          await updatePedidoEstado(pedido.id, PedidoEstado.EN_PROCESO);
        }

        toast({
          title: "Cambios guardados",
          description: "Los items han sido actualizados correctamente.",
        });
        setPendingChanges(new Map());
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarcarEntregado = async () => {
    if (!pedido) return;

    setIsSaving(true);
    try {
      // Mark all items as ready
      const updates = pedido.items.map((item) =>
        updatePedidoItemStatus(item.id, true)
      );
      await Promise.all(updates);

      // Update estado to ENTREGADO
      const result = await updatePedidoEstado(pedido.id, PedidoEstado.ENTREGADO);

      if (result.success) {
        toast({
          title: "Pedido entregado",
          description: "El pedido ha sido marcado como entregado.",
        });
        setPendingChanges(new Map());
        onUpdate();
      } else {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const getEstadoLabel = (estado: PedidoEstado) => {
    switch (estado) {
      case PedidoEstado.INGRESADO:
        return "Ingresado";
      case PedidoEstado.EN_PROCESO:
        return "En Proceso";
      case PedidoEstado.ENTREGADO:
        return "Entregado";
      default:
        return estado;
    }
  };

  const getItemStatus = (itemId: number, currentStatus: boolean) => {
    return pendingChanges.has(itemId) ? pendingChanges.get(itemId)! : currentStatus;
  };

  const readyItemsCount = pedido?.items.filter((item) => getItemStatus(item.id, item.estaLista)).length || 0;
  const allItemsReady = pedido ? readyItemsCount === pedido.items.length : false;
  const hasChanges = pendingChanges.size > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div>
            <DialogTitle className="text-2xl">
              {isLoading || !pedido ? "Cargando..." : `Pedido #${pedido.codigo}`}
            </DialogTitle>
            {pedido && (
              <p className="text-sm text-muted-foreground mt-1">
                Creado el {formatDate(pedido.fechaCreacion)}
              </p>
            )}
          </div>
        </DialogHeader>

        {isLoading || !pedido ? (
          <PedidoDetailSkeleton />
        ) : (
          <>
            <div className="space-y-6">
              {/* Estado del pedido */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Estado del pedido:</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    {getEstadoLabel(pedido.estado)}
                  </span>
                </div>
                {allItemsReady && pedido.estado !== PedidoEstado.ENTREGADO && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Todos los items listos</span>
                  </div>
                )}
              </div>

              {/* Información del cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Información del Cliente</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{pedido.clienteNombre} {pedido.clienteApellido}</span>
                    </div>
                    {pedido.clienteTelefono && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{pedido.clienteTelefono}</span>
                      </div>
                    )}
                    {pedido.clienteEmail && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{pedido.clienteEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Detalles del Pedido</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{pedido.colegio?.nombre || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Año: {pedido.anio}</span>
                    </div>
                    {pedido.fechaEntrega && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Entrega: {formatDate(pedido.fechaEntrega)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Items del Pedido</h3>
                  <span className="text-sm text-muted-foreground">
                    {readyItemsCount} de {pedido.items.length} listos
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Prenda</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Talla</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Cantidad</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">P. Unitario</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Subtotal</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Lista</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {pedido.items.map((item) => {
                        const isReady = getItemStatus(item.id, item.estaLista);
                        const hasChange = pendingChanges.has(item.id);
                        return (
                          <tr key={item.id} className={isReady ? "bg-green-50" : ""}>
                            <td className="px-4 py-3 text-sm">{item.prenda?.nombre || "N/A"}</td>
                            <td className="px-4 py-3 text-sm">{item.talla?.nombre || "N/A"}</td>
                            <td className="px-4 py-3 text-sm text-center">{item.cantidad}</td>
                            <td className="px-4 py-3 text-sm text-right">
                              {formatCurrency(item.precioUnitario)}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-medium">
                              {formatCurrency(item.subtotal)}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Checkbox
                                  checked={isReady}
                                  onCheckedChange={() => handleItemToggle(item.id, item.estaLista)}
                                  disabled={isSaving || pedido.estado === PedidoEstado.ENTREGADO}
                                />
                                {hasChange && (
                                  <span className="text-xs text-orange-600">*</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-semibold">{formatCurrency(pedido.total)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Abono:</span>
                      <span className="text-green-600">{formatCurrency(pedido.abono)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Saldo:</span>
                      <span className={pedido.saldo > 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(pedido.saldo)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              {pedido.estado !== PedidoEstado.ENTREGADO && allItemsReady && (
                <Button
                  onClick={handleMarcarEntregado}
                  disabled={isSaving}
                  variant="default"
                >
                  Marcar como Entregado
                </Button>
              )}
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                variant="default"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
