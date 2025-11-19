"use client";

import { useState, useEffect } from "react";
import { Talla } from "@prisma/client";
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
import { createTalla, updateTalla } from "@/actions/tallas";
import { useToast } from "@/hooks/use-toast";

interface TallaDialogProps {
  talla: Talla | null;
  open: boolean;
  onOpenChange: (success: boolean) => void;
}

export function TallaDialog({ talla, open, onOpenChange }: TallaDialogProps) {
  const [nombre, setNombre] = useState("");
  const [orden, setOrden] = useState(0);
  const [activo, setActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (talla) {
      setNombre(talla.nombre);
      setOrden(talla.orden ?? 0);
      setActivo(talla.activo);
    } else {
      setNombre("");
      setOrden(0);
      setActivo(true);
    }
  }, [talla, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = talla
        ? await updateTalla(talla.id, { nombre, orden, activo })
        : await createTalla({ nombre, orden, activo });

      if (result.success) {
        toast({
          title: talla ? "Talla actualizada" : "Talla creada",
          description: `La talla ha sido ${talla ? "actualizada" : "creada"} correctamente.`,
        });
        onOpenChange(true);
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

  return (
    <Dialog open={open} onOpenChange={() => onOpenChange(false)}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{talla ? "Editar Talla" : "Nueva Talla"}</DialogTitle>
            <DialogDescription>
              {talla
                ? "Modifica los datos de la talla"
                : "Ingresa los datos de la nueva talla"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: M"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="orden">Orden</Label>
              <Input
                id="orden"
                type="number"
                value={orden}
                onChange={(e) => setOrden(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground">
                Orden de visualización (menor primero)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activo"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="activo" className="cursor-pointer">
                Activo
              </Label>
            </div>
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
