"use client";

import { useState, useEffect } from "react";
import { Prenda } from "@prisma/client";
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
import { createPrenda, updatePrenda } from "@/actions/prendas";
import { useToast } from "@/hooks/use-toast";

interface PrendaDialogProps {
  prenda: Prenda | null;
  open: boolean;
  onOpenChange: (success: boolean) => void;
}

export function PrendaDialog({ prenda, open, onOpenChange }: PrendaDialogProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (prenda) {
      setNombre(prenda.nombre);
      setDescripcion(prenda.descripcion || "");
      setActivo(prenda.activo);
    } else {
      setNombre("");
      setDescripcion("");
      setActivo(true);
    }
  }, [prenda, open]);

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
      const result = prenda
        ? await updatePrenda(prenda.id, { nombre, descripcion: descripcion || undefined, activo })
        : await createPrenda({ nombre, descripcion: descripcion || undefined, activo });

      if (result.success) {
        toast({
          title: prenda ? "Prenda actualizada" : "Prenda creada",
          description: `La prenda ha sido ${prenda ? "actualizada" : "creada"} correctamente.`,
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
            <DialogTitle>{prenda ? "Editar Prenda" : "Nueva Prenda"}</DialogTitle>
            <DialogDescription>
              {prenda
                ? "Modifica los datos de la prenda"
                : "Ingresa los datos de la nueva prenda"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Camisa"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Input
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Camisa blanca manga larga"
              />
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
