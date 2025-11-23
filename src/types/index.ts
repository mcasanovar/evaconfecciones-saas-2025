import { Pedido, PedidoItem, Colegio, Prenda, Talla, PedidoEstado } from "@prisma/client";

// Extended types with relations
export type PedidoWithRelations = Pedido & {
  colegio: Colegio | null;
  items: (PedidoItem & {
    prenda: Prenda;
    talla: Talla | null;
  })[];
};

export type PedidoItemWithRelations = PedidoItem & {
  prenda: Prenda;
  talla: Talla | null;
  colegio?: Colegio;
};

// Filter types
export interface PedidosFilters {
  search?: string;
  estado?: PedidoEstado | "TODOS";
  anio?: number;
}

// Pagination
export interface PaginationParams {
  skip: number;
  take: number;
}

// Form data types
export interface CreatePedidoData {
  clienteNombre: string;
  clienteApellido?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  colegioId?: number;
  fechaEntrega?: Date;
  items: CreatePedidoItemData[];
  abono?: number;
}

export interface CreatePedidoItemData {
  prendaId: number;
  tallaId?: number;
  cantidad: number;
  precioUnitario: number;
}

export interface UpdatePedidoData extends Partial<CreatePedidoData> {
  id: number;
  estado?: PedidoEstado;
}

// Price lookup
export interface PriceQuery {
  colegioId: number;
  prendaId: number;
  tallaId: number;
}

// Admin types
export interface CreateColegioData {
  nombre: string;
  activo?: boolean;
}

export interface CreatePrendaData {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface CreateTallaData {
  nombre: string;
  orden?: number;
  activo?: boolean;
}

export interface CreatePrecioData {
  colegioId: number;
  prendaId: number;
  tallaId: number;
  precio: number;
}

// Re-export Prisma enums
export { PedidoEstado };
