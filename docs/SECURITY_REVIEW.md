# Resumen de Seguridad y RLS - FinDash

## Variables de Entorno

Las siguientes variables de entorno se manejan correctamente y no están expuestas en el código del cliente:

### Variables Públicas (Seguras para el Cliente)
- `VITE_SUPABASE_URL`: URL pública de Supabase
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Clave pública anónima de Supabase (segura para exposición)

### Variables Privadas (Solo Backend/Edge Functions)
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio (NUNCA expuesta al cliente)
- `FMP_API_KEY`: API key de Financial Modeling Prep (usada en edge functions)

**Estado**: ✅ Las claves sensibles están correctamente protegidas en Edge Functions.

---

## Row Level Security (RLS) - Políticas de Supabase

### Tabla: `profiles`
**Propósito**: Almacenar información de perfil de usuario (rol, permisos, fechas).

**Políticas RLS**:
1. **SELECT**: Los usuarios solo pueden leer su propio perfil
   ```sql
   CREATE POLICY "Users can view own profile"
   ON profiles FOR SELECT
   USING (auth.uid() = id);
   ```

2. **UPDATE**: Los usuarios solo pueden actualizar su propio perfil (excepto `role`)
   ```sql
   CREATE POLICY "Users can update own profile"
   ON profiles FOR UPDATE
   USING (auth.uid() = id)
   WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
   ```

**Estado**: ✅ Los usuarios no pueden modificar el rol de otros ni ver perfiles ajenos.

---

### Tabla: `transactions`
**Propósito**: Almacenar transacciones de compra/venta del portafolio.

**Políticas RLS**:
1. **SELECT**: Los usuarios solo pueden ver sus propias transacciones
   ```sql
   CREATE POLICY "Users can view own transactions"
   ON transactions FOR SELECT
   USING (auth.uid() = user_id);
   ```

