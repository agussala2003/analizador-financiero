# 🚀 Quick Start: Sectores e Industrias

## 📍 ¿Dónde está la feature?

**URL:** `http://localhost:5173/sectors-industries`

**En el sidebar:** 
```
Herramientas
  ├── Inicio
  ├── Dashboard
  ├── Portafolio
  ├── Movimientos del Mercado
  ├── Watchlist
  ├── Insights
  ├── 🆕 Sectores e Industrias  ← AQUÍ
  ├── Calendario Económico
  └── ...
```

---

## 🎯 ¿Qué hace?

Permite analizar el **performance histórico** de:
- **180+ industrias** (ej: Biotechnology, Steel, Solar)
- **11 sectores** (ej: Healthcare, Energy, Technology)

---

## 💡 Cómo Usar

### Paso 1: Navegar a la página
```
1. Iniciar sesión (requiere autenticación)
2. Ir a /sectors-industries o click en sidebar
3. Ver tabs: "Industrias" | "Sectores"
```

### Paso 2: Seleccionar industria o sector
```
1. Click en el dropdown
2. Buscar/scroll para encontrar (ej: "Biotechnology")
3. Seleccionar
```

### Paso 3: Analizar datos
Se mostrarán automáticamente:
- ✅ **4 Cards de estadísticas**
  - Último cambio
  - Promedio del período
  - Valor máximo
  - Valor mínimo

- ✅ **Gráfico de líneas**
  - Histórico de cambios diarios
  - Tooltip con info al hover
  - Línea de referencia en 0%

- ✅ **Tabla de datos**
  - Últimos 15 registros
  - Fecha | Bolsa | Cambio %
  - Scroll para ver más

---

## 🎨 Capturas Conceptuales

### Vista de Industrias
```
┌─────────────────────────────────────────────────────┐
│  [🏭 Sectores e Industrias]                         │
│  Analiza el performance histórico de sectores...    │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Industrias] | Sectores                            │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Seleccionar Industria                              │
│  [Biotechnology ▼]                                  │
└─────────────────────────────────────────────────────┘

┌─────────────┬─────────────┬─────────────┬──────────┐
│ Último      │ Promedio    │ Máximo      │ Mínimo   │
│ +2.61%      │ +1.23%      │ +9.45%      │ -2.11%   │
│ 2024-03-01  │ Período     │ Mejor día   │ Peor día │
└─────────────┴─────────────┴─────────────┴──────────┘

┌─────────────────────────────────────────────────────┐
│  Performance de Biotechnology                       │
│  ╭─────────────────────────────────────────────╮   │
│  │         /\    /\                           │   │
│  │    /\  /  \  /  \    /\                    │   │
│  │___/  \/____\/____\__/__\_________________  │   │
│  │                       \  /      \         │   │
│  │                        \/        \___/    │   │
│  ╰─────────────────────────────────────────────╯   │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Historial Reciente                                 │
│  ┌─────────┬─────────┬────────────────────────┐   │
│  │ Fecha   │ Bolsa   │ Cambio Promedio        │   │
│  ├─────────┼─────────┼────────────────────────┤   │
│  │ 1 Mar   │ NASDAQ  │ +2.61%                 │   │
│  │ 29 Feb  │ NASDAQ  │ -1.46%                 │   │
│  │ 28 Feb  │ NASDAQ  │ -0.83%                 │   │
│  │ ...     │ ...     │ ...                    │   │
│  └─────────┴─────────┴────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints Usados

```typescript
// 1. Obtener lista de industrias
GET /stable/available-industries
→ [{ "industry": "Biotechnology" }, ...]

// 2. Obtener lista de sectores
GET /stable/available-sectors
→ [{ "sector": "Healthcare" }, ...]

// 3. Performance de industria
GET /stable/historical-industry-performance?industry=Biotechnology
→ [{ "date": "2024-03-01", "averageChange": 2.61, ... }, ...]

// 4. Performance de sector
GET /stable/historical-sector-performance?sector=Energy
→ [{ "date": "2024-03-01", "averageChange": 1.39, ... }, ...]
```

---

## 🛠️ Ejemplos de Uso

### Ejemplo 1: Ver performance de industria
```typescript
1. Usuario navega a /sectors-industries
2. Tab "Industrias" activo por defecto
3. Selecciona "Biotechnology" del dropdown
4. useIndustryPerformance('Biotechnology') se ejecuta
5. Datos se muestran en cards, gráfico y tabla
```

### Ejemplo 2: Comparar sector
```typescript
1. Usuario hace click en tab "Sectores"
2. Selecciona "Energy" del dropdown
3. useSectorPerformance('Energy') se ejecuta
4. Datos se renderizan
5. Usuario ve que Energy tuvo +1.39% el último día
```

### Ejemplo 3: Analizar tendencias
```typescript
1. Usuario selecciona "Solar" (industria)
2. Ve en el gráfico:
   - Volatilidad alta (picos y valles)
   - Tendencia alcista reciente
3. En la tabla confirma:
   - Últimos 5 días: positivos
   - Promedio: +2.5%
