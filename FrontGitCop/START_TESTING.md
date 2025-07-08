# 🚀 INICIAR PRUEBAS - AUSBILDUNG

## 📋 **Pasos Rápidos**

### 1. **Verificar Setup**
```
Doble clic en: check-setup.bat
```

### 2. **Iniciar Servidores**
```
Doble clic en: start-servers.bat
```

### 3. **Probar la Aplicación**
- Se abrirá automáticamente: `http://localhost:3001`
- Seguir la guía: `TESTING_CHECKLIST.md`

## 🎯 **Pruebas Principales**

### ✅ **Registro**
1. Ir a "Registro" 
2. Crear cuenta como "Estudiante"
3. Usar email: `test@test.com`
4. Contraseña: `123456`

### ✅ **Login**
1. Iniciar sesión con credenciales
2. Verificar redirección a dashboard

### ✅ **Navegación**
1. Explorar dashboard
2. Ir a "Ofertas"
3. Probar navegación móvil

## 🐛 **Si algo falla**

### **Backend no inicia:**
- Verificar PostgreSQL
- Verificar puerto 3000 libre

### **Frontend no inicia:**
- Verificar puerto 3001 libre
- Ejecutar: `npm install`

### **No conecta:**
- Verificar que ambos servidores están corriendo
- Revisar consola del navegador (F12)

## 📞 **Contacto**
Si encuentras problemas, revisa:
- `TESTING_CHECKLIST.md` - Guía completa
- `CONFIGURATION_SUMMARY.md` - Resumen técnico
- Consolas de ambos servidores para errores

---

**¡Listo para probar! 🎉**
