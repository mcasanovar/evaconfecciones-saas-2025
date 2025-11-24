"use client";

import { useState, useEffect } from "react";
import { Colegio } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Pagination, PaginationInfo } from "@/components/ui/pagination";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { ColegioDialog } from "./colegio-dialog";
import { DeleteDialog } from "./delete-dialog";
import { deleteColegio } from "@/actions/colegios";
import { useToast } from "@/hooks/use-toast";

interface ColegiosTableProps {
  colegios: Colegio[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  searchQuery?: string;
  onPageChange: (page: number) => void;
  onSearchQueryChange: (query: string) => void;
  onSearch: (search: string) => void;
  onRefresh: () => void;
}

export function ColegiosTable({
  colegios,
  currentPage,
  totalPages,
  totalItems,
  searchQuery = "",
  onPageChange,
  onSearchQueryChange,
  onSearch,
  onRefresh,
}: ColegiosTableProps) {
  const [search, setSearch] = useState(searchQuery);
  const [editingColegio, setEditingColegio] = useState<Colegio | null>(null);
  const [deletingColegio, setDeletingColegio] = useState<Colegio | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Sync local search with prop
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
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar colegio..."
              value={search}
              onChange={(e) => handleSearchInputChange(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch} variant="secondary" size="sm">
            Buscar
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm">
            Limpiar
          </Button>
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
              {colegios.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    {search ? "No se encontraron colegios con ese criterio" : "No hay colegios registrados"}
                  </td>
                </tr>
              ) : (
                colegios.map((colegio) => (
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
