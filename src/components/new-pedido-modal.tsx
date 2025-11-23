"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    if (!clienteNombre || items.length === 0) {
      toast({
        title: "Error",
        description: "Complete los campos requeridos y agregue al menos un item",
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
          title: "Pedido creado",
          description: `Pedido #${result.pedido?.codigo} creado exitosamente`,
        });
        handleReset();
        onSuccess();
        onOpenChange(false);
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
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setClienteNombre("");
    setClienteApellido("");
    setClienteTelefono("");
    setClienteEmail("");
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nuevo Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información del Cliente</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clienteNombre">Nombre *</Label>
                <Input
                  id="clienteNombre"
                  value={clienteNombre}
                  onChange={(e) => setClienteNombre(e.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>
              <div>
                <Label htmlFor="clienteApellido">Apellido</Label>
                <Input
                  id="clienteApellido"
                  value={clienteApellido}
                  onChange={(e) => setClienteApellido(e.target.value)}
                  placeholder="Apellido del cliente"
                />
              </div>
              <div>
                <Label htmlFor="clienteTelefono">Teléfono</Label>
                <Input
                  id="clienteTelefono"
                  value={clienteTelefono}
                  onChange={(e) => setClienteTelefono(e.target.value)}
                  placeholder="+56 9 1234 5678"
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
                />
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información del Pedido</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={anio}
                  onChange={(e) => setAnio(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fechaEntrega">Fecha Entrega</Label>
                <Input
                  id="fechaEntrega"
                  type="date"
                  value={fechaEntrega}
                  onChange={(e) => setFechaEntrega(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Add Items */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Agregar Items</h3>
            <div className="grid grid-cols-5 gap-4">
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
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
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
              <h3 className="font-semibold text-lg">Items del Pedido</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
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
                      value={abono}
                      onChange={(e) => setAbono(e.target.value)}
                      placeholder="0"
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || items.length === 0}>
            {isSubmitting ? "Creando..." : "Crear Pedido"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
