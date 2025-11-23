"use client";

import { useState, useEffect } from "react";
import { Colegio, Prenda, Talla } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createPrecio, updatePrecio } from "@/actions/precios";
import { useToast } from "@/hooks/use-toast";

type PrecioWithRelations = {
  id: number;
  colegioId: number;
  prendaId: number;
  tallaId: number;
  precio: number;
  colegio: Colegio;
  prenda: Prenda;
  talla: Talla;
};

interface PrecioDialogProps {
  precio: PrecioWithRelations | null;
  colegios: Colegio[];
  prendas: Prenda[];
  tallas: Talla[];
  open: boolean;
  onOpenChange: (success: boolean) => void;
}

export function PrecioDialog({ precio, colegios, prendas, tallas, open, onOpenChange }: PrecioDialogProps) {
  const [colegioId, setColegioId] = useState<string>("");
  const [prendaId, setPrendaId] = useState<string>("");
  const [tallaId, setTallaId] = useState<string>("");
  const [precioValue, setPrecioValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (precio) {
      setColegioId(precio.colegioId.toString());
      setPrendaId(precio.prendaId.toString());
      setTallaId(precio.tallaId.toString());
      setPrecioValue(precio.precio.toString());
    } else {
      setColegioId("");
      setPrendaId("");
      setTallaId("");
      setPrecioValue("");
    }
  }, [precio, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!colegioId || !prendaId || !tallaId || !precioValue) {
      toast({
        title: "Error",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    const precioNum = parseFloat(precioValue);
    if (isNaN(precioNum) || precioNum <= 0) {
      toast({
        title: "Error",
        description: "El precio debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = precio
        ? await updatePrecio(
          parseInt(colegioId),
          parseInt(prendaId),
          parseInt(tallaId),
          precioNum
        )
        : await createPrecio({
          colegioId: parseInt(colegioId),
          prendaId: parseInt(prendaId),
          tallaId: parseInt(tallaId),
          precio: precioNum,
        });

      if (result.success) {
        toast({
          title: precio ? "Precio actualizado" : "Precio creado",
          description: `El precio ha sido ${precio ? "actualizado" : "creado"} correctamente.`,
        });
        onOpenChange(true);
      } else {
        toast({
          title: "Error",
          description: result.error,
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
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{precio ? "Editar Precio" : "Nuevo Precio"}</DialogTitle>
            <DialogDescription>
              {precio
                ? "Modifica el precio"
                : "Ingresa los datos del nuevo precio"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="colegio">Colegio *</Label>
              <Select
                value={colegioId}
                onValueChange={setColegioId}
                disabled={!!precio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar colegio..." />
                </SelectTrigger>
                <SelectContent>
                  {colegios.filter(c => c.activo).map((colegio) => (
                    <SelectItem key={colegio.id} value={colegio.id.toString()}>
                      {colegio.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prenda">Prenda *</Label>
              <Select
                value={prendaId}
                onValueChange={setPrendaId}
                disabled={!!precio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar prenda..." />
                </SelectTrigger>
                <SelectContent>
                  {prendas.filter(p => p.activo).map((prenda) => (
                    <SelectItem key={prenda.id} value={prenda.id.toString()}>
                      {prenda.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="talla">Talla *</Label>
              <Select
                value={tallaId}
                onValueChange={setTallaId}
                disabled={!!precio}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar talla..." />
                </SelectTrigger>
                <SelectContent>
                  {tallas.filter(t => t.activo).map((talla) => (
                    <SelectItem key={talla.id} value={talla.id.toString()}>
                      {talla.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio (CLP) *</Label>
              <Input
                id="precio"
                type="number"
                step="1"
                min="0"
                value={precioValue}
                onChange={(e) => setPrecioValue(e.target.value)}
                placeholder="Ej: 15000"
                required
              />
            </div>

            {precio && (
              <p className="text-xs text-muted-foreground">
                Nota: No se puede cambiar el colegio, prenda o talla. Solo el precio.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
