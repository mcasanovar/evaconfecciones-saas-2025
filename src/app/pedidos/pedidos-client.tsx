"use client";

import { useEffect } from "react";
import { Header } from "@/components/header";
import { PedidosFilters } from "@/components/pedidos-filters";
import { PedidoCard, PedidoCardSkeleton } from "@/components/pedido-card";
import { useOrders } from "@/contexts/orders-context";
import { Button } from "@/components/ui/button";

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
    resetFilters,
  } = useOrders();

  // Load pedidos on mount
  useEffect(() => {
    loadPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    loadPedidos();
  };

  const handleLoadAll = () => {
    resetFilters();
    // Load will trigger via useEffect when filters change
    setTimeout(() => loadPedidos(), 0);
  };

  const handleNewPedido = () => {
    console.log("Creating new pedido");
    // TODO: Implement in Phase 7
  };

  const handleCardClick = (id: number) => {
    console.log("Opening pedido:", id);
    // TODO: Implement modal in Phase 5
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentPage="pedidos" onNewPedido={handleNewPedido} />

      <main className="container mx-auto px-6 py-8">
        <PedidosFilters
          search={filters.search || ""}
          estado={filters.estado || "TODOS"}
          anio={filters.anio?.toString() || "TODOS"}
          onSearchChange={(value) => setFilters({ ...filters, search: value })}
          onEstadoChange={(value) => setFilters({ ...filters, estado: value as any })}
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
          {isLoading && pedidos.length === 0 ? (
            // Show skeletons while loading initial data
            Array.from({ length: 8 }).map((_, i) => (
              <PedidoCardSkeleton key={i} />
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
            // No results
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
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <PedidoCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
