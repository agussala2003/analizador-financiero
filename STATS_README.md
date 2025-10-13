# 📊 Panel de Estadísticas - Quick Reference

## 🚀 Acceso Rápido
1. Ir a `/admin`
2. Click en tab **"Estadísticas"**
3. ¡Listo! 🎉

## 📈 Métricas Disponibles

### 👥 Usuarios
- Total, nuevos, activos, con permiso blog
- Distribución por roles

### 📝 Blog  
- Artículos, likes, comentarios, guardados
- Estados, top autores

### 💼 Portfolio
- Transacciones, símbolos, usuarios
- Top símbolos negociados

### ⭐ Watchlist
- Items, símbolos, usuarios
- Símbolos más guardados

### 💡 Sugerencias
- Total, por estado, recientes

### 🔒 Actividad
- Logins, registros, logs
- Errores, advertencias, eventos

## ⏱️ Filtros Temporales
- 24h | 7d | **30d** | 3m | 1y | Todo

## 📁 Archivos

```
src/features/admin/
├── hooks/
│   └── use-admin-stats.ts          # Queries
└── components/
    ├── admin-tabs.tsx               # Integración
    └── stats/
        ├── stat-card.tsx            # UI Card
        └── admin-stats-section.tsx  # Panel principal
```

## 📚 Documentación Completa
Ver `docs/ADMIN_STATS.md`

## ✅ Status
**100% Funcional** | 0 Errores | Production Ready
