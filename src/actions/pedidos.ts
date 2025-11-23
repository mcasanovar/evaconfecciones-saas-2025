"use server";

import { prisma } from "@/lib/db";
import { PedidoEstado } from "@prisma/client";
import { PedidoWithRelations } from "@/types";
import { revalidatePath } from "next/cache";

export interface CreatePedidoItem {
  colegioId: number;
  prendaId: number;
  tallaId: number;
  cantidad: number;
}

export interface CreatePedidoData {
  clienteNombre: string;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  clienteEmail: string | null;
  anio: number;
  fechaEntrega: Date | null;
  items: CreatePedidoItem[];
  abono?: number;
}

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

    // Search filter (cliente nombre, apellido, or codigo)
    if (search && search.trim() !== "") {
      where.OR = [
        { clienteNombre: { contains: search, mode: "insensitive" } },
        { clienteApellido: { contains: search, mode: "insensitive" } },
        { codigo: { contains: search, mode: "insensitive" } },
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
            colegio: true,
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
            colegio: true,
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

export async function updatePedidoAbono(pedidoId: number, abono: number) {
  try {
    // Get the pedido to calculate new saldo
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { total: true },
    });

    if (!pedido) {
      return { success: false, error: "Pedido no encontrado" };
    }

    // Validate abono is not negative or greater than total
    if (abono < 0) {
      return { success: false, error: "El abono no puede ser negativo" };
    }

    if (abono > pedido.total) {
      return { success: false, error: "El abono no puede ser mayor que el total" };
    }

    const saldo = pedido.total - abono;

    const updatedPedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        abono,
        saldo,
      },
    });

    revalidatePath("/pedidos");
    return { success: true, pedido: updatedPedido };
  } catch (error) {
    console.error("Error updating pedido abono:", error);
    return { success: false, error: "Failed to update pedido abono" };
  }
}

export async function updatePedidoClientInfo(
  pedidoId: number,
  clienteNombre: string,
  clienteApellido: string,
  clienteTelefono: string,
  clienteEmail: string
) {
  try {
    // Validate required fields
    if (!clienteNombre || clienteNombre.trim() === "") {
      return { success: false, error: "El nombre del cliente es requerido" };
    }

    const updatedPedido = await prisma.pedido.update({
      where: { id: pedidoId },
      data: {
        clienteNombre: clienteNombre.trim(),
        clienteApellido: clienteApellido.trim() || null,
        clienteTelefono: clienteTelefono.trim() || null,
        clienteEmail: clienteEmail.trim() || null,
      },
    });

    revalidatePath("/pedidos");
    return { success: true, pedido: updatedPedido };
  } catch (error) {
    console.error("Error updating pedido client info:", error);
    return { success: false, error: "Failed to update pedido client info" };
  }
}

export async function addItemToPedido(
  pedidoId: number,
  colegioId: number,
  prendaId: number,
  tallaId: number,
  cantidad: number
) {
  try {
    // Get price for the item
    const precio = await prisma.colegioPrendaTallaPrecio.findFirst({
      where: {
        colegioId,
        prendaId,
        tallaId,
      },
    });

    if (!precio) {
      return { success: false, error: "No se encontró precio para esta combinación" };
    }

    const precioUnitario = precio.precio;
    const subtotal = precioUnitario * cantidad;

    // Create the new item
    const newItem = await prisma.pedidoItem.create({
      data: {
        pedidoId,
        colegioId,
        prendaId,
        tallaId,
        cantidad,
        precioUnitario,
        subtotal,
        estaLista: false,
      },
      include: {
        colegio: true,
        prenda: true,
        talla: true,
      },
    });

    // Recalculate pedido totals
    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      include: { items: true },
    });

    if (pedido) {
      const newTotal = pedido.items.reduce((sum, item) => sum + item.subtotal, 0);
      const newSaldo = newTotal - pedido.abono;

      await prisma.pedido.update({
        where: { id: pedidoId },
        data: {
          total: newTotal,
          saldo: newSaldo,
        },
      });
    }

    revalidatePath("/pedidos");
    return { success: true, item: newItem };
  } catch (error) {
    console.error("Error adding item to pedido:", error);
    return { success: false, error: "Failed to add item to pedido" };
  }
}

