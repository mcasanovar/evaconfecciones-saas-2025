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

  // Load pedidos on mount
  useEffect(() => {
    loadPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadPedidos();
  };

  const handleLoadAll = () => {
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

      {/* Full screen loader for filtering */}
      {isLoading && pedidos.length === 0 && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg font-medium">Cargando pedidos...</p>
          </div>
        </div>
      )}

      <main className="container mx-auto px-6 py-8">
        <PedidosFilters
          search={filters.search || ""}
          estado={filters.estado || "TODOS"}
          anio={filters.anio?.toString() || "TODOS"}
          onSearchChange={(value) => setFilters({ ...filters, search: value })}
          onEstadoChange={(value) => setFilters({ ...filters, estado: value as "TODOS" | "INGRESADO" | "EN_PROCESO" | "ENTREGADO" })}
          onAnioChange={(value) =>
            setFilters({ ...filters, anio: value === "TODOS" ? undefined : parseInt(value) })
          }
          onSearch={handleSearch}
          onLoadAll={handleLoadAll}
        />

        {/* Results summary */}
        {!isLoading && pedidos.length > 0 && (
          <div className="mb-4 text-sm text-muted-foreground">
            Mostrando {pedidos.length} de {total} pedidos
          </div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pedidos.length > 0 ? (
            // Show actual pedidos
            pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.id}
                pedido={pedido}
                onClick={() => handleCardClick(pedido.id)}
              />
            ))
          ) : !isLoading ? (
            // No results (only show when not loading)
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No hay pedidos para mostrar
            </div>
          ) : null}
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
