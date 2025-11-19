"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPrendas() {
  try {
    const prendas = await prisma.prenda.findMany({
      orderBy: { nombre: "asc" },
    });
    return prendas;
  } catch (error) {
    console.error("Error fetching prendas:", error);
    throw new Error("Failed to fetch prendas");
  }
}

export async function createPrenda(data: {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}) {
  try {
    const prenda = await prisma.prenda.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        activo: data.activo ?? true,
      },
    });
    revalidatePath("/administracion");
    return { success: true, prenda };
  } catch (error) {
    console.error("Error creating prenda:", error);
    return { success: false, error: "Failed to create prenda" };
  }
}

export async function updatePrenda(
  id: number,
  data: { nombre?: string; descripcion?: string; activo?: boolean }
) {
  try {
    const prenda = await prisma.prenda.update({
      where: { id },
      data,
    });
    revalidatePath("/administracion");
    return { success: true, prenda };
  } catch (error) {
    console.error("Error updating prenda:", error);
    return { success: false, error: "Failed to update prenda" };
  }
}

export async function deletePrenda(id: number) {
  try {
    // Check if prenda has associated pedido items
    const itemsCount = await prisma.pedidoItem.count({
      where: { prendaId: id },
    });

    if (itemsCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${itemsCount} item(s) de pedido asociado(s) a esta prenda.`,
      };
    }

    // Check if prenda has associated prices
    const preciosCount = await prisma.colegioPrendaTallaPrecio.count({
      where: { prendaId: id },
    });

    if (preciosCount > 0) {
      return {
        success: false,
        error: `No se puede eliminar. Hay ${preciosCount} precio(s) asociado(s) a esta prenda.`,
      };
    }

    await prisma.prenda.delete({
      where: { id },
    });

    revalidatePath("/administracion");
    return { success: true };
  } catch (error) {
    console.error("Error deleting prenda:", error);
    return { success: false, error: "Failed to delete prenda" };
  }
}
