"use client";

import { useState, useEffect } from "react";
import { Colegio, Prenda, Talla } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
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
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery?: string;
  onPageChange: (page: number) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

export function PreciosTable({
  precios,
  colegios,
  prendas,
  tallas,
  currentPage,
  totalPages,
  totalItems,
  searchQuery = "",
  onPageChange,
  onSearchQueryChange,
  onSearch,
  onRefresh
}: PreciosTableProps) {
  const [search, setSearch] = useState(searchQuery);
  const [editingPrecio, setEditingPrecio] = useState<PrecioWithRelations | null>(null);
  const [deletingPrecio, setDeletingPrecio] = useState<PrecioWithRelations | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  const handleSearchInputChange = (value: string) => {
    setSearch(value);
    onSearchQueryChange(value);
  };

  const handleSearch = () => {
    onSearch(search);
  };

  const handleClear = () => {
    setSearch("");
    onSearchQueryChange("");
    onSearch("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por colegio, prenda o talla..."
              value={search}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch} variant="secondary" size="sm" className="flex-1 sm:flex-none">
              Buscar
            </Button>
            <Button onClick={handleClear} variant="outline" size="sm" className="flex-1 sm:flex-none">
              Limpiar
            </Button>
          </div>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Precio
        </Button>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
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
              {precios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No se encontraron precios con ese criterio" : "No hay precios registrados"}
                  </td>
                </tr>
              ) : (
                precios.map((precio) => (
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {precios.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            {search ? "No se encontraron precios con ese criterio" : "No hay precios registrados"}
          </Card>
        ) : (
          precios.map((precio) => (
            <Card key={precio.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 space-y-2">
                  <h3 className="font-medium text-base truncate">{precio.colegio.nombre}</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{precio.prenda.nombre} - {precio.talla.nombre}</p>
                  </div>
                  <div className="text-lg font-semibold text-primary">
                    {formatPrice(precio.precio)}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(precio)}
                    className="h-9 w-9 p-0"
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
                    className="h-9 w-9 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <PaginationInfo
            currentPage={currentPage}
            itemsPerPage={20}
            totalItems={totalItems}
          />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}

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
