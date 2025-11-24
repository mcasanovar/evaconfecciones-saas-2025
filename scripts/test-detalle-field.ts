import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDetalleField() {
  console.log("🧪 Testing detalle field...\n");

  try {
    // Get a sample pedido
    const pedido = await prisma.pedido.findFirst({
      select: {
        id: true,
        codigo: true,
        clienteNombre: true,
        detalle: true,
      },
    });

    if (!pedido) {
      console.log("⚠️  No pedidos found in database. Create one first.");
      return;
    }

    console.log("📦 Sample Pedido:");
    console.log(`   ID: ${pedido.id}`);
    console.log(`   Código: ${pedido.codigo}`);
    console.log(`   Cliente: ${pedido.clienteNombre}`);
    console.log(`   Detalle: ${pedido.detalle || "(vacío)"}\n`);

    // Test updating detalle
    const testDetalle = "Este es un detalle de prueba para verificar que el campo funciona correctamente.";

    console.log("✏️  Updating detalle...");
    const updated = await prisma.pedido.update({
      where: { id: pedido.id },
      data: { detalle: testDetalle },
      select: {
        id: true,
        codigo: true,
        detalle: true,
      },
    });

    console.log(`✅ Detalle updated successfully!`);
    console.log(`   New detalle: ${updated.detalle}\n`);

    // Test clearing detalle
    console.log("🧹 Clearing detalle...");
    await prisma.pedido.update({
      where: { id: pedido.id },
      data: { detalle: null },
    });

    console.log("✅ Detalle cleared successfully!\n");

    console.log("🎉 All tests passed! The detalle field is working correctly.");
  } catch (error) {
    console.error("❌ Test failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDetalleField();
