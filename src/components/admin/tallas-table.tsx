"use client";

import { useState } from "react";
import { Talla } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { TallaDialog } from "./talla-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deleteTalla } from "@/actions/tallas";
import { useToast } from "@/hooks/use-toast";

interface TallasTableProps {
  tallas: Talla[];
  onRefresh: () => void;
}

export function TallasTable({ tallas, onRefresh }: TallasTableProps) {
  const [search, setSearch] = useState("");
  const [editingTalla, setEditingTalla] = useState<Talla | null>(null);
  const [deletingTalla, setDeletingTalla] = useState<Talla | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredTallas = tallas.filter((talla) =>
    talla.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (talla: Talla) => {
    setEditingTalla(talla);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTalla) return;

    const result = await deleteTalla(deletingTalla.id);

    if (result.success) {
      toast({
        title: "Talla eliminada",
        description: "La talla ha sido eliminada correctamente.",
      });
      onRefresh();
    } else {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    }

    setIsDeleteDialogOpen(false);
    setDeletingTalla(null);
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    setEditingTalla(null);
    if (success) {
      onRefresh();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar talla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Talla
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Orden</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredTallas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron tallas
                  </td>
                </tr>
              ) : (
                filteredTallas.map((talla) => (
                  <tr key={talla.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{talla.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">{talla.orden}</td>
                    <td className="px-4 py-3">
                      <Badge variant={talla.activo ? "default" : "secondary"}>
                        {talla.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(talla)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingTalla(talla);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialogs */}
      <TallaDialog
        talla={editingTalla}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="¿Eliminar talla?"
        description={`¿Estás seguro de que deseas eliminar "${deletingTalla?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
