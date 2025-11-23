"use client";

import { useState, useEffect } from "react";
import { Colegio } from "@prisma/client";
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
import { createColegio, updateColegio } from "@/actions/colegios";
import { useToast } from "@/hooks/use-toast";

interface ColegioDialogProps {
  colegio: Colegio | null;
  open: boolean;
  onOpenChange: (success: boolean) => void;
}

export function ColegioDialog({ colegio, open, onOpenChange }: ColegioDialogProps) {
  const [nombre, setNombre] = useState("");
  const [activo, setActivo] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (colegio) {
      setNombre(colegio.nombre);
      setActivo(colegio.activo);
    } else {
      setNombre("");
      setActivo(true);
    }
  }, [colegio, open]);

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
      const result = colegio
        ? await updateColegio(colegio.id, { nombre, activo })
        : await createColegio({ nombre, activo });

      if (result.success) {
        toast({
          title: colegio ? "Colegio actualizado" : "Colegio creado",
          description: `El colegio ha sido ${colegio ? "actualizado" : "creado"} correctamente.`,
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
            <DialogTitle>{colegio ? "Editar Colegio" : "Nuevo Colegio"}</DialogTitle>
            <DialogDescription>
              {colegio
                ? "Modifica los datos del colegio"
                : "Ingresa los datos del nuevo colegio"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Colegio San José"
                required
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
