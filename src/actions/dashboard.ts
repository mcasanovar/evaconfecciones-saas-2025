"use server";

import { prisma } from "@/lib/db";
import { PedidoEstado } from "@prisma/client";

export interface DashboardStats {
  totalPedidos: number;
  pedidosIngresados: number;
  pedidosEnProceso: number;
  pedidosEntregados: number;
  totalVentas: number;
  saldoPendiente: number;
}

export interface PedidosByEstado {
  estado: PedidoEstado;
  count: number;
}

export interface RecentPedido {
  id: number;
  codigo: string;
  clienteNombre: string;
  clienteApellido: string | null;
  estado: PedidoEstado;
  total: number; // This will be the effective total (with discount if exists)
  fechaCreacion: Date;
  colegio: {
    nombre: string;
  } | null;
}

export interface TopPrenda {
  prendaId: number;
  prendaNombre: string;
  totalCantidad: number;
}

export interface TopColegio {
  colegioId: number;
  colegioNombre: string;
  totalCantidad: number;
}

/**
 * Get dashboard statistics including pedido counts by estado and financial totals.
 * Data is aggregated from the pedidos table.
 * 
 * @returns Dashboard statistics with counts and monetary totals
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const [
      totalPedidos,
      pedidosIngresados,
      pedidosEnProceso,
      pedidosEntregados,
      totalesResult,
    ] = await Promise.all([
      // Total pedidos
      prisma.pedido.count(),

      // Pedidos por estado
      prisma.pedido.count({
        where: { estado: PedidoEstado.INGRESADO },
      }),
      prisma.pedido.count({
        where: { estado: PedidoEstado.EN_PROCESO },
      }),
      prisma.pedido.count({
        where: { estado: PedidoEstado.ENTREGADO },
      }),

      // Get all pedidos to calculate totals correctly (use totalConDescuento if exists, otherwise total)
      prisma.pedido.findMany({
        select: {
          total: true,
          totalConDescuento: true,
          saldo: true,
        },
      }),
    ]);

    // Calculate totalVentas using totalConDescuento when it exists, otherwise use total
    const totalVentas = totalesResult.reduce((sum, pedido) => {
      const effectiveTotal = pedido.totalConDescuento !== null ? pedido.totalConDescuento : pedido.total;
      return sum + effectiveTotal;
    }, 0);

    // Sum all saldos
    const saldoPendiente = totalesResult.reduce((sum, pedido) => sum + pedido.saldo, 0);

    const stats = {
      totalPedidos,
      pedidosIngresados,
      pedidosEnProceso,
      pedidosEntregados,
      totalVentas,
      saldoPendiente,
    };

    console.log("[Dashboard] Stats fetched:", {
      totalPedidos: stats.totalPedidos,
      byEstado: {
        ingresados: stats.pedidosIngresados,
        enProceso: stats.pedidosEnProceso,
        entregados: stats.pedidosEntregados,
      },
      financials: {
        totalVentas: stats.totalVentas,
        saldoPendiente: stats.saldoPendiente,
      },
    });

    return stats;
  } catch (error) {
    console.error("[Dashboard] Error fetching stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

/**
 * Get pedido counts grouped by estado.
 * Useful for charts and visualizations.
 * 
 * @returns Array of pedido counts by estado
 */
export async function getPedidosByEstado(): Promise<PedidosByEstado[]> {
  try {
    const result = await prisma.pedido.groupBy({
      by: ["estado"],
      _count: {
        id: true,
      },
    });

    const pedidosByEstado = result.map((item) => ({
      estado: item.estado,
      count: item._count.id,
    }));

    console.log("[Dashboard] Pedidos by estado:", pedidosByEstado);

    return pedidosByEstado;
  } catch (error) {
    console.error("[Dashboard] Error fetching pedidos by estado:", error);
    throw new Error("Failed to fetch pedidos by estado");
  }
}

/**
 * Get the most recent pedidos ordered by creation date.
 * Includes client info, estado, and colegio name.
 * 
 * @param limit - Number of pedidos to fetch (default: 5)
 * @returns Array of recent pedidos
 */
export async function getRecentPedidos(limit: number = 5): Promise<RecentPedido[]> {
  try {
    const pedidos = await prisma.pedido.findMany({
      take: limit,
      orderBy: {
        fechaCreacion: "desc",
      },
      select: {
        id: true,
        codigo: true,
        clienteNombre: true,
        clienteApellido: true,
        estado: true,
        total: true,
        totalConDescuento: true,
        fechaCreacion: true,
        colegio: {
          select: {
            nombre: true,
          },
        },
      },
    });

    // Map to return effective total (totalConDescuento if exists, otherwise total)
    const mappedPedidos = pedidos.map(pedido => ({
      id: pedido.id,
      codigo: pedido.codigo,
      clienteNombre: pedido.clienteNombre,
      clienteApellido: pedido.clienteApellido,
      estado: pedido.estado,
      total: pedido.totalConDescuento !== null ? pedido.totalConDescuento : pedido.total,
      fechaCreacion: pedido.fechaCreacion,
      colegio: pedido.colegio,
    }));

    console.log(`[Dashboard] Fetched ${mappedPedidos.length} recent pedidos`);

    return mappedPedidos;
  } catch (error) {
    console.error("[Dashboard] Error fetching recent pedidos:", error);
    throw new Error("Failed to fetch recent pedidos");
  }
}

/**
 * Get top 5 most sold prendas from all pedidos.
 * Aggregates cantidad from all PedidoItems regardless of pedido estado.
 * 
 * @returns Array of top 5 prendas with total quantity sold
 */
export async function getTopPrendas(): Promise<TopPrenda[]> {
  try {
    const result = await prisma.pedidoItem.groupBy({
      by: ["prendaId"],
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: "desc",
        },
      },
      take: 5,
    });

    const topPrendas = await Promise.all(
      result.map(async (item) => {
        const prenda = await prisma.prenda.findUnique({
          where: { id: item.prendaId },
          select: { nombre: true },
        });

        return {
          prendaId: item.prendaId,
          prendaNombre: prenda?.nombre ?? "Desconocido",
          totalCantidad: item._sum.cantidad ?? 0,
        };
      })
    );

    console.log("[Dashboard] Top prendas fetched:", topPrendas);

    return topPrendas;
  } catch (error) {
    console.error("[Dashboard] Error fetching top prendas:", error);
    throw new Error("Failed to fetch top prendas");
  }
}

/**
 * Get top 5 most sold colegios from all pedidos.
 * Aggregates cantidad from all PedidoItems regardless of pedido estado.
 * 
 * @returns Array of top 5 colegios with total quantity sold
 */
export async function getTopColegios(): Promise<TopColegio[]> {
  try {
    const result = await prisma.pedidoItem.groupBy({
      by: ["colegioId"],
      _sum: {
        cantidad: true,
      },
      orderBy: {
        _sum: {
          cantidad: "desc",
        },
      },
      take: 5,
    });

    const topColegios = await Promise.all(
      result.map(async (item) => {
        const colegio = await prisma.colegio.findUnique({
          where: { id: item.colegioId },
          select: { nombre: true },
        });

        return {
          colegioId: item.colegioId,
          colegioNombre: colegio?.nombre ?? "Desconocido",
          totalCantidad: item._sum.cantidad ?? 0,
        };
      })
    );

    console.log("[Dashboard] Top colegios fetched:", topColegios);

    return topColegios;
  } catch (error) {
    console.error("[Dashboard] Error fetching top colegios:", error);
    throw new Error("Failed to fetch top colegios");
  }
}
