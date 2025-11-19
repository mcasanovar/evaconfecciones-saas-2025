"use client";

import { useState } from "react";
import { Colegio } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { ColegioDialog } from "./colegio-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deleteColegio } from "@/actions/colegios";
import { useToast } from "@/hooks/use-toast";

interface ColegiosTableProps {
  colegios: Colegio[];
  onRefresh: () => void;
}

export function ColegiosTable({ colegios, onRefresh }: ColegiosTableProps) {
  const [search, setSearch] = useState("");
  const [editingColegio, setEditingColegio] = useState<Colegio | null>(null);
  const [deletingColegio, setDeletingColegio] = useState<Colegio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredColegios = colegios.filter((colegio) =>
    colegio.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (colegio: Colegio) => {
    setEditingColegio(colegio);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingColegio) return;

    const result = await deleteColegio(deletingColegio.id);

    if (result.success) {
      toast({
        title: "Colegio eliminado",
        description: "El colegio ha sido eliminado correctamente.",
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
    setDeletingColegio(null);
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    setEditingColegio(null);
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
            placeholder="Buscar colegio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Colegio
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Nombre</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredColegios.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron colegios
                  </td>
                </tr>
              ) : (
                filteredColegios.map((colegio) => (
                  <tr key={colegio.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{colegio.nombre}</td>
                    <td className="px-4 py-3">
                      <Badge variant={colegio.activo ? "default" : "secondary"}>
                        {colegio.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(colegio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingColegio(colegio);
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
      <ColegioDialog
        colegio={editingColegio}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="¿Eliminar colegio?"
        description={`¿Estás seguro de que deseas eliminar "${deletingColegio?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
