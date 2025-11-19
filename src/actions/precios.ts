"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPrecios() {
  try {
    const precios = await prisma.colegioPrendaTallaPrecio.findMany({
      include: {
        colegio: true,
        prenda: true,
        talla: true,
      },
      orderBy: [
        { colegio: { nombre: "asc" } },
        { prenda: { nombre: "asc" } },
        { talla: { orden: "asc" } },
      ],
    });
    return precios;
  } catch (error) {
    console.error("Error fetching precios:", error);
    throw new Error("Failed to fetch precios");
  }
}

export async function createPrecio(data: {
  colegioId: number;
  prendaId: number;
  tallaId: number;
  precio: number;
}) {
  try {
    // Check if price already exists
    const existing = await prisma.colegioPrendaTallaPrecio.findUnique({
      where: {
        colegioId_prendaId_tallaId: {
          colegioId: data.colegioId,
          prendaId: data.prendaId,
          tallaId: data.tallaId,
        },
      },
    });

    if (existing) {
      return {
        success: false,
        error: "Ya existe un precio para esta combinación de colegio, prenda y talla.",
      };
    }

    const precio = await prisma.colegioPrendaTallaPrecio.create({
      data,
      include: {
        colegio: true,
        prenda: true,
        talla: true,
      },
    });

    revalidatePath("/administracion");
    return { success: true, precio };
  } catch (error) {
    console.error("Error creating precio:", error);
    return { success: false, error: "Failed to create precio" };
  }
}

export async function updatePrecio(
  colegioId: number,
  prendaId: number,
  tallaId: number,
  precio: number
) {
  try {
    const updatedPrecio = await prisma.colegioPrendaTallaPrecio.update({
      where: {
        colegioId_prendaId_tallaId: {
          colegioId,
          prendaId,
          tallaId,
        },
      },
      data: { precio },
      include: {
        colegio: true,
        prenda: true,
        talla: true,
      },
    });

    revalidatePath("/administracion");
    return { success: true, precio: updatedPrecio };
  } catch (error) {
    console.error("Error updating precio:", error);
    return { success: false, error: "Failed to update precio" };
  }
}

export async function deletePrecio(colegioId: number, prendaId: number, tallaId: number) {
  try {
    await prisma.colegioPrendaTallaPrecio.delete({
      where: {
        colegioId_prendaId_tallaId: {
          colegioId,
          prendaId,
          tallaId,
        },
      },
    });

    revalidatePath("/administracion");
    return { success: true };
  } catch (error) {
    console.error("Error deleting precio:", error);
    return { success: false, error: "Failed to delete precio" };
  }
}
