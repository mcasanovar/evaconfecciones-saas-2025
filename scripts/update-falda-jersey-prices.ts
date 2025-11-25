/**
 * Script para actualizar precios de Falda y Jersey para todos los colegios
 * 
 * Uso:
 * npx tsx scripts/update-falda-jersey-prices.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de precios para Falda
const faldaPrices: Record<string, number> = {
  '4': 18500,
  '6': 18500,
  '8': 18500,
  '10': 19800,
  '12': 19800,
  '14': 22500,
  '16': 22500,
  'S': 24500,
  'M': 24500,
  'L': 25600,
  'XL': 25600,
  '2XL': 26600,
};

// Mapeo de precios para Jersey
const jerseyPrices: Record<string, number> = {
  '4': 19500,
  '6': 19500,
  '8': 19500,
  '10': 19500,
  '12': 22500,
  '14': 22500,
  '16': 24500,
  'S': 24500,
  'M': 25000,
  'L': 25000,
  '2XL': 26500,
};

async function updatePrices() {
  console.log('🚀 Iniciando actualización de precios...\n');

  try {
    // 1. Obtener o crear las prendas "Falda" y "Jersey"
    let falda = await prisma.prenda.findFirst({
      where: { nombre: { equals: 'Falda', mode: 'insensitive' } }
    });

    if (!falda) {
      console.log('⚠️  Prenda "Falda" no encontrada, creándola...');
      falda = await prisma.prenda.create({
        data: {
          nombre: 'Falda',
          descripcion: 'Falda escolar',
          activo: true,
        }
      });
      console.log(`✅ Prenda "Falda" creada (ID: ${falda.id})`);
    } else {
      console.log(`✅ Prenda "Falda" encontrada (ID: ${falda.id})`);
    }

    let jersey = await prisma.prenda.findFirst({
      where: { nombre: { equals: 'Jersey', mode: 'insensitive' } }
    });

    if (!jersey) {
      console.log('⚠️  Prenda "Jersey" no encontrada, creándola...');
      jersey = await prisma.prenda.create({
        data: {
          nombre: 'Jersey',
          descripcion: 'Jersey escolar',
          activo: true,
        }
      });
      console.log(`✅ Prenda "Jersey" creada (ID: ${jersey.id})`);
    } else {
      console.log(`✅ Prenda "Jersey" encontrada (ID: ${jersey.id})`);
    }

    console.log('');

    // 2. Obtener todos los colegios activos
    const colegios = await prisma.colegio.findMany({
      where: { activo: true }
    });

    console.log(`📚 Se encontraron ${colegios.length} colegios activos\n`);

    // 3. Obtener o crear todas las tallas necesarias
    const tallasNecesarias = ['4', '6', '8', '10', '12', '14', '16', 'S', 'M', 'L', 'XL', '2XL'];
    const tallasOrden: Record<string, number> = {
      '4': 1, '6': 2, '8': 3, '10': 4, '12': 5, '14': 6, '16': 7,
      'S': 8, 'M': 9, 'L': 10, 'XL': 11, '2XL': 12
    };

    const tallasMap = new Map<string, number>();
    let tallasCreadas = 0;

    for (const tallaNombre of tallasNecesarias) {
      let talla = await prisma.talla.findFirst({
        where: { nombre: { equals: tallaNombre, mode: 'insensitive' } }
      });

      if (!talla) {
        console.log(`⚠️  Talla "${tallaNombre}" no encontrada, creándola...`);
        talla = await prisma.talla.create({
          data: {
            nombre: tallaNombre,
            orden: tallasOrden[tallaNombre] || 99,
            activo: true,
          }
        });
        tallasCreadas++;
        console.log(`✅ Talla "${tallaNombre}" creada (ID: ${talla.id})`);
      }

      tallasMap.set(tallaNombre, talla.id);
    }

    if (tallasCreadas > 0) {
      console.log(`\n✅ Se crearon ${tallasCreadas} tallas nuevas\n`);
    } else {
      console.log(`📏 Todas las tallas necesarias ya existen\n`);
    }

    let updatedCount = 0;
    let createdCount = 0;
    let skippedCount = 0;

    // 4. Actualizar precios de Falda
    console.log('🔄 Actualizando precios de Falda...');
    for (const colegio of colegios) {
      for (const [tallaNombre, precio] of Object.entries(faldaPrices)) {
        const tallaId = tallasMap.get(tallaNombre);

        if (!tallaId) {
          console.log(`⚠️  Error: Talla "${tallaNombre}" no encontrada en el mapa`);
          skippedCount++;
          continue;
        }

        // Buscar si ya existe el precio
        const existingPrice = await prisma.colegioPrendaTallaPrecio.findFirst({
          where: {
            colegioId: colegio.id,
            prendaId: falda.id,
            tallaId: tallaId,
          }
        });

        if (existingPrice) {
          // Actualizar precio existente solo si cambió
          if (existingPrice.precio !== precio) {
            await prisma.colegioPrendaTallaPrecio.update({
              where: { id: existingPrice.id },
              data: { precio }
            });
            updatedCount++;
          }
        } else {
          // Crear nuevo precio
          await prisma.colegioPrendaTallaPrecio.create({
            data: {
              colegioId: colegio.id,
              prendaId: falda.id,
              tallaId: tallaId,
              precio
            }
          });
          createdCount++;
        }
      }
    }

    console.log(`✅ Falda: ${updatedCount} precios actualizados, ${createdCount} precios creados\n`);

    // Reset counters
    const faldaUpdated = updatedCount;
    const faldaCreated = createdCount;
    updatedCount = 0;
    createdCount = 0;

    // 5. Actualizar precios de Jersey
    console.log('🔄 Actualizando precios de Jersey...');
    for (const colegio of colegios) {
      for (const [tallaNombre, precio] of Object.entries(jerseyPrices)) {
        const tallaId = tallasMap.get(tallaNombre);

        if (!tallaId) {
          console.log(`⚠️  Error: Talla "${tallaNombre}" no encontrada en el mapa`);
          skippedCount++;
          continue;
        }

        // Buscar si ya existe el precio
        const existingPrice = await prisma.colegioPrendaTallaPrecio.findFirst({
          where: {
            colegioId: colegio.id,
            prendaId: jersey.id,
            tallaId: tallaId,
          }
        });

        if (existingPrice) {
          // Actualizar precio existente solo si cambió
          if (existingPrice.precio !== precio) {
            await prisma.colegioPrendaTallaPrecio.update({
              where: { id: existingPrice.id },
              data: { precio }
            });
            updatedCount++;
          }
        } else {
          // Crear nuevo precio
          await prisma.colegioPrendaTallaPrecio.create({
            data: {
              colegioId: colegio.id,
              prendaId: jersey.id,
              tallaId: tallaId,
              precio
            }
          });
          createdCount++;
        }
      }
    }

    console.log(`✅ Jersey: ${updatedCount} precios actualizados, ${createdCount} precios creados\n`);

    // Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE ACTUALIZACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (tallasCreadas > 0) {
      console.log(`\n� Tallas creadas: ${tallasCreadas}`);
    }

    console.log(`\n�👔 Falda:`);
    console.log(`   • Precios actualizados: ${faldaUpdated}`);
    console.log(`   • Precios creados: ${faldaCreated}`);
    console.log(`\n🧥 Jersey:`);
    console.log(`   • Precios actualizados: ${updatedCount}`);
    console.log(`   • Precios creados: ${createdCount}`);

    if (skippedCount > 0) {
      console.log(`\n⚠️  Operaciones saltadas: ${skippedCount}`);
    }

    console.log(`\n✅ Total de operaciones de precios: ${faldaUpdated + faldaCreated + updatedCount + createdCount}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error durante la actualización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
updatePrices()
  .then(() => {
    console.log('🎉 Actualización completada exitosamente!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
