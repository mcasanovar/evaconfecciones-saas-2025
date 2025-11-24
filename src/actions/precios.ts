"use server";

import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { PaginationParams, PaginatedResponse } from "./colegios";

type PrecioWithRelations = Awaited<ReturnType<typeof prisma.colegioPrendaTallaPrecio.findMany<{
  include: {
    colegio: true;
    prenda: true;
    talla: true;
  };
}>>>[0];

export async function getPrecios(params?: PaginationParams): Promise<PaginatedResponse<PrecioWithRelations>> {
  try {
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const search = params?.search ?? "";

    // Build where clause for search across related fields
    const where = search
      ? {
        OR: [
          {
            colegio: {
              nombre: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            prenda: {
              nombre: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
          {
            talla: {
              nombre: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          },
        ],
      }
      : {};

    // Get total count for pagination
    const totalItems = await prisma.colegioPrendaTallaPrecio.count({ where });

    // Get paginated data
    const precios = await prisma.colegioPrendaTallaPrecio.findMany({
      where,
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
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      data: precios,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
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
