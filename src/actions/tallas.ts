"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaginationParams, PaginatedResponse } from "./colegios";

export async function getTallas(params?: PaginationParams): Promise<PaginatedResponse<Awaited<ReturnType<typeof prisma.talla.findMany>>[0]>> {
  try {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const search = params?.search ?? "";

    // Build where clause for search
    const where = search
      ? {
        nombre: {
          contains: search,
          mode: "insensitive" as const,
        },
      }
      : {};

    // Get total count for pagination
    const totalItems = await prisma.talla.count({ where });

    // Get paginated data
    const tallas = await prisma.talla.findMany({
      where,
      orderBy: { orden: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: tallas,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching tallas:", error);
    throw new Error("Failed to fetch tallas");
  }
}

export async function createTalla(data: {
  nombre: string;
  orden?: number;
  activo?: boolean;
}) {
  try {
    const talla = await prisma.talla.create({
      data: {
        nombre: data.nombre,
        orden: data.orden ?? 0,
        activo: data.activo ?? true,
      },
    });
    revalidatePath("/administracion");
    return { success: true, talla };
  } catch (error) {
    console.error("Error creating talla:", error);
    return { success: false, error: "Failed to create talla" };
  }
}

export async function updateTalla(
  id: number,
  data: { nombre?: string; orden?: number; activo?: boolean }
) {
  try {
    const talla = await prisma.talla.update({
      where: { id },
      data,
    });
    revalidatePath("/administracion");
    return { success: true, talla };
  } catch (error) {
    console.error("Error updating talla:", error);
    return { success: false, error: "Failed to update talla" };
  }
}

export async function deleteTalla(id: number) {
  try {
    // Check if talla has associated pedido items
    const itemsCount = await prisma.pedidoItem.count({
      where: { tallaId: id },
    });

    if (itemsCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${itemsCount} item(s) de pedido asociado(s) a esta talla.`,
      };
    }

    // Check if talla has associated prices
    const preciosCount = await prisma.colegioPrendaTallaPrecio.count({
      where: { tallaId: id },
    });

    if (preciosCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${preciosCount} precio(s) asociado(s) a esta talla.`,
      };
    }

    await prisma.talla.delete({
      where: { id },
    });

    revalidatePath("/administracion");
    return { success: true };
  } catch (error) {
    console.error("Error deleting talla:", error);
    return { success: false, error: "Failed to delete talla" };
  }
}
