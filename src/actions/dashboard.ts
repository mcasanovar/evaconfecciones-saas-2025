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

    return {
      totalPedidos,
      pedidosIngresados,
      pedidosEnProceso,
      pedidosEntregados,
      totalVentas: totalesResult._sum.total || 0,
      saldoPendiente: totalesResult._sum.saldo || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw new Error("Failed to fetch dashboard stats");
  }
}

export async function getPedidosByEstado(): Promise<PedidosByEstado[]> {
  try {
    const result = await prisma.pedido.groupBy({
      by: ["estado"],
      _count: {
        id: true,
      },
    });

    return result.map((item) => ({
      estado: item.estado,
      count: item._count.id,
    }));
  } catch (error) {
    console.error("Error fetching pedidos by estado:", error);
    throw new Error("Failed to fetch pedidos by estado");
  }
}

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

    return pedidos;
  } catch (error) {
    console.error("Error fetching recent pedidos:", error);
    throw new Error("Failed to fetch recent pedidos");
  }
}
