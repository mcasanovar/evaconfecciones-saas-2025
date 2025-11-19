"use client";

import { useState } from "react";
import { Colegio, Prenda, Talla } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { PrecioDialog } from "./precio-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deletePrecio } from "@/actions/precios";
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

interface PreciosTableProps {
  precios: PrecioWithRelations[];
  colegios: Colegio[];
  prendas: Prenda[];
  tallas: Talla[];
  onRefresh: () => void;
}

export function PreciosTable({ precios, colegios, prendas, tallas, onRefresh }: PreciosTableProps) {
  const [search, setSearch] = useState("");
  const [editingPrecio, setEditingPrecio] = useState<PrecioWithRelations | null>(null);
  const [deletingPrecio, setDeletingPrecio] = useState<PrecioWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredPrecios = precios.filter((precio) => {
    const searchLower = search.toLowerCase();
    return (
      precio.colegio.nombre.toLowerCase().includes(searchLower) ||
      precio.prenda.nombre.toLowerCase().includes(searchLower) ||
      precio.talla.nombre.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (precio: PrecioWithRelations) => {
    setEditingPrecio(precio);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPrecio) return;

    const result = await deletePrecio(
      deletingPrecio.colegioId,
      deletingPrecio.prendaId,
      deletingPrecio.tallaId
    );

    if (result.success) {
      toast({
        title: "Precio eliminado",
        description: "El precio ha sido eliminado correctamente.",
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
    setDeletingPrecio(null);
  };

  const handleDialogClose = (success: boolean) => {
    setIsDialogOpen(false);
    setEditingPrecio(null);
    if (success) {
      onRefresh();
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(price);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por colegio, prenda o talla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Precio
        </Button>
      </div>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Colegio</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Prenda</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Talla</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Precio</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPrecios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No se encontraron precios
                  </td>
                </tr>
              ) : (
                filteredPrecios.map((precio) => (
                  <tr key={precio.id} className="hover:bg-muted/50">
                    <td className="px-4 py-3">{precio.colegio.nombre}</td>
                    <td className="px-4 py-3">{precio.prenda.nombre}</td>
                    <td className="px-4 py-3">{precio.talla.nombre}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatPrice(precio.precio)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(precio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingPrecio(precio);
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
      <PrecioDialog
        precio={editingPrecio}
        colegios={colegios}
        prendas={prendas}
        tallas={tallas}
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
      />

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
        title="¿Eliminar precio?"
        description={`¿Estás seguro de que deseas eliminar el precio de "${deletingPrecio?.prenda.nombre}" (${deletingPrecio?.talla.nombre}) para "${deletingPrecio?.colegio.nombre}"?`}
      />
    </div>
  );
}
