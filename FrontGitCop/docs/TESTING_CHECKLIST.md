# 🧪 Checklist de Pruebas - Ausbildung Frontend-Backend

## 📋 **Antes de Empezar**

### ✅ **Prerequisitos**
- [ ] PostgreSQL ejecutándose
- [ ] Variables de entorno configuradas en backend (.env)
- [ ] Puerto 3000 disponible (backend)
- [ ] Puerto 3001 disponible (frontend)

### 🚀 **Iniciar Servidores**

1. **Ejecutar el archivo batch:**
   ```
   Hacer doble clic en: start-servers.bat
   ```

2. **O manualmente:**
   ```bash
   # Terminal 1 - Backend
   cd c:\Users\arman\OneDrive\Desarrollo\Ausb\ausback
   npm run dev
   
   # Terminal 2 - Frontend  
   cd c:\Users\arman\OneDrive\Desarrollo\Ausb\FrontGitCop
   npm run dev
   ```

## 🔍 **Pruebas de Conexión**

### 1. **Verificar que los servidores están corriendo**
- [ ] Backend: `http://localhost:3000` muestra "¡Hola, Mundo!"
- [ ] Frontend: `http://localhost:3001` muestra landing page

### 2. **Pruebas de Autenticación**

#### **A. Registro de Usuario**
- [ ] Ir a `http://localhost:3001/registro`
- [ ] Completar formulario con:
  - Tipo: Estudiante
  - Usuario: `test123`
  - Email: `test@test.com`
  - Contraseña: `123456`
  - Nombre: `Usuario Test`
- [ ] Hacer clic en "Crear cuenta"
- [ ] **Resultado esperado**: Redirección a login con mensaje de éxito

#### **B. Inicio de Sesión**
- [ ] Ir a `http://localhost:3001/login`
- [ ] Usar credenciales:
  - Email: `test@test.com`
  - Contraseña: `123456`
- [ ] Hacer clic en "Iniciar Sesión"
- [ ] **Resultado esperado**: Redirección a dashboard

### 3. **Pruebas de Navegación**

#### **A. Dashboard**
- [ ] Verificar que aparece "Bienvenido, Usuario Test"
- [ ] Verificar que muestra "Estudiante" como rol
- [ ] Verificar que aparecen las tarjetas de estadísticas
- [ ] Verificar que aparecen las acciones rápidas

#### **B. Navegación Principal**
- [ ] Hacer clic en "Ofertas"
- [ ] **Resultado esperado**: Página de ofertas (aunque esté vacía)
- [ ] Verificar que aparece el mensaje "No se encontraron ofertas"

#### **C. Navegación Móvil**
- [ ] Reducir tamaño de ventana
- [ ] Verificar que aparece el menú hamburguesa
- [ ] Hacer clic en el menú
- [ ] **Resultado esperado**: Menú lateral funcional

### 4. **Pruebas de Funcionalidades**

#### **A. Cerrar Sesión**
- [ ] Hacer clic en botón "Cerrar sesión"
- [ ] **Resultado esperado**: Redirección a login

#### **B. Acceso Protegido**
- [ ] Intentar acceder a `http://localhost:3001/dashboard` sin login
- [ ] **Resultado esperado**: Redirección a login

## 🐛 **Troubleshooting**

### **Si el backend no inicia:**
1. Verificar PostgreSQL
2. Verificar variables .env
3. Verificar puerto 3000 libre
4. Revisar logs en terminal

### **Si el frontend no inicia:**
1. Verificar puerto 3001 libre
2. Ejecutar `npm install` si hay problemas
3. Verificar que Next.js 15 esté instalado

### **Si hay errores de CORS:**
1. Verificar que backend tiene CORS configurado
2. Verificar que frontend usa puerto 3001
3. Revisar Network tab en navegador (F12)

### **Si login no funciona:**
1. Verificar que backend recibe las peticiones
2. Verificar estructura de base de datos
3. Verificar que usuario se crea en BD

## 📊 **Resultados Esperados**

### **Consola Backend:**
```
Aplicación escuchando en http://localhost:3000
Base de datos sincronizada
Server started on port: 3000
```

### **Consola Frontend:**
```
Ready - started server on 0.0.0.0:3001
```

### **Navegador:**
- Landing page funcional
- Registro exitoso
- Login exitoso
- Dashboard personalizado
- Navegación fluida

## ✅ **Pruebas Completadas**

- [ ] Servidores iniciados correctamente
- [ ] Registro de usuario funcional
- [ ] Login funcional
- [ ] Dashboard carga correctamente
- [ ] Navegación funciona
- [ ] Cerrar sesión funciona
- [ ] Rutas protegidas funcionan

## 🎯 **Próximos Pasos**

Una vez completadas todas las pruebas:
1. Crear ofertas de prueba
2. Implementar más funcionalidades
3. Mejorar UX/UI
4. Agregar validaciones adicionales
