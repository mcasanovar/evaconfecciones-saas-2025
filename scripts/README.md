# Scripts de Base de Datos

Este directorio contiene scripts para operaciones masivas en la base de datos.

## update-falda-jersey-prices.ts

Script para actualizar los precios de las prendas "Falda" y "Jersey" para todos los colegios activos.

### Precios Configurados

#### Falda:
- Tallas 4, 6, 8: $18,500
- Tallas 10, 12: $19,800
- Tallas 14, 16: $22,500
- Tallas S, M: $24,500
- Tallas L, XL: $25,600
- Talla 2XL: $26,600

#### Jersey:
- Tallas 4, 6, 8, 10: $19,500
- Tallas 12, 14: $22,500
- Tallas 16, S: $24,500
- Tallas M, L: $25,000
- Talla 2XL: $26,500

### Uso

```bash
# Ejecutar el script
npx tsx scripts/update-falda-jersey-prices.ts
```

### Qué hace el script:

1. **Busca o crea** las prendas "Falda" y "Jersey" en la base de datos
2. **Busca o crea** todas las tallas necesarias (4, 6, 8, 10, 12, 14, 16, S, M, L, XL, 2XL)
3. Obtiene todos los colegios activos
4. Para cada colegio y cada talla:
   - Si el precio ya existe y es diferente, lo actualiza
   - Si no existe, lo crea
5. Muestra un resumen detallado de las operaciones realizadas

### Seguridad:

- ✅ **Auto-creación:** Crea automáticamente prendas y tallas si no existen
- ✅ Solo actualiza colegios activos
- ✅ No elimina datos existentes
- ✅ **Optimizado:** Solo actualiza precios que realmente cambiaron
- ✅ Crea precios faltantes automáticamente
- ✅ Maneja errores de forma segura
- ✅ Muestra un resumen detallado

### Ejemplo de salida:

```
🚀 Iniciando actualización de precios...

✅ Prenda "Falda" encontrada (ID: 1)
✅ Prenda "Jersey" encontrada (ID: 2)

📚 Se encontraron 5 colegios activos

⚠️  Talla "2XL" no encontrada, creándola...
✅ Talla "2XL" creada (ID: 13)

✅ Se crearon 1 tallas nuevas

🔄 Actualizando precios de Falda...
✅ Falda: 45 precios actualizados, 15 precios creados

🔄 Actualizando precios de Jersey...
✅ Jersey: 40 precios actualizados, 15 precios creados

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN DE ACTUALIZACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📏 Tallas creadas: 1

👔 Falda:
   • Precios actualizados: 45
   • Precios creados: 15

🧥 Jersey:
   • Precios actualizados: 40
   • Precios creados: 15

✅ Total de operaciones de precios: 115

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Actualización completada exitosamente!
```

### Notas:

- ✅ **El script es idempotente:** Puedes ejecutarlo múltiples veces sin problemas
- ✅ **Auto-creación inteligente:** Si una prenda o talla no existe, se crea automáticamente
- ✅ **Optimización:** Solo actualiza precios que realmente cambiaron
- ✅ **Alcance:** Los precios se actualizan para TODOS los colegios activos
- ⚠️ **Importante:** Asegúrate de tener al menos un colegio activo en la base de datos
