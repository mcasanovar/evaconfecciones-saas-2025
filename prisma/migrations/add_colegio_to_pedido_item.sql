-- AlterTable: Add colegioId column to PedidoItem
-- First, add the column as nullable
ALTER TABLE "PedidoItem" ADD COLUMN "colegioId" INTEGER;

-- Update existing rows to use their pedido's colegioId
UPDATE "PedidoItem" 
SET "colegioId" = (
  SELECT "colegioId" 
  FROM "Pedido" 
  WHERE "Pedido"."id" = "PedidoItem"."pedidoId"
);

-- Now make the column NOT NULL
ALTER TABLE "PedidoItem" ALTER COLUMN "colegioId" SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE "PedidoItem" ADD CONSTRAINT "PedidoItem_colegioId_fkey" 
  FOREIGN KEY ("colegioId") REFERENCES "Colegio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
