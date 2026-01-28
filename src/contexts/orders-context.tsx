"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { PedidoWithRelations, PedidosFilters } from "@/types";
import { getPedidos, GetPedidosResult } from "@/actions/pedidos";
import { PedidoEstado } from "@prisma/client";

interface OrdersContextType {
  pedidos: PedidoWithRelations[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  filters: PedidosFilters;
  setFilters: (filters: PedidosFilters) => void;
  loadPedidos: (append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  resetFilters: () => void;
  loadAllPedidos: () => Promise<void>;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [pedidos, setPedidos] = useState<PedidoWithRelations[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState<PedidosFilters>({
    search: "",
    estado: "TODOS",
    anio: new Date().getFullYear(),
  });

  const loadPedidos = useCallback(
    async (append = false) => {
      setIsLoading(true);
      if (!append) {
        setPedidos([]);
      }
      try {
        const skip = append ? pedidos.length : 0;

        const result: GetPedidosResult = await getPedidos({
          search: filters.search,
          estado: filters.estado === "TODOS" ? undefined : (filters.estado as PedidoEstado),
          anio: filters.anio === undefined ? "TODOS" : filters.anio,
          skip,
          take: 50,
        });

        if (append) {
          setPedidos((prev) => [...prev, ...result.pedidos]);
        } else {
          setPedidos(result.pedidos);
        }

        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error("Error loading pedidos:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pedidos.length]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await loadPedidos(true);
  }, [hasMore, isLoading, loadPedidos]);

  const resetFilters = useCallback(() => {
    setFilters({
      search: "",
      estado: "TODOS",
      anio: new Date().getFullYear(),
    });
  }, []);

  const loadAllPedidos = useCallback(async () => {
    // Reset filters and load immediately with default filters
    setFilters({
      search: "",
      estado: "TODOS",
      anio: new Date().getFullYear(),
    });

    setIsLoading(true);
    setPedidos([]);
    try {
      const result: GetPedidosResult = await getPedidos({
        search: "",
        estado: undefined,
        anio: new Date().getFullYear(),
        skip: 0,
        take: 50,
      });

      setPedidos(result.pedidos);
      setTotal(result.total);
      setHasMore(result.hasMore);
    } catch (error) {
      console.error("Error loading pedidos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <OrdersContext.Provider
      value={{
        pedidos,
        total,
        hasMore,
        isLoading,
        filters,
        setFilters,
        loadPedidos,
        loadMore,
        resetFilters,
        loadAllPedidos,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider");
  }
  return context;
}
