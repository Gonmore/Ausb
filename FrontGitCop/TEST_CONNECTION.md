# Test de Conexión Frontend-Backend

## 🔧 Configuración Actual

### Backend
- **Puerto**: 3000
- **URL**: http://localhost:3000
- **Rutas**:
  - `POST /login` - Autenticación
  - `POST /register` - Registro
  - `GET /api/offers` - Ofertas
  - `GET /api/company` - Empresas
  - `GET /api/scenter` - Centros

### Frontend
- **Puerto**: 3001
- **URL**: http://localhost:3001
- **API Client**: Configurado para `http://localhost:3000`

## 🚀 Pasos para Probar la Conexión

### 1. Iniciar el Backend
```bash
cd c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback
npm install cors  # Si no se instaló correctamente
npm run dev
```

### 2. Iniciar el Frontend
```bash
cd c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop
npm run dev
```

### 3. Probar la Conexión
1. Ir a `http://localhost:3001`
2. Hacer clic en "Iniciar Sesión"
3. Intentar crear una cuenta nueva
4. Verificar que las peticiones lleguen al backend

## 🔍 Verificaciones

### Backend Ready ✅
- ✅ CORS configurado para frontend
- ✅ Rutas de autenticación creadas
- ✅ Modelo User actualizado con campos necesarios
- ✅ Controladores de login y registro

### Frontend Ready ✅
- ✅ Servicios configurados para endpoints correctos
- ✅ Store de autenticación configurado
- ✅ Páginas de login y registro creadas
- ✅ Variables de entorno configuradas

## 🐛 Troubleshooting

### Si el backend no inicia:
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar variables de entorno (.env)
3. Verificar que el puerto 3000 esté disponible

### Si el frontend no conecta:
1. Verificar que el backend esté ejecutándose
2. Verificar CORS en el navegador (F12 → Network)
3. Verificar que las rutas sean correctas

## 📝 Próximos Pasos

Una vez que la conexión funcione:
1. ✅ Probar login/registro
2. ✅ Probar listado de ofertas
3. ✅ Implementar funcionalidades adicionales
4. ✅ Agregar validaciones de errores
5. ✅ Mejorar UX/UI

## 🎯 Estado Esperado

**Backend logs:**
```
Aplicación escuchando en http://localhost:3000
Base de datos sincronizada
```

**Frontend:**
```
Ready - started server on 0.0.0.0:3001
```

**Conexión exitosa:**
- Login funcional
- Registro funcional
- Navegación por roles
- Listado de ofertas (aunque esté vacío)
