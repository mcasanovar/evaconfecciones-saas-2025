"use server";

import { prisma } from "@/lib/db";
import { PedidoEstado } from "@prisma/client";
import { PedidoWithRelations } from "@/types";
import { revalidatePath } from "next/cache";

export interface GetPedidosParams {
  search?: string;
  estado?: PedidoEstado | "TODOS";
  anio?: number | "TODOS";
  skip?: number;
  take?: number;
}

export interface GetPedidosResult {
  pedidos: PedidoWithRelations[];
  total: number;
  hasMore: boolean;
}

export async function getPedidos(
  params: GetPedidosParams = {}
): Promise<GetPedidosResult> {
  const {
    search = "",
    estado = "TODOS",
    anio = "TODOS",
    skip = 0,
    take = 50,
  } = params;

  try {
    // Build where clause
    const where: any = {};

    // Search filter (cliente nombre or apellido)
    if (search && search.trim() !== "") {
      where.OR = [
        { clienteNombre: { contains: search, mode: "insensitive" } },
        { clienteApellido: { contains: search, mode: "insensitive" } },
      ];
    }

    // Estado filter
    if (estado !== "TODOS") {
      where.estado = estado;
    }

    // Año filter
    if (anio !== "TODOS") {
      const year = Number(anio);
      where.fechaCreacion = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31T23:59:59`),
      };
    }

    // Get total count
    const total = await prisma.pedido.count({ where });

    // Get pedidos with relations
    const pedidos = await prisma.pedido.findMany({
      where,
      include: {
        colegio: true,
        items: {
          include: {
            prenda: true,
            talla: true,
          },
        },
      },
      orderBy: {
        fechaCreacion: "desc",
      },
      skip,
      take,
    });

    const hasMore = skip + take < total;

    return {
      pedidos: pedidos as PedidoWithRelations[],
      total,
      hasMore,
    };
  } catch (error) {
    console.error("Error fetching pedidos:", error);
    throw new Error("Failed to fetch pedidos");
  }
}

export async function getPedidoById(id: number): Promise<PedidoWithRelations | null> {
  try {
    const pedido = await prisma.pedido.findUnique({
      where: { id },
      include: {
        colegio: true,
        items: {
          include: {
            prenda: true,
            talla: true,
          },
          orderBy: {
            id: "asc",
          },
        },
      },
    });

    return pedido as PedidoWithRelations | null;
  } catch (error) {
    console.error("Error fetching pedido:", error);
    throw new Error("Failed to fetch pedido");
  }
}

export async function updatePedidoItemStatus(itemId: number, estaLista: boolean) {
  try {
    const item = await prisma.pedidoItem.update({
      where: { id: itemId },
      data: { estaLista },
    });

    revalidatePath("/pedidos");
    return { success: true, item };
  } catch (error) {
    console.error("Error updating item status:", error);
    return { success: false, error: "Failed to update item status" };
  }
}

export async function updatePedidoEstado(pedidoId: number, estado: PedidoEstado) {
  try {
    const pedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado },
    });

    revalidatePath("/pedidos");
    return { success: true, pedido };
  } catch (error) {
    console.error("Error updating pedido estado:", error);
    return { success: false, error: "Failed to update pedido estado" };
  }
}
