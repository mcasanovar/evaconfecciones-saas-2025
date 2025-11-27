"use client";

import { useState, useEffect } from "react";
import { Prenda } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { PrendaDialog } from "./prenda-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deletePrenda } from "@/actions/prendas";
import { useToast } from "@/hooks/use-toast";

interface PrendasTableProps {
  prendas: Prenda[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery?: string;
  onPageChange: (page: number) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

export function PrendasTable({
  prendas,
  currentPage,
  totalPages,
  totalItems,
  searchQuery = "",
  onPageChange,
  onSearchQueryChange,
  onSearch,
  onRefresh,
}: PrendasTableProps) {
  const [search, setSearch] = useState(searchQuery);
  const [editingPrenda, setEditingPrenda] = useState<Prenda | null>(null);
  const [deletingPrenda, setDeletingPrenda] = useState<Prenda | null>(null);
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
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar prenda..."
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
          Nueva Prenda
        </Button>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block">
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
              {prendas.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No se encontraron prendas con ese criterio" : "No hay prendas registradas"}
                  </td>
                </tr>
              ) : (
                prendas.map((prenda) => (
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {prendas.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            {search ? "No se encontraron prendas con ese criterio" : "No hay prendas registradas"}
          </Card>
        ) : (
          prendas.map((prenda) => (
            <Card key={prenda.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-base truncate">{prenda.nombre}</h3>
                  {prenda.descripcion && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {prenda.descripcion}
                    </p>
                  )}
                  <div className="mt-2">
                    <Badge variant={prenda.activo ? "default" : "secondary"}>
                      {prenda.activo ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(prenda)}
                    className="h-9 w-9 p-0"
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