2. **INSERT**: Los usuarios solo pueden crear transacciones para sí mismos
   ```sql
   CREATE POLICY "Users can insert own transactions"
   ON transactions FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

3. **DELETE**: Los usuarios solo pueden eliminar sus propias transacciones
   ```sql
   CREATE POLICY "Users can delete own transactions"
   ON transactions FOR DELETE
   USING (auth.uid() = user_id);
   ```

**Estado**: ✅ Las transacciones están completamente aisladas por usuario.

---

### Tabla: `logs`
**Propósito**: Registrar eventos de la aplicación para auditoría.

**Políticas RLS**:
1. **INSERT**: Cualquier usuario autenticado puede insertar logs
   ```sql
   CREATE POLICY "Authenticated users can insert logs"
   ON logs FOR INSERT
   WITH CHECK (auth.uid() IS NOT NULL);
   ```

2. **SELECT**: Solo administradores pueden leer logs
   ```sql
   CREATE POLICY "Only admins can view logs"
   ON logs FOR SELECT
   USING (
     EXISTS (
       SELECT 1 FROM profiles
       WHERE id = auth.uid() AND role = 'administrador'
     )
   );
   ```

**Estado**: ✅ Los logs están protegidos y solo accesibles para administradores.

---

### Tabla: `suggestions`
**Propósito**: Almacenar sugerencias de usuarios.

**Políticas RLS**:
1. **SELECT**: Los usuarios pueden ver sus propias sugerencias, administradores ven todas
   ```sql
   CREATE POLICY "Users can view own suggestions, admins view all"
   ON suggestions FOR SELECT
   USING (
     auth.uid() = user_id OR
     EXISTS (
       SELECT 1 FROM profiles
       WHERE id = auth.uid() AND role = 'administrador'
     )
   );
   ```

2. **INSERT**: Los usuarios autenticados pueden crear sugerencias
   ```sql
   CREATE POLICY "Authenticated users can insert suggestions"
   ON suggestions FOR INSERT
   WITH CHECK (auth.uid() = user_id);
   ```

**Estado**: ✅ Sugerencias protegidas, con acceso administrativo para revisión.

---

### Tabla: `blogs`
**Propósito**: Almacenar artículos del blog.

**Políticas RLS**:
1. **SELECT**: Todos pueden ver blogs publicados, autores ven sus propios borradores
   ```sql
   CREATE POLICY "Public can view published blogs"
   ON blogs FOR SELECT
   USING (
     status = 'published' OR
     auth.uid() = author_id
   );
   ```

2. **INSERT**: Solo usuarios con permiso `can_upload_blog` pueden crear blogs
   ```sql
   CREATE POLICY "Only users with permission can create blogs"
   ON blogs FOR INSERT
   WITH CHECK (
     auth.uid() = author_id AND
     EXISTS (
       SELECT 1 FROM profiles
       WHERE id = auth.uid() AND can_upload_blog = true
     )
   );
   ```

3. **UPDATE**: Los autores solo pueden editar sus propios blogs
   ```sql
   CREATE POLICY "Authors can update own blogs"
   ON blogs FOR UPDATE
   USING (auth.uid() = author_id);
   ```

**Estado**: ✅ Sistema de permisos implementado correctamente.

---

## Límites de Planes Aplicados

### 1. **dashboard.maxTickersToCompare**
- **Dónde**: `DashboardProvider.addTicker()`
- **Implementación**: Se verifica el rol del usuario y se compara con el límite del plan
- **Valores**:
  - Básico: 3 activos
  - Plus: 5 activos
  - Premium: 10 activos
  - Administrador: 20 activos

### 2. **plans.freeTierSymbols**
- **Dónde**: `DashboardProvider.addTicker()`
- **Implementación**: Los usuarios del plan Básico solo pueden agregar símbolos de la lista permitida
- **Impacto**: ~90 activos populares disponibles para plan gratuito

### 3. **plans.portfolioLimits**
- **Dónde**: (Por implementar) `PortfolioProvider` o al crear nuevos portafolios
- **Implementación Sugerida**: Validar el número de portafolios activos antes de permitir crear uno nuevo
- **Valores**:
  - Básico: 1 portafolio
  - Plus: 5 portafolios
  - Premium: 10 portafolios
  - Administrador: 10,000 portafolios

### 4. **plans.roleLimits**
- **Dónde**: (Por implementar) Al agregar activos al watchlist o al dashboard
- **Implementación Sugerida**: Contar activos únicos que el usuario está siguiendo/analizando
- **Valores**:
  - Básico: 5 activos
  - Plus: 25 activos
  - Premium: 50 activos
  - Administrador: 100,000 activos

**Estado**: ⚠️ Parcialmente implementado. Los límites de dashboard están activos, pero falta implementar límites de portafolios y watchlist.

---

## Recomendaciones de Seguridad

### ✅ Implementado Correctamente
1. **Autenticación de Supabase**: Sistema robusto con manejo de sesiones
2. **RLS en todas las tablas sensibles**: Usuarios no pueden acceder a datos ajenos
3. **Logging de eventos críticos**: Sistema de auditoría para rastrear acciones
4. **Validación de permisos en Edge Functions**: Las llamadas a APIs externas están protegidas

### ⚠️ Por Mejorar
1. **Rate Limiting**: Implementar límites de solicitudes por usuario para prevenir abuso
2. **Validación de entrada en formularios**: Agregar sanitización de datos en el backend
3. **Límites de portafolios**: Implementar validación del número máximo de portafolios por plan
4. **Límites de activos en watchlist**: Validar el número de activos que un usuario puede seguir

### 🔒 Mejores Prácticas Aplicadas
- Variables de entorno correctamente configuradas
- Uso de `auth.uid()` en todas las políticas RLS
- Logging de eventos de seguridad (intentos de acceso no autorizado)
- Separación de claves públicas y privadas

---

## Checklist de Seguridad

- [x] Variables de entorno configuradas correctamente
- [x] RLS habilitado en todas las tablas
- [x] Políticas RLS implementadas y probadas
- [x] Sistema de logging funcionando
- [x] Autenticación con Supabase
- [x] Validación de roles y permisos
- [x] Límites de dashboard implementados
- [ ] Límites de portafolios implementados
- [ ] Límites de watchlist implementados
- [ ] Rate limiting configurado
- [ ] Auditoría de seguridad completa

---

**Última actualización**: 2025-10-15  
**Responsable**: Sistema de Desarrollo FinDash
