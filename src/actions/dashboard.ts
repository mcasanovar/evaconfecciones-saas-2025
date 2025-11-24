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
  total: number;
  fechaCreacion: Date;
  colegio: {
    nombre: string;
  } | null;
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

      // Totales de ventas y saldos
      prisma.pedido.aggregate({
        _sum: {
          total: true,
          saldo: true,
        },
      }),
    ]);

    const stats = {
      totalPedidos,
      pedidosIngresados,
      pedidosEnProceso,
      pedidosEntregados,
      totalVentas: totalesResult._sum.total ?? 0,
      saldoPendiente: totalesResult._sum.saldo ?? 0,
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
        fechaCreacion: true,
        colegio: {
          select: {
            nombre: true,
          },
        },
      },
    });

    console.log(`[Dashboard] Fetched ${pedidos.length} recent pedidos`);

    return pedidos;
  } catch (error) {
    console.error("[Dashboard] Error fetching recent pedidos:", error);
    throw new Error("Failed to fetch recent pedidos");
  }
}
