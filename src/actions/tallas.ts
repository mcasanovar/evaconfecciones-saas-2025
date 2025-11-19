"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getTallas() {
  try {
    const tallas = await prisma.talla.findMany({
      orderBy: { orden: "asc" },
    });
    return tallas;
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
