import { PrismaClient, PedidoEstado } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.colegioPrendaTallaPrecio.deleteMany();
  await prisma.talla.deleteMany();
  await prisma.prenda.deleteMany();
  await prisma.colegio.deleteMany();

  // Create Colegios
  const colegios = await Promise.all([
    prisma.colegio.create({
      data: { nombre: "Colegio San José" },
    }),
    prisma.colegio.create({
      data: { nombre: "Instituto Nacional" },
    }),
    prisma.colegio.create({
      data: { nombre: "Liceo de Aplicación" },
    }),
  ]);

  console.log(`✅ Created ${colegios.length} colegios`);

  // Create Prendas
  const prendas = await Promise.all([
    prisma.prenda.create({
      data: {
        nombre: "Camisa",
        descripcion: "Camisa blanca de uniforme",
      },
    }),
    prisma.prenda.create({
      data: {
        nombre: "Pantalón",
        descripcion: "Pantalón gris de uniforme",
      },
    }),
    prisma.prenda.create({
      data: {
        nombre: "Falda",
        descripcion: "Falda tableada",
      },
    }),
    prisma.prenda.create({
      data: {
        nombre: "Polera",
        descripcion: "Polera de educación física",
      },
    }),
    prisma.prenda.create({
      data: {
        nombre: "Buzo",
        descripcion: "Buzo deportivo",
      },
    }),
  ]);

  console.log(`✅ Created ${prendas.length} prendas`);

  // Create Tallas
  const tallas = await Promise.all([
    prisma.talla.create({ data: { nombre: "XS", orden: 1 } }),
    prisma.talla.create({ data: { nombre: "S", orden: 2 } }),
    prisma.talla.create({ data: { nombre: "M", orden: 3 } }),
    prisma.talla.create({ data: { nombre: "L", orden: 4 } }),
    prisma.talla.create({ data: { nombre: "XL", orden: 5 } }),
    prisma.talla.create({ data: { nombre: "XXL", orden: 6 } }),
  ]);

  console.log(`✅ Created ${tallas.length} tallas`);

  // Create Prices (Colegio + Prenda + Talla combinations)
  const preciosData = [];
  for (const colegio of colegios) {
    for (const prenda of prendas) {
      for (const talla of tallas) {
        // Generate random prices between 8000 and 25000 CLP
        const precio = Math.floor(Math.random() * (25000 - 8000 + 1)) + 8000;
        preciosData.push({
          colegioId: colegio.id,
          prendaId: prenda.id,
          tallaId: talla.id,
          precio,
        });
      }
    }
  }

  await prisma.colegioPrendaTallaPrecio.createMany({
    data: preciosData,
  });
  console.log(`✅ Created ${preciosData.length} precios`);

  // Create sample Pedidos
  const currentYear = new Date().getFullYear();

  // Pedido 1 - INGRESADO
  const pedido1 = await prisma.pedido.create({
    data: {
      codigo: "PED-2024-001",
      clienteNombre: "María",
      clienteApellido: "González",
      clienteTelefono: "+56912345678",
      clienteEmail: "maria.gonzalez@email.com",
      colegioId: colegios[0].id,
      anio: currentYear,
      estado: PedidoEstado.INGRESADO,
      fechaCreacion: new Date(),
      total: 0,
      abono: 0,
      saldo: 0,
    },
  });

  await prisma.pedidoItem.createMany({
    data: [
      {
        pedidoId: pedido1.id,
        prendaId: prendas[0].id, // Camisa
        tallaId: tallas[2].id, // M
        cantidad: 2,
        precioUnitario: 12000,
        subtotal: 24000,
        estaLista: false,
      },
      {
        pedidoId: pedido1.id,
        prendaId: prendas[1].id, // Pantalón
        tallaId: tallas[2].id, // M
        cantidad: 2,
        precioUnitario: 18000,
        subtotal: 36000,
        estaLista: false,
      },
    ],
  });

  await prisma.pedido.update({
    where: { id: pedido1.id },
    data: {
      total: 60000,
      abono: 30000,
      saldo: 30000,
    },
  });

  // Pedido 2 - EN_PROCESO
  const pedido2 = await prisma.pedido.create({
    data: {
      codigo: "PED-2024-002",
      clienteNombre: "Juan",
      clienteApellido: "Pérez",
      clienteTelefono: "+56987654321",
      colegioId: colegios[1].id,
      anio: currentYear,
      estado: PedidoEstado.EN_PROCESO,
      fechaCreacion: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      fechaEntrega: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      total: 0,
      abono: 0,
      saldo: 0,
    },
  });

  await prisma.pedidoItem.createMany({
    data: [
      {
        pedidoId: pedido2.id,
        prendaId: prendas[3].id, // Polera
        tallaId: tallas[3].id, // L
        cantidad: 3,
        precioUnitario: 10000,
        subtotal: 30000,
        estaLista: true,
      },
      {
        pedidoId: pedido2.id,
        prendaId: prendas[4].id, // Buzo
        tallaId: tallas[3].id, // L
        cantidad: 1,
        precioUnitario: 22000,
        subtotal: 22000,
        estaLista: false,
      },
    ],
  });

  await prisma.pedido.update({
    where: { id: pedido2.id },
    data: {
      total: 52000,
      abono: 52000,
      saldo: 0,
    },
  });

  // Pedido 3 - ENTREGADO
  const pedido3 = await prisma.pedido.create({
    data: {
      codigo: "PED-2024-003",
      clienteNombre: "Ana",
      clienteApellido: "Martínez",
      clienteTelefono: "+56911223344",
      clienteEmail: "ana.martinez@email.com",
      colegioId: colegios[2].id,
      anio: currentYear,
      estado: PedidoEstado.ENTREGADO,
      fechaCreacion: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      fechaEntrega: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      total: 0,
      abono: 0,
      saldo: 0,
    },
  });

  await prisma.pedidoItem.createMany({
    data: [
      {
        pedidoId: pedido3.id,
        prendaId: prendas[0].id, // Camisa
        tallaId: tallas[1].id, // S
        cantidad: 1,
        precioUnitario: 12000,
        subtotal: 12000,
        estaLista: true,
      },
      {
        pedidoId: pedido3.id,
        prendaId: prendas[2].id, // Falda
        tallaId: tallas[1].id, // S
        cantidad: 2,
        precioUnitario: 15000,
        subtotal: 30000,
        estaLista: true,
      },
    ],
  });

  await prisma.pedido.update({
    where: { id: pedido3.id },
    data: {
      total: 42000,
      abono: 42000,
      saldo: 0,
    },
  });

  // Pedido 4 - INGRESADO (more recent)
  const pedido4 = await prisma.pedido.create({
    data: {
      codigo: "PED-2024-004",
      clienteNombre: "Carlos",
      clienteApellido: "Rodríguez",
      clienteTelefono: "+56955667788",
      colegioId: colegios[0].id,
      anio: currentYear,
      estado: PedidoEstado.INGRESADO,
      fechaCreacion: new Date(),
      total: 0,
      abono: 0,
      saldo: 0,
    },
  });

  await prisma.pedidoItem.createMany({
    data: [
      {
        pedidoId: pedido4.id,
        prendaId: prendas[4].id, // Buzo
        tallaId: tallas[4].id, // XL
        cantidad: 2,
        precioUnitario: 22000,
        subtotal: 44000,
        estaLista: false,
      },
    ],
  });

  await prisma.pedido.update({
    where: { id: pedido4.id },
    data: {
      total: 44000,
      abono: 0,
      saldo: 44000,
    },
  });

  console.log(`✅ Created 4 sample pedidos with items`);
  console.log("🎉 Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
