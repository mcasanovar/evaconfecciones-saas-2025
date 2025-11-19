-- CreateEnum
CREATE TYPE "PedidoEstado" AS ENUM ('INGRESADO', 'EN_PROCESO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "Colegio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Colegio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prenda" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Talla" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "orden" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Talla_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ColegioPrendaTallaPrecio" (
    "id" SERIAL NOT NULL,
    "colegioId" INTEGER NOT NULL,
    "prendaId" INTEGER NOT NULL,
    "tallaId" INTEGER NOT NULL,
    "precio" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ColegioPrendaTallaPrecio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteNombre" TEXT NOT NULL,
    "clienteApellido" TEXT,
    "clienteTelefono" TEXT,
    "clienteEmail" TEXT,
    "colegioId" INTEGER,
    "anio" INTEGER NOT NULL,
    "estado" "PedidoEstado" NOT NULL DEFAULT 'INGRESADO',
    "fechaCreacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaEntrega" TIMESTAMP(3),
    "total" INTEGER NOT NULL DEFAULT 0,
    "abono" INTEGER NOT NULL DEFAULT 0,
    "saldo" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PedidoItem" (
    "id" SERIAL NOT NULL,
    "pedidoId" INTEGER NOT NULL,
    "prendaId" INTEGER NOT NULL,
    "tallaId" INTEGER,
    "cantidad" INTEGER NOT NULL,
    "precioUnitario" INTEGER NOT NULL,
    "subtotal" INTEGER NOT NULL,
    "estaLista" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PedidoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ColegioPrendaTallaPrecio_colegioId_prendaId_tallaId_key" ON "ColegioPrendaTallaPrecio"("colegioId", "prendaId", "tallaId");

-- CreateIndex
CREATE UNIQUE INDEX "Pedido_codigo_key" ON "Pedido"("codigo");

-- AddForeignKey
ALTER TABLE "ColegioPrendaTallaPrecio" ADD CONSTRAINT "ColegioPrendaTallaPrecio_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "Colegio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColegioPrendaTallaPrecio" ADD CONSTRAINT "ColegioPrendaTallaPrecio_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColegioPrendaTallaPrecio" ADD CONSTRAINT "ColegioPrendaTallaPrecio_tallaId_fkey" FOREIGN KEY ("tallaId") REFERENCES "Talla"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_colegioId_fkey" FOREIGN KEY ("colegioId") REFERENCES "Colegio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "Pedido"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "Prenda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_tallaId_fkey" FOREIGN KEY ("tallaId") REFERENCES "Talla"("id") ON DELETE SET NULL ON UPDATE CASCADE;
