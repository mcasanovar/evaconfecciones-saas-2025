"use client";

/**
 * PedidoDetailModal Component
 * 
 * Modal for viewing and editing pedido details including:
 * - Client information (nombre, apellido, teléfono, email)
 * - Pedido items with status tracking (estaLista)
 * - Abono (payment) management
 * - Adding/removing items
 * - Marking pedido as delivered
 * 
 * All changes are batched and saved together when "Guardar Cambios" is clicked.
 */

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updatePedidoItemStatus, updatePedidoEstado, updatePedidoAbono, addItemToPedido, deletePedidoItem, updatePedidoClientInfo } from "@/actions/pedidos";
import { getActiveColegios, getActivePrendas, getActiveTallas, getPrecio } from "@/actions/catalog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, CheckCircle2, Save, Plus, Trash2, Edit2 } from "lucide-react";
import { Colegio, Prenda, Talla } from "@prisma/client";

interface PedidoDetailModalProps {
  pedido: PedidoWithRelations | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  isLoading?: boolean;
}

// Type for temporary items (new items not yet saved)
type TempItem = {
  tempId: string;
  colegioId: number;
  colegioNombre: string;
  prendaId: number;
  prendaNombre: string;
  tallaId: number;
  tallaNombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
};

export function PedidoDetailModal({ pedido, open, onOpenChange, onUpdate, isLoading = false }: PedidoDetailModalProps) {
  const [pendingChanges, setPendingChanges] = useState<Map<number, boolean>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingAbono, setIsEditingAbono] = useState(false);
  const [abonoValue, setAbonoValue] = useState<string>("");
  const [localPedido, setLocalPedido] = useState<PedidoWithRelations | null>(null);
  const [hasAbonoChanged, setHasAbonoChanged] = useState(false);

  // Local items management (new items not yet saved to DB)
  const [tempItems, setTempItems] = useState<TempItem[]>([]);
  const [deletedItemIds, setDeletedItemIds] = useState<number[]>([]);

  // Client info editing state (local changes, not saved until "Guardar Cambios")
  const [clienteNombre, setClienteNombre] = useState<string>("");
  const [clienteApellido, setClienteApellido] = useState<string>("");
  const [clienteTelefono, setClienteTelefono] = useState<string>("");
  const [clienteEmail, setClienteEmail] = useState<string>("");
  const [hasClientChanges, setHasClientChanges] = useState(false);

  // Add item form state
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);
  const [selectedColegio, setSelectedColegio] = useState<string>("");
  const [selectedPrenda, setSelectedPrenda] = useState<string>("");
  const [selectedTalla, setSelectedTalla] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");

  const { toast } = useToast();

  // Update local pedido when prop changes
  useEffect(() => {
    if (pedido) {
      setLocalPedido(pedido);
    }
  }, [pedido]);

  // Reset pending changes when modal closes and trigger update if needed
  useEffect(() => {
    if (!open) {
      // Call onUpdate if abono was changed before closing
      if (hasAbonoChanged) {
        onUpdate();
        setHasAbonoChanged(false);
      }
      setPendingChanges(new Map());
      setIsEditingAbono(false);
      setHasClientChanges(false);
      setTempItems([]);
      setDeletedItemIds([]);
      setIsAddingItem(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Initialize abono value and client info when local pedido changes
  useEffect(() => {
    if (localPedido) {
      setAbonoValue(localPedido.abono.toString());
      setClienteNombre(localPedido.clienteNombre);
      setClienteApellido(localPedido.clienteApellido || "");
      setClienteTelefono(localPedido.clienteTelefono || "");
      setClienteEmail(localPedido.clienteEmail || "");
    }
  }, [localPedido]);

  // Load catalog data when starting to add item
  useEffect(() => {
    if (isAddingItem && colegios.length === 0) {
      loadCatalogData();
    }
  }, [isAddingItem, colegios.length]);

  const loadCatalogData = async () => {
    const [colegiosData, prendasData, tallasData] = await Promise.all([
      getActiveColegios(),
      getActivePrendas(),
      getActiveTallas(),
    ]);
    setColegios(colegiosData);
    setPrendas(prendasData);
    setTallas(tallasData);
  };

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

  /**
   * Batch save all pending changes:
   * 1. Update client information
   * 2. Delete removed items
   * 3. Add new items
   * 4. Update item status (estaLista)
   * 
   * All operations are executed in parallel for better performance.
   * Auto-updates pedido estado to EN_PROCESO if any item is ready.
   */
  const handleSaveChanges = async () => {
    if (!localPedido) return;

    // Check if there are any changes to save
    const hasChanges = pendingChanges.size > 0 || tempItems.length > 0 || deletedItemIds.length > 0 || hasClientChanges;
    if (!hasChanges) return;

    // Validate client info if changed
    if (hasClientChanges && (!clienteNombre || clienteNombre.trim() === "")) {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const operations = [];

      // 1. Update client info if changed
      if (hasClientChanges) {
        operations.push(
          updatePedidoClientInfo(
            localPedido.id,
            clienteNombre,
            clienteApellido,
            clienteTelefono,
            clienteEmail
          )
        );
      }

      // 2. Delete items marked for deletion
      if (deletedItemIds.length > 0) {
        operations.push(
          ...deletedItemIds.map((itemId) => deletePedidoItem(itemId))
        );
      }

      // 3. Add new temporary items
      if (tempItems.length > 0) {
        operations.push(
          ...tempItems.map((item) =>
            addItemToPedido(
              localPedido.id,
              item.colegioId,
              item.prendaId,
              item.tallaId,
              item.cantidad
            )
          )
        );
      }

      // 4. Update item statuses
      if (pendingChanges.size > 0) {
        operations.push(
          ...Array.from(pendingChanges.entries()).map(([itemId, newStatus]) =>
            updatePedidoItemStatus(itemId, newStatus)
          )
        );
      }

      // Execute all operations
      const results = await Promise.all(operations);
      const hasErrors = results.some((r) => !r.success);

      if (hasErrors) {
        const failedOps = results.filter(r => !r.success);
        toast({
          title: "Error al guardar",
          description: failedOps.length === 1
            ? "Un cambio no pudo guardarse. Por favor, inténtelo nuevamente."
            : `${failedOps.length} cambios no pudieron guardarse. Por favor, inténtelo nuevamente.`,
          variant: "destructive",
          duration: 5000,
        });
      } else {
        // Check if at least one item is ready to update estado to EN_PROCESO
        const anyItemReady = localPedido.items.some((item) => {
          const hasPendingChange = pendingChanges.has(item.id);
          return hasPendingChange ? pendingChanges.get(item.id) : item.estaLista;
        });

        // Auto-update estado if needed
        if (anyItemReady && localPedido.estado === PedidoEstado.INGRESADO) {
          await updatePedidoEstado(localPedido.id, PedidoEstado.EN_PROCESO);
        }

        const changeCount = operations.length;
        toast({
          title: "✅ Cambios guardados",
          description: changeCount === 1
            ? "El cambio ha sido guardado correctamente."
            : `${changeCount} cambios guardados correctamente.`,
          duration: 3000,
        });

        // Reset all local changes
        setPendingChanges(new Map());
        setTempItems([]);
        setDeletedItemIds([]);
        setHasClientChanges(false);

        onUpdate();
        onOpenChange(false); // Close modal after saving changes
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "❌ Error inesperado",
        description: "No se pudieron guardar los cambios. Por favor, verifique su conexión e inténtelo nuevamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarcarEntregado = async () => {
    if (!localPedido) return;

    setIsSaving(true);
    try {
      // Mark all items as ready
      const updates = localPedido.items.map((item) =>
        updatePedidoItemStatus(item.id, true)
      );
      await Promise.all(updates);

      // Update estado to ENTREGADO
      const result = await updatePedidoEstado(localPedido.id, PedidoEstado.ENTREGADO);

      if (result.success) {
        toast({
          title: "✅ Pedido entregado",
          description: `El pedido #${localPedido.codigo} ha sido marcado como entregado exitosamente.`,
          duration: 3000,
        });
        setPendingChanges(new Map());
        onUpdate();
        onOpenChange(false); // Close modal after marking as entregado
      } else {
        toast({
          title: "❌ Error al entregar",
          description: result.error || "No se pudo marcar el pedido como entregado.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error marking as delivered:", error);
      toast({
        title: "❌ Error inesperado",
        description: "No se pudo marcar el pedido como entregado. Por favor, inténtelo nuevamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAbono = async () => {
    if (!localPedido) return;

    const newAbono = parseFloat(abonoValue);

    // Validate abono is a valid number
    if (isNaN(newAbono)) {
      toast({
        title: "Error",
        description: "Ingrese un valor válido",
        variant: "destructive",
      });
      return;
    }

    // Validate abono is not negative
    if (newAbono < 0) {
      toast({
        title: "Error",
        description: "El abono no puede ser negativo",
        variant: "destructive",
      });
      return;
    }

    // Validate abono is not greater than total
    if (newAbono > localPedido.total) {
      toast({
        title: "Error",
        description: "El abono no puede ser mayor que el total del pedido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updatePedidoAbono(localPedido.id, newAbono);

      if (result.success) {
        // Update local pedido state immediately
        const newSaldo = localPedido.total - newAbono;
        setLocalPedido({
          ...localPedido,
          abono: newAbono,
          saldo: newSaldo,
        });

        toast({
          title: "Abono actualizado",
          description: "El abono ha sido actualizado correctamente.",
        });
        setIsEditingAbono(false);
        setHasAbonoChanged(true); // Mark that abono changed, will update on close
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el abono.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditAbono = () => {
    if (localPedido) {
      setAbonoValue(localPedido.abono.toString());
    }
    setIsEditingAbono(false);
  };

  const handleClientInfoChange = (field: 'nombre' | 'apellido' | 'telefono' | 'email', value: string) => {
    setHasClientChanges(true);
    switch (field) {
      case 'nombre':
        setClienteNombre(value);
        break;
      case 'apellido':
        setClienteApellido(value);
        break;
      case 'telefono':
        setClienteTelefono(value);
        break;
      case 'email':
        setClienteEmail(value);
        break;
    }
  };

  const handleAddItem = async () => {
    if (!localPedido || !selectedColegio || !selectedPrenda || !selectedTalla || !cantidad) {
      toast({
        title: "Error",
        description: "Complete todos los campos",
        variant: "destructive",
      });
      return;
    }

    const colegioId = parseInt(selectedColegio);
    const prendaId = parseInt(selectedPrenda);
    const tallaId = parseInt(selectedTalla);
    const cant = parseInt(cantidad);

    try {
      // Get price from catalog
      const precioUnitario = await getPrecio(colegioId, prendaId, tallaId);

      if (!precioUnitario || precioUnitario === 0) {
        toast({
          title: "Error",
          description: "No se encontró precio para esta combinación",
          variant: "destructive",
        });
        return;
      }

      // Check if item already exists in temp items
      const existingTempItemIndex = tempItems.findIndex(
        item => item.colegioId === colegioId && item.prendaId === prendaId && item.tallaId === tallaId
      );

      if (existingTempItemIndex !== -1) {
        // Update existing temp item quantity
        const updatedTempItems = [...tempItems];
        const existingItem = updatedTempItems[existingTempItemIndex];
        existingItem.cantidad += cant;
        existingItem.subtotal = existingItem.precioUnitario * existingItem.cantidad;
        setTempItems(updatedTempItems);

        toast({
          title: "Cantidad actualizada",
          description: `Se agregaron ${cant} unidad(es) al item existente`,
        });
      } else {
        // Check if item exists in existing pedido items (not deleted)
        const existingPedidoItem = localPedido.items.find(
          item => !deletedItemIds.includes(item.id) &&
            item.colegioId === colegioId &&
            item.prendaId === prendaId &&
            item.tallaId === tallaId
        );

        if (existingPedidoItem) {
          // Item exists in pedido, we need to track it for quantity update
          toast({
            title: "Item existente",
            description: "Este item ya existe en el pedido. Se agregará como item separado al guardar.",
            variant: "default",
          });
        }

        // Find names for display
        const colegio = colegios.find(c => c.id === colegioId);
        const prenda = prendas.find(p => p.id === prendaId);
        const talla = tallas.find(t => t.id === tallaId);

        // Create temporary item
        const newTempItem: TempItem = {
          tempId: `temp-${Date.now()}`,
          colegioId,
          colegioNombre: colegio?.nombre || "",
          prendaId,
          prendaNombre: prenda?.nombre || "",
          tallaId,
          tallaNombre: talla?.nombre || "",
          cantidad: cant,
          precioUnitario,
          subtotal: precioUnitario * cant,
        };

        setTempItems([...tempItems, newTempItem]);

        toast({
          title: "Item agregado",
          description: "El item se guardará cuando presiones Guardar Cambios",
        });
      }

      // Reset form
      setSelectedColegio("");
      setSelectedPrenda("");
      setSelectedTalla("");
      setCantidad("1");
      setIsAddingItem(false);
    } catch {
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado",
        variant: "destructive",
      });
    }
  };

  const handleCancelAddItem = () => {
    setSelectedColegio("");
    setSelectedPrenda("");
    setSelectedTalla("");
    setCantidad("1");
    setIsAddingItem(false);
  };

  const handleDeleteItem = (itemId: number) => {
    // Mark existing item for deletion
    setDeletedItemIds([...deletedItemIds, itemId]);
  };

  const handleDeleteTempItem = (tempId: string) => {
    // Remove temporary item
    setTempItems(tempItems.filter(item => item.tempId !== tempId));
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

  const readyItemsCount = localPedido?.items.filter((item) => getItemStatus(item.id, item.estaLista)).length || 0;
  const allItemsReady = localPedido ? readyItemsCount === localPedido.items.length : false;
  const hasChanges = pendingChanges.size > 0 || tempItems.length > 0 || deletedItemIds.length > 0 || hasClientChanges;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <div>
            <DialogTitle className="text-xl sm:text-2xl">
              {isLoading || !localPedido ? "Cargando..." : `Pedido #${localPedido.codigo}`}
            </DialogTitle>
            {localPedido && (
              <p className="text-sm text-muted-foreground mt-1">
                Creado el {formatDate(localPedido.fechaCreacion)}
              </p>
            )}
          </div>
        </DialogHeader>

        {isLoading || !localPedido ? (
          <PedidoDetailSkeleton />
        ) : (
          <>
            <div className="space-y-6">
              {/* Estado del pedido */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <span className="font-medium">Estado del pedido:</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-md font-medium">
                    {getEstadoLabel(localPedido.estado)}
                  </span>
                </div>
                {allItemsReady && localPedido.estado !== PedidoEstado.ENTREGADO && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">Todos los items listos</span>
                  </div>
                )}
              </div>

              {/* Información del cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">Información del Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="nombre" className="text-xs">Nombre *</Label>
                      <Input
                        id="nombre"
                        value={clienteNombre}
                        onChange={(e) => handleClientInfoChange('nombre', e.target.value)}
                        className="h-8"
                        disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                        placeholder="Nombre del cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="apellido" className="text-xs">Apellido</Label>
                      <Input
                        id="apellido"
                        value={clienteApellido}
                        onChange={(e) => handleClientInfoChange('apellido', e.target.value)}
                        className="h-8"
                        disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                        placeholder="Apellido del cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefono" className="text-xs">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={clienteTelefono}
                        onChange={(e) => handleClientInfoChange('telefono', e.target.value)}
                        className="h-8"
                        disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                        placeholder="+56912345678"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-xs">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={clienteEmail}
                        onChange={(e) => handleClientInfoChange('email', e.target.value)}
                        className="h-8"
                        disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                        placeholder="cliente@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-base sm:text-lg">Detalles del Pedido</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Año: {localPedido.anio}</span>
                    </div>
                    {localPedido.fechaEntrega && (
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Entrega: {formatDate(localPedido.fechaEntrega)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items del pedido */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-semibold text-base sm:text-lg">Items del Pedido</h3>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    {readyItemsCount} de {localPedido.items.length - deletedItemIds.length + tempItems.length} listos
                    {(tempItems.length > 0 || deletedItemIds.length > 0) && (
                      <span className="ml-2 text-orange-600">
                        ({tempItems.length > 0 && `+${tempItems.length} nuevo${tempItems.length > 1 ? 's' : ''}`}
                        {tempItems.length > 0 && deletedItemIds.length > 0 && ', '}
                        {deletedItemIds.length > 0 && `-${deletedItemIds.length} eliminado${deletedItemIds.length > 1 ? 's' : ''}`})
                      </span>
                    )}
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden overflow-x-auto">
                  <table className="w-full min-w-[640px]">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Colegio</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Prenda</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Talla</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Cant.</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">P. Unit.</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Subtotal</th>
                        <th className="px-4 py-3 text-center text-sm font-medium">Lista</th>
                        {localPedido.estado !== PedidoEstado.ENTREGADO && (
                          <th className="px-4 py-3 text-center text-sm font-medium">Acción</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {/* Existing items (not deleted) */}
                      {localPedido.items
                        .filter((item) => !deletedItemIds.includes(item.id))
                        .map((item) => {
                          const isReady = getItemStatus(item.id, item.estaLista);
                          const hasChange = pendingChanges.has(item.id);
                          return (
                            <tr key={item.id} className={isReady ? "bg-green-50" : ""}>
                              <td className="px-4 py-3 text-sm">{colegios.find(c => c.id === item.colegioId)?.nombre || "N/A"}</td>
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
                                    disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                                  />
                                  {hasChange && (
                                    <span className="text-xs text-orange-600">*</span>
                                  )}
                                </div>
                              </td>
                              {localPedido.estado !== PedidoEstado.ENTREGADO && (
                                <td className="px-4 py-3 text-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteItem(item.id)}
                                    disabled={isSaving}
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </td>
                              )}
                            </tr>
                          );
                        })}

                      {/* Temporary items (new, not yet saved) */}
                      {tempItems.map((item) => (
                        <tr key={item.tempId} className="bg-blue-50">
                          <td className="px-4 py-3 text-sm">{item.colegioNombre}</td>
                          <td className="px-4 py-3 text-sm">{item.prendaNombre}</td>
                          <td className="px-4 py-3 text-sm">{item.tallaNombre}</td>
                          <td className="px-4 py-3 text-sm text-center">{item.cantidad}</td>
                          <td className="px-4 py-3 text-sm text-right">
                            {formatCurrency(item.precioUnitario)}
                          </td>
                          <td className="px-4 py-3 text-sm text-right font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-xs text-blue-600">Nuevo</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTempItem(item.tempId)}
                              disabled={isSaving}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Item Button/Form */}
                {localPedido.estado !== PedidoEstado.ENTREGADO && (
                  <div className="mt-4">
                    {!isAddingItem ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsAddingItem(true)}
                        disabled={isSaving}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Item
                      </Button>
                    ) : (
                      <div className="border rounded-lg p-3 sm:p-4 space-y-4 bg-muted/30">
                        <h4 className="font-medium text-sm">Agregar Nuevo Item</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div>
                            <Label className="text-xs">Colegio</Label>
                            <Select value={selectedColegio} onValueChange={setSelectedColegio}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {colegios.map((colegio) => (
                                  <SelectItem key={colegio.id} value={colegio.id.toString()}>
                                    {colegio.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Prenda</Label>
                            <Select value={selectedPrenda} onValueChange={setSelectedPrenda}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {prendas.map((prenda) => (
                                  <SelectItem key={prenda.id} value={prenda.id.toString()}>
                                    {prenda.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Talla</Label>
                            <Select value={selectedTalla} onValueChange={setSelectedTalla}>
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Seleccione" />
                              </SelectTrigger>
                              <SelectContent>
                                {tallas.map((talla) => (
                                  <SelectItem key={talla.id} value={talla.id.toString()}>
                                    {talla.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              value={cantidad}
                              onChange={(e) => setCantidad(e.target.value)}
                              className="h-9"
                              disabled={isSaving}
                              required
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button
                              size="sm"
                              onClick={handleAddItem}
                              disabled={isSaving}
                              className="h-9"
                            >
                              {isSaving ? (
                                <>Guardando...</>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Guardar
                                </>
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelAddItem}
                              disabled={isSaving}
                              className="h-9"
                            >
                              ✕
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-80 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Total:</span>
                      <span className="font-semibold">{formatCurrency(localPedido.total)}</span>
                    </div>

                    {/* Abono - Editable */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <Label htmlFor="abono">Abono:</Label>
                        {!isEditingAbono && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingAbono(true)}
                            disabled={isSaving || localPedido.estado === PedidoEstado.ENTREGADO}
                            className="h-6 px-2"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {isEditingAbono ? (
                        <div className="flex gap-2">
                          <Input
                            id="abono"
                            type="number"
                            min="0"
                            max={localPedido.total}
                            step="1"
                            value={abonoValue}
                            onChange={(e) => setAbonoValue(e.target.value)}
                            className="h-8"
                            disabled={isSaving}
                            required
                          />
                          <Button
                            size="sm"
                            onClick={handleSaveAbono}
                            disabled={isSaving}
                            className="h-8"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelEditAbono}
                            disabled={isSaving}
                            className="h-8"
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="text-right text-green-600 font-medium">
                          {formatCurrency(localPedido.abono)}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between text-lg font-bold border-t pt-2">
                      <span>Saldo:</span>
                      <span className={localPedido.saldo > 0 ? "text-red-600" : "text-green-600"}>
                        {formatCurrency(localPedido.saldo)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              {localPedido.estado !== PedidoEstado.ENTREGADO && allItemsReady && (
                <Button
                  onClick={handleMarcarEntregado}
                  disabled={isSaving}
                  variant="default"
                  className="transition-all duration-200"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    "Marcar como Entregado"
                  )}
                </Button>
              )}
              <Button
                onClick={handleSaveChanges}
                disabled={isSaving || !hasChanges}
                variant="default"
                className="transition-all duration-200"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
