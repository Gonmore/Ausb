# 🔧 TROUBLESHOOTING: Error 500 en Dashboard

## 🎯 Estrategia de Diagnóstico

He implementado una estrategia de diagnóstico por pasos para identificar la causa exacta del error 500 en el dashboard.

## 📋 Pasos de Diagnóstico

### 1. **Dashboard Minimal Activo**
```bash
# Dashboard minimal está ahora activo
node dashboard-manager.js minimal
```

✅ **Status**: Dashboard cambiado a versión minimal ultra-simplificada

### 2. **Páginas de Prueba Disponibles**

| Página | URL | Propósito |
|--------|-----|-----------|
| **Dashboard Minimal** | `/dashboard` | Versión ultra-simplificada sin dependencias complejas |
| **Dashboard Test** | `/dashboard-test` | Diagnóstico completo con logs detallados |
| **Diagnóstico** | `/diagnostico` | Página de diagnóstico del sistema |

### 3. **Cómo Probar**

1. **Accede al Dashboard Minimal**:
   ```
   http://localhost:3001/dashboard
   ```
   - Si carga ✅: El problema está en el dashboard complejo
   - Si da error 500 ❌: El problema es más profundo

2. **Si el Minimal funciona, prueba el Dashboard Test**:
   ```
   http://localhost:3001/dashboard-test
   ```
   - Verá logs detallados del proceso de carga
   - Identificará exactamente dónde falla

## 🔍 Versiones del Dashboard

```bash
# Listar todas las versiones disponibles
node dashboard-manager.js list

# Cambiar a versión específica
node dashboard-manager.js switch <version>

# Probar todas las versiones
node dashboard-manager.js test
```

### Versiones Disponibles:
- **minimal**: Ultra-simplificada, sin dependencias complejas
- **debug**: Con logs detallados y manejo de errores
- **clean**: Versión completa pero limpia
- **current**: Versión actual (respaldo)

## 🚨 Diagnóstico por Síntomas

### **Síntoma 1: Error 500 en Dashboard Minimal**
```
Causa probable: Problema en el servidor Next.js o configuración
```

**Soluciones**:
1. Reiniciar servidor de desarrollo
2. Limpiar caché de Next.js
3. Verificar configuración de puerto
4. Verificar logs del servidor

### **Síntoma 2: Dashboard Minimal funciona, pero complejo falla**
```
Causa probable: Problema con dependencias o componentes complejos
```

**Soluciones**:
1. Verificar importaciones de Lucide React
2. Verificar tipos TypeScript
3. Verificar manejo de estados
4. Usar dashboard debug para identificar el componente problemático

### **Síntoma 3: Dashboard Test muestra errores específicos**
```
Causa probable: Problema con localStorage o estructura de datos
```

**Soluciones**:
1. Limpiar localStorage
2. Verificar estructura de auth-storage
3. Verificar token de autenticación
4. Re-hacer login

## 🔧 Comandos de Resolución

### **Reiniciar y Limpiar**
```bash
# Limpiar caché de Next.js
rm -rf .next
npm run dev

# O en PowerShell
Remove-Item -Recurse -Force .next
npm run dev
```

### **Cambiar Versión del Dashboard**
```bash
# Dashboard ultra-simple
node dashboard-manager.js minimal

# Dashboard con debug
node dashboard-manager.js switch debug

# Dashboard completo
node dashboard-manager.js restore
```

### **Verificar Estado**
```bash
# Verificar versiones disponibles
node dashboard-manager.js list

# Probar todas las versiones
node dashboard-manager.js test
```

## 📊 Matriz de Diagnóstico

| Test | Resultado | Siguiente Paso |
|------|-----------|----------------|
| Dashboard Minimal carga | ✅ | Probar Dashboard Test |
| Dashboard Minimal error 500 | ❌ | Reiniciar servidor, limpiar caché |
| Dashboard Test pasa todos los tests | ✅ | Problema con dashboard complejo |
| Dashboard Test falla en localStorage | ❌ | Limpiar localStorage, re-login |
| Dashboard Test falla en componentes | ❌ | Verificar dependencias |

## 🎯 Plan de Acción

### **Fase 1: Verificación Básica**
1. Acceder a `http://localhost:3001/dashboard`
2. Verificar si el dashboard minimal carga
3. Revisar consola del navegador para errores

### **Fase 2: Diagnóstico Detallado**
1. Si minimal funciona, ir a `/dashboard-test`
2. Revisar logs detallados
3. Identificar punto exacto de fallo

### **Fase 3: Resolución**
1. Basado en diagnóstico, aplicar solución específica
2. Cambiar a versión apropiada del dashboard
3. Verificar funcionamiento

## 🔄 Rollback Plan

Si algo sale mal:
```bash
# Restaurar versión original
node dashboard-manager.js restore

# O cambiar a versión específica
node dashboard-manager.js switch clean
```

## 📝 Próximos Pasos

1. **Probar Dashboard Minimal**: Verificar si carga sin error 500
2. **Revisar Logs**: Usar dashboard-test para diagnóstico detallado
3. **Identificar Causa**: Basado en resultado de pruebas
4. **Aplicar Solución**: Usar versión apropiada del dashboard
5. **Verificar Funcionamiento**: Confirmar que todo funciona correctamente

---

**Status Actual**: Dashboard minimal activo, listo para pruebas de diagnóstico.
