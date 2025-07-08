# Instrucciones para Probar la Aplicación

## 1. Iniciar el Backend

```bash
cd ausback
npm install
npm start
```

El backend debería iniciarse en http://localhost:5000

## 2. Iniciar el Frontend

```bash
cd FrontGitCop
npm install
npm run dev
```

El frontend debería iniciarse en http://localhost:3001

## 3. Verificar Conectividad

Ve a http://localhost:3001/test para ejecutar los tests de conectividad del backend.

## 4. Probar Funcionalidades

### Registro de Usuario
1. Ve a http://localhost:3001/registro
2. Completa el formulario con:
   - Username: test123
   - Email: test@example.com
   - Password: 123456
   - Confirmar Password: 123456
   - Selecciona un rol (estudiante, empresa, centro, tutor)
   - Completa nombre y otros campos opcionales

### Login
1. Ve a http://localhost:3001/login
2. Usa las credenciales del usuario que registraste
3. O prueba el social login con Google/Facebook

### Navegación
1. Prueba las pestañas: Ofertas, Empresas, Centros
2. Verifica que no haya errores 404
3. Confirma que muestren datos o mensajes apropiados cuando no hay datos

## 5. Social Login

Los botones de Google y Facebook deberían redirigir a:
- http://localhost:5000/auth/google
- http://localhost:5000/auth/facebook

## 6. Errores Comunes

### Backend no inicia
- Verifica que el puerto 5000 esté libre
- Revisa que la base de datos esté configurada correctamente
- Verifica las variables de entorno

### Frontend no conecta al backend
- Confirma que el backend esté corriendo en puerto 5000
- Verifica la configuración de CORS en el backend
- Revisa la consola del navegador para errores de red

### Errores de autenticación
- Verifica que JWT_SECRET esté configurado en el backend
- Confirma que la estructura de la base de datos sea correcta
- Revisa los logs del backend para más detalles

## 7. Debugging

- Logs del backend: Se guardan en `ausback/src/logs/`
- Consola del navegador: F12 → Console
- Network tab: F12 → Network para ver las peticiones HTTP

## 8. Próximos Pasos

Una vez que todo funcione:
1. Agregar datos de prueba (ofertas, empresas, centros)
2. Mejorar la UI/UX
3. Agregar validaciones adicionales
4. Implementar funcionalidades específicas por rol
5. Agregar tests automatizados
