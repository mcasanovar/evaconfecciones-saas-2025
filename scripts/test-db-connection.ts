import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testConnection() {
  console.log("🔍 Testing database connection...\n");

  try {
    // Test basic connection
    await prisma.$connect();
    console.log("✅ Database connection successful!\n");

    // Get counts
    const [pedidoCount, colegioCount, prendaCount, tallaCount, precioCount] = await Promise.all([
      prisma.pedido.count(),
      prisma.colegio.count(),
      prisma.prenda.count(),
      prisma.talla.count(),
      prisma.colegioPrendaTallaPrecio.count(),
    ]);

    console.log("📊 Database Statistics:");
    console.log(`   Pedidos: ${pedidoCount}`);
    console.log(`   Colegios: ${colegioCount}`);
    console.log(`   Prendas: ${prendaCount}`);
    console.log(`   Tallas: ${tallaCount}`);
    console.log(`   Precios: ${precioCount}`);
    console.log("");

    // Get sample data
    const samplePedido = await prisma.pedido.findFirst({
      include: {
        items: true,
        colegio: true,
      },
    });

    if (samplePedido) {
      console.log("📦 Sample Pedido:");
      console.log(`   Código: ${samplePedido.codigo}`);
      console.log(`   Cliente: ${samplePedido.clienteNombre} ${samplePedido.clienteApellido || ""}`);
      console.log(`   Estado: ${samplePedido.estado}`);
      console.log(`   Total: $${samplePedido.total}`);
      console.log(`   Items: ${samplePedido.items.length}`);
      console.log(`   Colegio: ${samplePedido.colegio?.nombre || "N/A"}`);
    } else {
      console.log("⚠️  No pedidos found in database");
    }

    console.log("\n✅ Database test completed successfully!");
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
