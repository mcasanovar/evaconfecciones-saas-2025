"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getColegios() {
  try {
    const colegios = await prisma.colegio.findMany({
      orderBy: { nombre: "asc" },
    });
    return colegios;
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