```

---

## 📊 Datos Disponibles

### Industrias (180+)
```
- Aerospace & Defense
- Agricultural Inputs
- Auto Manufacturers
- Biotechnology
- Chemicals
- Computer Hardware
- Drug Manufacturers
- Energy
- Financial Services
- Healthcare
- Real Estate
- Semiconductors
- Software
- Steel
- ... y 160+ más
```

### Sectores (11)
```
1. Basic Materials
2. Communication Services
3. Consumer Cyclical
4. Consumer Defensive
5. Energy
6. Financial Services
7. Healthcare
8. Industrials
9. Real Estate
10. Technology
11. Utilities
```

---

## 🎯 Use Cases

### 1. Inversor Buscando Oportunidades
```
Objetivo: Encontrar sectores con mejor performance
Acción: 
  1. Ver tab "Sectores"
  2. Revisar uno por uno
  3. Comparar promedios
  4. Identificar sectores alcistas
```

### 2. Analista de Mercado
```
Objetivo: Estudiar tendencia de industria específica
Acción:
  1. Tab "Industrias"
  2. Buscar industria target (ej: "Solar")
  3. Analizar gráfico de 30 días
  4. Verificar volatilidad
```

### 3. Diversificación de Portfolio
```
Objetivo: Identificar sectores con baja correlación
Acción:
  1. Revisar performance de múltiples sectores
  2. Notar cuáles se mueven en direcciones opuestas
  3. Usar info para balancear portfolio
```

---

## ⚡ Shortcuts & Tips

### Tip 1: Búsqueda Rápida
```
Los dropdowns son searchable:
1. Click en dropdown
2. Empieza a escribir: "bio"
3. Auto-filtra a: "Biotechnology"
```

### Tip 2: Leer el Gráfico
```
- Verde arriba de 0%: Performance positivo
- Rojo abajo de 0%: Performance negativo
- Picos altos: Días de alta ganancia
- Valles profundos: Días de pérdida
```

### Tip 3: Interpretar Stats
```
Último Cambio:  ¿Cómo cerró hoy?
Promedio:       ¿Tendencia general?
Máximo:         ¿Qué tan alto puede llegar?
Mínimo:         ¿Qué tan bajo ha caído?
```

---

## 🐛 Troubleshooting

### Problema: No aparece en el sidebar
**Solución:** Verifica que estés autenticado (login requerido)

### Problema: Dropdown vacío
**Solución:** Espera unos segundos, los datos se están cargando

### Problema: "No hay datos disponibles"
**Solución:** 
- Verifica conexión a internet
- Puede que esa industria/sector no tenga historial
- Intenta con otra opción

### Problema: Gráfico no se muestra
**Solución:**
- Refresca la página
- Verifica consola de browser para errores
- Puede ser problema de API límite

---

## 📱 Responsive Design

### Desktop (>1024px)
```
- Sidebar completo visible
- Stats en 4 columnas
- Gráfico a ancho completo
- Tabla con todas las columnas
```

### Tablet (768px - 1024px)
```
- Sidebar colapsable
- Stats en 2 columnas
- Gráfico responsive
- Tabla scroll horizontal
```

### Mobile (<768px)
```
- Sidebar como menú hamburguesa
- Stats en 1 columna
- Gráfico optimizado
- Tabla con scroll
```

---

## 🎓 Conceptos Clave

### ¿Qué es una Industria?
```
Subcategoría específica dentro de un sector.
Ejemplo: "Biotechnology" es una industria del sector "Healthcare"
```

### ¿Qué es un Sector?
```
Categoría amplia que agrupa industrias relacionadas.
Ejemplo: "Healthcare" incluye: Biotechnology, Medical Devices, Pharma, etc.
```

### ¿Qué es "Average Change"?
```
Cambio porcentual promedio de todas las acciones en esa
industria/sector durante ese día.

+2.5% = Las acciones de esa categoría subieron 2.5% en promedio
-1.3% = Las acciones de esa categoría bajaron 1.3% en promedio
```

---

## ✅ Checklist de Features

- [x] Ver lista de industrias
- [x] Ver lista de sectores
- [x] Seleccionar industria específica
- [x] Seleccionar sector específico
- [x] Ver estadísticas calculadas
- [x] Ver gráfico de performance
- [x] Ver tabla de datos históricos
- [x] Cambiar entre tabs
- [x] Estados de carga (loading)
- [x] Manejo de errores
- [x] Responsive design
- [x] Tooltips informativos
- [x] Formato de fechas localizado
- [x] Colores dinámicos (verde/rojo)

---

## 🚀 Ready to Use!

La feature está **completamente funcional** y lista para usar. 

**Para empezar:**
```bash
npm run dev
# → http://localhost:5173/sectors-industries
```

**Requiere:**
- ✅ Usuario autenticado
- ✅ Conexión a internet
- ✅ API keys válidas en Supabase Edge Functions

---

## 📞 Ayuda

**Documentación Completa:**
- `/src/features/sectors-industries/README.md`
- `/docs/SECTORS_INDUSTRIES_IMPLEMENTATION.md`

**Arquitectura del Proyecto:**
- `/docs/ARCHITECTURE.md`
- `/.github/copilot-instructions.md`
