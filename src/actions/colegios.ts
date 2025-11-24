"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

export async function getColegios(params?: PaginationParams): Promise<PaginatedResponse<Awaited<ReturnType<typeof prisma.colegio.findMany>>[0]>> {
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
    const totalItems = await prisma.colegio.count({ where });

    // Get paginated data
    const colegios = await prisma.colegio.findMany({
      where,
      orderBy: { nombre: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: colegios,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  } catch (error) {
    console.error("Error fetching colegios:", error);
    throw new Error("Failed to fetch colegios");
  }
}

export async function createColegio(data: { nombre: string; activo?: boolean }) {
  try {
    const colegio = await prisma.colegio.create({
      data: {
        nombre: data.nombre,
        activo: data.activo ?? true,
      },
    });
    revalidatePath("/administracion");
    return { success: true, colegio };
  } catch (error) {
    console.error("Error creating colegio:", error);
    return { success: false, error: "Failed to create colegio" };
  }
}

export async function updateColegio(id: number, data: { nombre?: string; activo?: boolean }) {
  try {
    const colegio = await prisma.colegio.update({
      where: { id },
      data,
    });
    revalidatePath("/administracion");
    return { success: true, colegio };
  } catch (error) {
    console.error("Error updating colegio:", error);
    return { success: false, error: "Failed to update colegio" };
  }
}

export async function deleteColegio(id: number) {
  try {
    // Check if colegio has associated pedidos
    const pedidosCount = await prisma.pedido.count({
      where: { colegioId: id },
    });

    if (pedidosCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${pedidosCount} pedido(s) asociado(s) a este colegio.`,
      };
    }

    // Check if colegio has associated prices
    const preciosCount = await prisma.colegioPrendaTallaPrecio.count({
      where: { colegioId: id },
    });

    if (preciosCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${preciosCount} precio(s) asociado(s) a este colegio.`,
      };
    }

    await prisma.colegio.delete({
      where: { id },
    });

    revalidatePath("/administracion");
    return { success: true };
  } catch (error) {
    console.error("Error deleting colegio:", error);
    return { success: false, error: "Failed to delete colegio" };
  }
}
