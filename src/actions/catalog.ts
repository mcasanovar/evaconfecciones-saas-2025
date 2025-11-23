"use server";

import { prisma } from "@/lib/db";

export async function getActiveColegios() {
  try {
    const colegios = await prisma.colegio.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return colegios;
  } catch (error) {
    console.error("Error fetching colegios:", error);
    return [];
  }
}

export async function getActivePrendas() {
  try {
    const prendas = await prisma.prenda.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    });
    return prendas;
  } catch (error) {
    console.error("Error fetching prendas:", error);
    return [];
  }
}

export async function getActiveTallas() {
  try {
    const tallas = await prisma.talla.findMany({
      where: { activo: true },
      orderBy: { orden: "asc" },
    });
    return tallas;
  } catch (error) {
    console.error("Error fetching tallas:", error);
    return [];
  }
}

export async function getPrecio(colegioId: number, prendaId: number, tallaId: number) {
  try {
    const precio = await prisma.colegioPrendaTallaPrecio.findFirst({
      where: {
        colegioId,
        prendaId,
        tallaId,
      },
    });
    return precio?.precio || null;
  } catch (error) {
    console.error("Error fetching precio:", error);
    return null;
  }
}
