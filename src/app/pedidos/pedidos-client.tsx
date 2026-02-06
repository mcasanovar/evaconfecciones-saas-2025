"use client";

import { useEffect, useState } from "react";
import { useOrders } from "@/contexts/orders-context";
import { Header } from "@/components/header";
import { PedidosFilters } from "@/components/pedidos-filters";
import { PedidoCard, PedidoCardSkeleton } from "@/components/pedido-card";
import { PedidoDetailModal } from "@/components/pedido-detail-modal";
import { NewPedidoModal } from "@/components/new-pedido-modal";
import { Button } from "@/components/ui/button";
import { getPedidoById } from "@/actions/pedidos";
import { PedidoWithRelations } from "@/types";

export function PedidosPageClient() {
  const {
    pedidos,
    total,
    hasMore,
    isLoading,
    filters,
    setFilters,
    loadPedidos,
    loadMore,
    loadAllPedidos,
  } = useOrders();

  const [selectedPedido, setSelectedPedido] = useState<PedidoWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingPedido, setIsLoadingPedido] = useState(false);
  const [isNewPedidoModalOpen, setIsNewPedidoModalOpen] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);

  // Load pedidos on mount
  useEffect(() => {
    loadPedidos();
    setHasInitialLoad(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load pedidos when estado filter changes
  useEffect(() => {
    if (hasInitialLoad) {
      loadPedidos(false, filters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.estado]);

  const handleSearch = () => {
    loadPedidos();
  };

  const handleLoadAll = () => {
    setFilters({ ...filters, estado: "TODOS" });
    loadAllPedidos();
  };

  const handleNewPedido = () => {
    setIsNewPedidoModalOpen(true);
  };

  const handleNewPedidoSuccess = () => {
    loadPedidos();
  };

  const handleCardClick = async (id: number) => {
    // Open modal immediately
    setIsModalOpen(true);
    setIsLoadingPedido(true);
    setSelectedPedido(null);

    try {
      const pedido = await getPedidoById(id);
      if (pedido) {
        setSelectedPedido(pedido);
      }
    } catch (error) {
      console.error("Error loading pedido:", error);
      setIsModalOpen(false);
    } finally {
      setIsLoadingPedido(false);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPedido(null);
    setIsLoadingPedido(false);
  };

  const handlePedidoUpdate = () => {
    // Reload pedidos after update
    loadPedidos();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="pedidos" onNewPedido={handleNewPedido} />

      <main className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <PedidosFilters
          search={filters.search || ""}
          estado={filters.estado || "TODOS"}
          anio={filters.anio?.toString() || "TODOS"}
          onSearchChange={(value) => setFilters({ ...filters, search: value })}
          onEstadoChange={(value) =>
            setFilters({ ...filters, estado: value as "TODOS" | "INGRESADO" | "EN_PROCESO" | "ENTREGADO" })
          }
          onAnioChange={(value) =>
            setFilters({ ...filters, anio: value === "TODOS" ? undefined : parseInt(value) })
          }
          onSearch={handleSearch}
          onLoadAll={handleLoadAll}
        />

        {/* Results summary */}
        {!isLoading && pedidos.length > 0 && (
          <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-muted-foreground">
            Mostrando {pedidos.length} de {total} pedidos
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {!hasInitialLoad || (isLoading && pedidos.length === 0) ? (
            // Show skeleton when loading with no pedidos or on initial load
            Array.from({ length: 8 }).map((_, i) => (
              <PedidoCardSkeleton key={`skeleton-${i}`} />
            ))
          ) : pedidos.length > 0 ? (
            // Show actual pedidos
            pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onClick={() => handleCardClick(pedido.id)}
              />
            ))
          ) : (
            // No results (only show when not loading)
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No hay pedidos para mostrar
            </div>
          )}
        </div>

        {/* Load More Button */}
        {hasMore && !isLoading && (
          <div className="mt-8 text-center">
            <Button onClick={loadMore} variant="outline" size="lg">
              Cargar más pedidos
            </Button>
          </div>
        )}

        {/* Loading more indicator */}
        {isLoading && pedidos.length > 0 && (
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <PedidoCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
      </main>

      {/* Pedido Detail Modal */}
      <PedidoDetailModal
        pedido={selectedPedido}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onUpdate={handlePedidoUpdate}
        isLoading={isLoadingPedido}
      />

      {/* New Pedido Modal */}
      <NewPedidoModal
        open={isNewPedidoModalOpen}
        onOpenChange={setIsNewPedidoModalOpen}
        onSuccess={handleNewPedidoSuccess}
      />
    </div>
  );
}