export async function deletePedidoItem(itemId: number) {
  try {
    // Get the item to find its pedido
    const item = await prisma.pedidoItem.findUnique({
      where: { id: itemId },
      select: { pedidoId: true, subtotal: true },
    });

    if (!item) {
      return { success: false, error: "Item no encontrado" };
    }

    // Delete the item
    await prisma.pedidoItem.delete({
      where: { id: itemId },
    });

    // Recalculate pedido totals
    const pedido = await prisma.pedido.findUnique({
      where: { id: item.pedidoId },
      include: { items: true },
    });

    if (pedido) {
      const newTotal = pedido.items.reduce((sum, item) => sum + item.subtotal, 0);
      const newSaldo = newTotal - pedido.abono;

      await prisma.pedido.update({
        where: { id: item.pedidoId },
        data: {
          total: newTotal,
          saldo: newSaldo,
        },
      });
    }

    revalidatePath("/pedidos");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pedido item:", error);
    return { success: false, error: "Failed to delete pedido item" };
  }
}

async function generatePedidoCodigo(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PED-${year}`;

  // Get the last pedido of the year
  const lastPedido = await prisma.pedido.findFirst({
    where: {
      codigo: {
        startsWith: prefix,
      },
    },
    orderBy: {
      codigo: "desc",
    },
  });

  let nextNumber = 1;
  if (lastPedido) {
    const lastNumber = parseInt(lastPedido.codigo.split("-")[2]);
    nextNumber = lastNumber + 1;
  }

  return `${prefix}-${nextNumber.toString().padStart(4, "0")}`;
}

export async function createPedido(data: CreatePedidoData) {
  try {
    // Validate that items exist
    if (!data.items || data.items.length === 0) {
      return { success: false, error: "Debe agregar al menos un item al pedido" };
    }

    // Generate unique codigo
    const codigo = await generatePedidoCodigo();

    // Use the first item's colegio as the main pedido colegio
    const mainColegioId = data.items[0].colegioId;

    // Get prices for all items from catalog
    const itemsWithPrices = await Promise.all(
      data.items.map(async (item) => {
        const precio = await prisma.colegioPrendaTallaPrecio.findFirst({
          where: {
            colegioId: item.colegioId,
            prendaId: item.prendaId,
            tallaId: item.tallaId,
          },
        });

        if (!precio) {
          throw new Error(
            `No se encontró precio para la combinación colegio-prenda-talla`
          );
        }

        const precioUnitario = precio.precio;
        const subtotal = precioUnitario * item.cantidad;

        return {
          colegioId: item.colegioId,
          prendaId: item.prendaId,
          tallaId: item.tallaId,
          cantidad: item.cantidad,
          precioUnitario,
          subtotal,
          estaLista: false,
        };
      })
    );

    // Calculate totals
    const total = itemsWithPrices.reduce((sum, item) => sum + item.subtotal, 0);
    const abono = data.abono || 0;
    const saldo = total - abono;

    // Create pedido with items in a transaction
    const pedido = await prisma.pedido.create({
      data: {
        codigo,
        clienteNombre: data.clienteNombre,
        clienteApellido: data.clienteApellido,
        clienteTelefono: data.clienteTelefono,
        clienteEmail: data.clienteEmail,
        colegioId: mainColegioId,
        anio: data.anio,
        estado: PedidoEstado.INGRESADO,
        fechaCreacion: new Date(),
        fechaEntrega: data.fechaEntrega,
        total,
        abono,
        saldo,
        items: {
          create: itemsWithPrices,
        },
      },
      include: {
        colegio: true,
        items: {
          include: {
            prenda: true,
            talla: true,
          },
        },
      },
    });

    revalidatePath("/pedidos");
    return { success: true, pedido };
  } catch (error) {
    console.error("Error creating pedido:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create pedido"
    };
  }
}
