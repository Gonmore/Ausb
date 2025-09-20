# Corrección: Problema de Login

## 🐛 Problema Identificado
El login estaba fallando porque el backend detectaba las peticiones del frontend como peticiones de navegador y redirigía a una página HTML en lugar de devolver JSON.

## 🔍 Diagnóstico

### Síntomas
- ✅ Registro funcionaba correctamente
- ❌ Login fallaba después del registro
- ❌ Endpoint `/login` devolvía HTML en lugar de JSON

### Causa Raíz
El backend tenía esta lógica en `authController.js`:
```javascript
// ANTES (Problemático)
if (req.headers['user-agent'].includes('Mozilla')) {
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.redirect('/dashboard');
} else {
    res.json({ token, user: ... });
}
```

**Problema**: Todas las peticiones del frontend incluyen 'Mozilla' en el user-agent, causando que siempre se redirija.

## 🔧 Solución Implementada

### 1. Mejora en la Detección de Peticiones API
Modificé `authController.js` para detectar mejor las peticiones API:

```javascript
// DESPUÉS (Correcto)
const isApiRequest = req.headers['content-type']?.includes('application/json') || 
                   req.headers['accept']?.includes('application/json') ||
                   !req.headers['user-agent']?.includes('Mozilla');

if (isApiRequest) {
    res.json({ token, user: ... });
} else {
    res.cookie('jwt', token, { httpOnly: true, secure: true, sameSite: 'strict' });
    res.redirect('/dashboard');
}
```

**Lógica**: 
- Si la petición tiene `Content-Type: application/json` → Devolver JSON
- Si la petición acepta JSON → Devolver JSON  
- Si no tiene user-agent de Mozilla → Devolver JSON
- Solo redirigir para peticiones de formulario HTML

### 2. Configuración del Cliente API
Añadí user-agent personalizado en `api.ts`:
```typescript
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'AusbildungApp/1.0', // Custom user-agent
  },
});
```

### 3. Página de Prueba
Creé `/test-login` para probar el login de forma aislada con logging detallado.

## 🧪 Pruebas Realizadas

### Backend (API directa)
```bash
POST http://localhost:5000/login
Content-Type: application/json
{
  "username": "testuser",
  "password": "123456"
}
```

**Resultado**: ✅ Status 200, JSON con token y datos del usuario

### Frontend
- ✅ Página `/test-login` creada
- ✅ Store de auth configurado correctamente
- ✅ Cliente API configurado
- ✅ Logging añadido para debugging

## 📊 Estructura de Respuesta del Login

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 7,
    "username": "testuser",
    "email": "test@example.com",
    "role": "student",
    "name": "Test User",
    "surname": null,
    "phone": null,
    "active": true
  }
}
```

## 📋 Archivos Modificados

1. **`src/controllers/authController.js`** - Lógica de detección de API mejorada
2. **`src/lib/api.ts`** - User-agent personalizado
3. **`src/app/test-login/page.tsx`** - Página de prueba (nueva)

## ✅ Estado Actual

- **🔐 Login Backend**: ✅ Funciona correctamente
- **📱 Frontend API**: ✅ Configurado correctamente
- **🎯 Detección API**: ✅ Mejorada
- **📊 Respuesta JSON**: ✅ Devuelve datos correctos
- **🧪 Página de Prueba**: ✅ Creada

## 🚀 Próximos Pasos

1. Probar login desde `/test-login`
2. Probar login desde `/login` principal
3. Verificar autenticación persistente
4. Probar diferentes tipos de usuarios
5. Verificar redirección al dashboard

El sistema de login ahora debería funcionar correctamente tanto para peticiones API como para formularios HTML.
