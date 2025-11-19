"use client";

import { useState } from "react";
import { Prenda } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { PrendaDialog } from "./prenda-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deletePrenda } from "@/actions/prendas";
import { useToast } from "@/hooks/use-toast";

interface PrendasTableProps {
  prendas: Prenda[];
  onRefresh: () => void;
}

export function PrendasTable({ prendas, onRefresh }: PrendasTableProps) {
  const [search, setSearch] = useState("");
  const [editingPrenda, setEditingPrenda] = useState<Prenda | null>(null);
  const [deletingPrenda, setDeletingPrenda] = useState<Prenda | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredPrendas = prendas.filter((prenda) =>
    prenda.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (prenda: Prenda) => {
    setEditingPrenda(prenda);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPrenda) return;

    const result = await deletePrenda(deletingPrenda.id);

    if (result.success) {
      toast({
        title: "Prenda eliminada",
        description: "La prenda ha sido eliminada correctamente.",
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
    setDeletingPrenda(null);
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    setEditingPrenda(null);
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
            placeholder="Buscar prenda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Prenda
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Descripción</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPrendas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron prendas
                  </td>
                </tr>
              ) : (
                filteredPrendas.map((prenda) => (
                  <tr key={prenda.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{prenda.nombre}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {prenda.descripcion || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={prenda.activo ? "default" : "secondary"}>
                        {prenda.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(prenda)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingPrenda(prenda);
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
      <PrendaDialog
        prenda={editingPrenda}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="¿Eliminar prenda?"
        description={`¿Estás seguro de que deseas eliminar "${deletingPrenda?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
