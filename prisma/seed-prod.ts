import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting production seed...");

  // Clear existing data
  await prisma.pedidoItem.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.colegioPrendaTallaPrecio.deleteMany();
  await prisma.talla.deleteMany();
  await prisma.prenda.deleteMany();
  await prisma.colegio.deleteMany();

  // Lista de colegios, prendas y tallas
  const colegiosData = [
    { nombre: "Santa Teresa" },
    { nombre: "J.A.R" },
    { nombre: "Escuela 1" },
    { nombre: "Escuela 2" },
    { nombre: "Valle del Choapa" },
    { nombre: "San Isidro de Cuz-Cuz" },
    { nombre: "Jardin Pluma de Oro" },
    { nombre: "Altue" },
    { nombre: "Escuela Aysén" },
    { nombre: "Politécnico" },
    { nombre: "Luis Alberto Vera" },
  ];

  const prendasData = [
    { nombre: "Chaqueta polar" },
    { nombre: "Short" },
    { nombre: "Calza" },
    { nombre: "Chaqueta buzo" },
    { nombre: "Polera piqué" },
    { nombre: "Polera gimnasia" },
    { nombre: "Pantalón buzo" },
    { nombre: "Buzo" },
    { nombre: "Falda" },
    { nombre: "Jersey" },
  ];

  const tallasData = [
    { nombre: '2', orden: 1 },
    { nombre: '4', orden: 2 },
    { nombre: '6', orden: 3 },
    { nombre: '8', orden: 4 },
    { nombre: '10', orden: 5 },
    { nombre: '12', orden: 6 },
    { nombre: '14', orden: 7 },
    { nombre: '16', orden: 8 },
    { nombre: "S", orden: 9 },
    { nombre: "M", orden: 10 },
    { nombre: "L", orden: 11 },
    { nombre: "XL", orden: 12 },
    { nombre: "2XL", orden: 13 },
  ];

  const pricesData = [
    {
      nombre: "Chaqueta polar",
      tallas: ['4', '6', '8'],
      precio: 15000
    },
    {
      nombre: "Chaqueta polar",
      tallas: ['10', '12', '14'],
      precio: 19000
    },
    {
      nombre: "Chaqueta polar",
      tallas: ['16', 'S', 'M'],
      precio: 21000
    },
    {
      nombre: "Chaqueta polar",
      tallas: ['L', 'XL', '2XL'],
      precio: 23000
    },
    {
      nombre: "Short",
      tallas: ['4', '6', '8'],
      precio: 9500
    },
    {
      nombre: "Short",
      tallas: ['10', '12', '14'],
      precio: 11500
    },
    {
      nombre: "Short",
      tallas: ['16', 'S', 'M'],
      precio: 12500
    },
    {
      nombre: "Short",
      tallas: ['L', 'XL', '2XL'],
      precio: 13500
    },
    {
      nombre: "Calza",
      tallas: ['4', '6', '8'],
      precio: 9500
    },
    {
      nombre: "Calza",
      tallas: ['10', '12', '14'],
      precio: 11500
    },
    {
      nombre: "Calza",
      tallas: ['16', 'S', 'M'],
      precio: 12500
    },
    {
      nombre: "Calza",
      tallas: ['L', 'XL', '2XL'],
      precio: 13500
    },
    {
      nombre: "Chaqueta buzo",
      tallas: ['4', '6', '8'],
      precio: 19000
    },
    {
      nombre: "Chaqueta buzo",
      tallas: ['10', '12', '14'],
      precio: 20500
    },
    {
      nombre: "Chaqueta buzo",
      tallas: ['16', 'S', 'M'],
      precio: 21500
    },
    {
      nombre: "Chaqueta buzo",
      tallas: ['L', 'XL', '2XL'],
      precio: 22500
    },
    {
      nombre: "Polera piqué",
      tallas: ['4', '6', '8'],
      precio: 11900
    },
    {
      nombre: "Polera piqué",
      tallas: ['10', '12'],
      precio: 12900
    },
    {
      nombre: "Polera piqué",
      tallas: ['14', '16'],
      precio: 13900
    },
    {
      nombre: "Polera piqué",
      tallas: ['S', 'M'],
      precio: 14900
    },
    {
      nombre: "Polera piqué",
      tallas: ['L', 'XL'],
      precio: 15900
    },
    {
      nombre: "Polera piqué",
      tallas: ['2XL'],
      precio: 16900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['4', '6', '8'],
      precio: 10900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['10', '12'],
      precio: 11900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['14', '16'],
      precio: 12900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['S', 'M'],
      precio: 13900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['L', 'XL'],
      precio: 14900
    },
    {
      nombre: "Polera gimnasia",
      tallas: ['2XL'],
      precio: 15900
    },
    {
      nombre: "Pantalón buzo",
      tallas: ['4', '6', '8'],
      precio: 11000
    },
    {
      nombre: "Pantalón buzo",
      tallas: ['10', '12', '14'],
      precio: 14000
    },
    {
      nombre: "Pantalón buzo",
      tallas: ['16', 'S', 'M'],
      precio: 18000
    },
    {
      nombre: "Pantalón buzo",
      tallas: ['L', 'XL', '2XL'],
      precio: 19000
    },
    {
      nombre: "Buzo",
      tallas: ['4', '6', '8'],
      precio: 29500
    },
    {
      nombre: "Buzo",
      tallas: ['10', '12', '14'],
      precio: 31500
    },
    {
      nombre: "Buzo",
      tallas: ['16', 'S', 'M'],
      precio: 33500
    },
    {
      nombre: "Buzo",
      tallas: ['L', 'XL', '2XL'],
      precio: 36500
    },
    {
      nombre: "Falda",
      tallas: ['4', '6', '8'],
      precio: 18000
    },
    {
      nombre: "Falda",
      tallas: ['10', '12'],
      precio: 19000
    },
    {
      nombre: "Falda",
      tallas: ['14', '16'],
      precio: 21000
    },
    {
      nombre: "Falda",
      tallas: ['S', 'M'],
      precio: 23000
    },
    {
      nombre: "Falda",
      tallas: ['L', 'XL'],
      precio: 25000
    },
    {
      nombre: "Falda",
      tallas: ['2XL'],
      precio: 26000
    },
    {
      nombre: "Jersey",
      tallas: ['4', '6', '8', '10'],
      precio: 18000
    },
    {
      nombre: "Jersey",
      tallas: ['12', '14'],
      precio: 21000
    },
    {
      nombre: "Jersey",
      tallas: ['16', 'S'],
      precio: 23000
    },
    {
      nombre: "Jersey",
      tallas: ['M', 'L'],
      precio: 25000
    },
    {
      nombre: "Jersey",
      tallas: ['XL', '2XL'],
      precio: 26000
    },
  ]

  // 1. Crear/encontrar colegios
  console.log("\n📚 Creando colegios...");
  const colegios = [];
  for (const colegioData of colegiosData) {
    let colegio = await prisma.colegio.findFirst({
      where: { nombre: colegioData.nombre },
    });

    if (!colegio) {
      colegio = await prisma.colegio.create({
        data: {
          nombre: colegioData.nombre,
          activo: true,
        },
      });
    }

    colegios.push(colegio);
    console.log(`✅ ${colegio.nombre}`);
  }

  // 2. Crear/encontrar prendas
  console.log("\n👕 Creando prendas...");
  const prendas = [];
  for (const prendaData of prendasData) {
    let prenda = await prisma.prenda.findFirst({
      where: { nombre: prendaData.nombre },
    });

    if (!prenda) {
      prenda = await prisma.prenda.create({
        data: {
          nombre: prendaData.nombre,
          activo: true,
        },
      });
    }

    prendas.push(prenda);
    console.log(`✅ ${prenda.nombre}`);
  }

  // 3. Crear/encontrar tallas
  console.log("\n📏 Creando tallas...");
  const tallas = [];
  for (const tallaData of tallasData) {
    let talla = await prisma.talla.findFirst({
      where: { nombre: tallaData.nombre },
    });

    if (!talla) {
      talla = await prisma.talla.create({
        data: {
          nombre: tallaData.nombre,
          orden: tallaData.orden,
          activo: true,
        },
      });
    }

    tallas.push(talla);
    console.log(`✅ ${talla.nombre}`);
  }

  // 4. Crear precios basados en pricesData
  console.log("\n💰 Creando precios...");
  let preciosCreados = 0;
  let preciosOmitidos = 0;
  const preciosCreatedSet = new Set<string>(); // Para evitar duplicados

  for (const colegio of colegios) {
    for (const priceConfig of pricesData) {
      // Encontrar la prenda por nombre
      const prenda = prendas.find(p => p.nombre === priceConfig.nombre);
      if (!prenda) {
        console.warn(`⚠️  Prenda no encontrada: ${priceConfig.nombre}`);
        continue;
      }

      // Para cada talla especificada en el priceConfig
      for (const tallaNombre of priceConfig.tallas) {
        // Encontrar la talla por nombre
        const talla = tallas.find(t => t.nombre === tallaNombre);
        if (!talla) {
          console.warn(`⚠️  Talla no encontrada: ${tallaNombre}`);
          continue;
        }

        // Crear clave única para verificar duplicados
        const key = `${colegio.id}-${prenda.id}-${talla.id}`;
        if (preciosCreatedSet.has(key)) {
          console.warn(`⚠️  Precio duplicado omitido: ${colegio.nombre} - ${prenda.nombre} - ${talla.nombre}`);
          preciosOmitidos++;
          continue;
        }

        try {
          // Crear el precio
          await prisma.colegioPrendaTallaPrecio.create({
            data: {
              colegioId: colegio.id,
              prendaId: prenda.id,
              tallaId: talla.id,
              precio: priceConfig.precio,
            },
          });
          preciosCreatedSet.add(key);
          preciosCreados++;
        } catch (error) {
          console.error(`❌ Error creando precio: ${colegio.nombre} - ${prenda.nombre} - ${talla.nombre}`);
          console.error(error);
          preciosOmitidos++;
        }
      }
    }
    console.log(`✅ ${colegio.nombre}: Precios configurados`);
  }

  console.log("\n📊 Resumen:");
  console.log(`   Colegios: ${colegios.length}`);
  console.log(`   Prendas: ${prendas.length}`);
  console.log(`   Tallas: ${tallas.length}`);
  console.log(`   Precios creados: ${preciosCreados}`);
  console.log(`   Precios omitidos: ${preciosOmitidos}`);
  console.log(`   Configuraciones de precio: ${pricesData.length}`);
  console.log(`   Total registros de precio: ${preciosCreados} (${colegios.length} colegios × configuraciones)`);
  console.log("\n🎉 Production seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
