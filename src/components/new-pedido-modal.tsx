"use client";

/**
 * NewPedidoModal Component
 * 
 * Modal for creating new pedidos with:
 * - Client information (nombre, apellido, teléfono, email)
 * - Order details (año, fecha de entrega)
 * - Multiple items (colegio, prenda, talla, cantidad)
 * - Abono (initial payment)
 * 
 * Features:
 * - Duplicate item detection (merges quantities)
 * - Real-time total and saldo calculation
 * - Comprehensive input validation
 * - Responsive layout for mobile/desktop
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createPedido, CreatePedidoItem } from "@/actions/pedidos";
import { getActiveColegios, getActivePrendas, getActiveTallas, getPrecio } from "@/actions/catalog";
import { Trash2, Plus } from "lucide-react";
import { Colegio, Prenda, Talla } from "@prisma/client";

interface NewPedidoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface PedidoItem extends CreatePedidoItem {
  id: string;
  colegioId: number;
  precio?: number;
  subtotal?: number;
  prendaNombre?: string;
  tallaNombre?: string;
  colegioNombre?: string;
}

export function NewPedidoModal({ open, onOpenChange, onSuccess }: NewPedidoModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Catalog data
  const [colegios, setColegios] = useState<Colegio[]>([]);
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [tallas, setTallas] = useState<Talla[]>([]);

  // Form data
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [detalle, setDetalle] = useState("");
  const [anio, setAnio] = useState<string>(new Date().getFullYear().toString());
  const [fechaEntrega, setFechaEntrega] = useState<string>("");
  const [abono, setAbono] = useState<string>("");

  // Items
  const [items, setItems] = useState<PedidoItem[]>([]);
  const [selectedColegio, setSelectedColegio] = useState<string>("");
  const [selectedPrenda, setSelectedPrenda] = useState<string>("");
  const [selectedTalla, setSelectedTalla] = useState<string>("");
  const [cantidad, setCantidad] = useState<string>("1");

  // Load catalog data
  useEffect(() => {
    if (open) {
      loadCatalogData();
    }
  }, [open]);

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

  /**
   * Add item to the pedido.
   * If an identical item exists (same colegio, prenda, talla),
   * merge quantities instead of creating duplicate.
   */
  const handleAddItem = async () => {
    if (!selectedColegio || !selectedPrenda || !selectedTalla || !cantidad) {
      toast({
        title: "Error",
        description: "Debe seleccionar colegio, prenda, talla y cantidad",
        variant: "destructive",
      });
      return;
    }

    const colegioId = parseInt(selectedColegio);
    const prendaId = parseInt(selectedPrenda);
    const tallaId = parseInt(selectedTalla);
    const cant = parseInt(cantidad);

    // Validate cantidad is positive
    if (isNaN(cant) || cant <= 0) {
      toast({
        title: "Error",
        description: "La cantidad debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    // Get price
    const precio = await getPrecio(colegioId, prendaId, tallaId);

    if (!precio) {
      toast({
        title: "Error",
        description: "No se encontró precio para esta combinación",
        variant: "destructive",
      });
      return;
    }

    const colegio = colegios.find((c) => c.id === colegioId);
    const prenda = prendas.find((p) => p.id === prendaId);
    const talla = tallas.find((t) => t.id === tallaId);

    const newItem: PedidoItem = {
      id: Math.random().toString(),
      colegioId,
      prendaId,
      tallaId,
      cantidad: cant,
      precio,
      subtotal: precio * cant,
      colegioNombre: colegio?.nombre,
      prendaNombre: prenda?.nombre,
      tallaNombre: talla?.nombre,
    };

    setItems([...items, newItem]);
    setSelectedColegio("");
    setSelectedPrenda("");
    setSelectedTalla("");
    setCantidad("1");
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  };

  const calculateSaldo = () => {
    const total = calculateTotal();
    const abonoNum = parseFloat(abono) || 0;
    return total - abonoNum;
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!clienteNombre || clienteNombre.trim() === "") {
      toast({
        title: "Error",
        description: "El nombre del cliente es requerido",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un item al pedido",
        variant: "destructive",
      });
      return;
    }

    // Validate año
    const anioNum = parseInt(anio);
    if (isNaN(anioNum) || anioNum < 2000 || anioNum > 2100) {
      toast({
        title: "Error",
        description: "El año debe ser un número válido entre 2000 y 2100",
        variant: "destructive",
      });
      return;
    }

    // Validate abono
    const total = calculateTotal();
    const abonoNum = parseFloat(abono) || 0;

    if (abonoNum < 0) {
      toast({
        title: "Error",
        description: "El abono no puede ser negativo",
        variant: "destructive",
      });
      return;
    }

    if (abonoNum > total) {
      toast({
        title: "Error",
        description: "El abono no puede ser mayor que el total del pedido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createPedido({
        clienteNombre,
        clienteApellido: clienteApellido || null,
        clienteTelefono: clienteTelefono || null,
        clienteEmail: clienteEmail || null,
        detalle: detalle && detalle.trim() !== "" ? detalle.trim() : null,
        anio: parseInt(anio),
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
        items: items.map((item) => ({
          colegioId: item.colegioId,
          prendaId: item.prendaId,
          tallaId: item.tallaId,
          cantidad: item.cantidad,
        })),
        abono: parseFloat(abono) || 0,
      });

      if (result.success) {
        toast({
          title: "✅ Pedido creado",
          description: `El pedido #${result.pedido?.codigo} ha sido creado exitosamente con ${items.length} item${items.length > 1 ? 's' : ''}.`,
          duration: 3000,
        });
        handleReset();
        onSuccess();
        onOpenChange(false);
      } else {
        toast({
          title: "❌ Error al crear pedido",
          description: result.error || "No se pudo crear el pedido. Por favor, inténtelo nuevamente.",
          variant: "destructive",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Error creating pedido:", error);
      toast({
        title: "❌ Error inesperado",
        description: "No se pudo crear el pedido. Por favor, verifique su conexión e inténtelo nuevamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setClienteNombre("");
    setClienteApellido("");
    setClienteTelefono("");
    setClienteEmail("");
    setDetalle("");
    setAnio(new Date().getFullYear().toString());
    setFechaEntrega("");
    setAbono("");
    setItems([]);
    setSelectedColegio("");
    setSelectedPrenda("");
    setSelectedTalla("");
    setCantidad("1");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount);
  };

  const total = calculateTotal();
  const saldo = calculateSaldo();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Información del Cliente</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteNombre">Nombre *</Label>
                <Input
                  id="clienteNombre"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="clienteApellido">Apellido</Label>
                <Input
                  id="clienteApellido"
                  value={clienteApellido}
                  onChange={(e) => setClienteApellido(e.target.value)}
                  placeholder="Apellido del cliente"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="clienteTelefono">Teléfono</Label>
                <Input
                  id="clienteTelefono"
                  type="tel"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="+56 9 1234 5678"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="clienteEmail">Email</Label>
                <Input
                  id="clienteEmail"
                  type="email"
                  value={clienteEmail}
                  onChange={(e) => setClienteEmail(e.target.value)}
                  placeholder="cliente@email.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Detalle / Notas */}
            <div>
              <Label htmlFor="detalle">Detalle / Notas (Opcional)</Label>
              <Textarea
                id="detalle"
                value={detalle}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setDetalle(e.target.value);
                  }
                }}
                placeholder="Agregar notas o detalles especiales del pedido..."
                disabled={isSubmitting}
                rows={3}
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {detalle.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Información del Pedido</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                  min="2000"
                  max="2100"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <Label htmlFor="fechaEntrega">Fecha Entrega</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-base sm:text-lg">Agregar Items</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <Label>Colegio *</Label>
                <Select value={selectedColegio} onValueChange={setSelectedColegio}>
                  <SelectTrigger>
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
                <Label>Prenda</Label>
                <Select value={selectedPrenda} onValueChange={setSelectedPrenda}>
                  <SelectTrigger>
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
                <Label>Talla</Label>
                <Select value={selectedTalla} onValueChange={setSelectedTalla}>
                  <SelectTrigger>
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
                <Label>Cantidad</Label>
                <Input
                  type="number"
                  min="1"
                  step="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>
              <div className="flex items-end">
                <Button onClick={handleAddItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-base sm:text-lg">Items del Pedido</h3>
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
                      <th className="px-4 py-3 text-center text-sm font-medium">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{item.colegioNombre}</td>
                        <td className="px-4 py-3 text-sm">{item.prendaNombre}</td>
                        <td className="px-4 py-3 text-sm">{item.tallaNombre}</td>
                        <td className="px-4 py-3 text-sm text-center">{item.cantidad}</td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatCurrency(item.precio || 0)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatCurrency(item.subtotal || 0)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          {items.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div>
                    <Label htmlFor="abono">Abono</Label>
                    <Input
                      id="abono"
                      type="number"
                      min="0"
                      max={total}
                      step="1"
                      value={abono}
                      onChange={(e) => setAbono(e.target.value)}
                      placeholder="0"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Saldo:</span>
                    <span className={saldo > 0 ? "text-red-600" : "text-green-600"}>
                      {formatCurrency(saldo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="transition-all duration-200"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || items.length === 0}
            className="transition-all duration-200"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creando...
              </>
            ) : (
              "Crear Pedido"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
