# Instrucciones para Ejecutar la Aplicación

## ✅ Configuración Actualizada

### Backend (Puerto 5000)
- **Ubicación**: `c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback\`
- **Puerto**: 5000 (configurado en `.env`)
- **CORS**: Configurado para aceptar requests desde puertos 3000 y 3001

### Frontend (Puerto 3000)
- **Ubicación**: `c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop\`
- **Puerto**: 3000 (puerto por defecto de Next.js)
- **API URL**: `http://localhost:5000` (configurado en `.env.local`)

## 🚀 Cómo Ejecutar

### 1. Iniciar el Backend
```bash
cd "c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback"
npm run dev
```
**Salida esperada**: `Aplicación escuchando en http://localhost:5000`

### 2. Iniciar el Frontend
```bash
cd "c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop"
npm run dev
```
**Salida esperada**: `Ready in X.Xs - Local: http://localhost:3000`

## 🔧 Configuración Aplicada

### Backend (`ausback/app.js`)
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Frontend (`.env.local`)
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📋 Verificación

1. **Backend funcionando**: Visita `http://localhost:5000` - debería mostrar API endpoints
2. **Frontend funcionando**: Visita `http://localhost:3000` - debería mostrar la aplicación
3. **CORS funcionando**: La navegación entre páginas debería funcionar sin errores de CORS

## 🎯 Páginas Disponibles

- **Dashboard**: `http://localhost:3000/dashboard`
- **Ofertas**: `http://localhost:3000/ofertas`
- **Mi CV**: `http://localhost:3000/mi-cv`
- **Aplicaciones**: `http://localhost:3000/aplicaciones`

---

**Nota**: El backend ahora acepta requests desde ambos puertos (3000 y 3001) por compatibilidad, pero el frontend está configurado para usar el puerto 3000 por defecto.
