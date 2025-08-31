# 🚀 FPRAX - Migración a CentOS

## 📋 Resumen

Este directorio contiene todos los archivos necesarios para migrar la plataforma FPRAX a un servidor CentOS local. La migración incluye el backend (Node.js/Express) y frontend (Next.js) con todas las funcionalidades y branding corporativo.

## 📁 Archivos de Migración

| Archivo | Descripción |
|---------|-------------|
| `MIGRACION_CENTOS.md` | **📖 Guía completa de migración** - Instrucciones paso a paso |
| `instalar-centos.sh` | **🔧 Script de instalación automatizada** - Instala todas las dependencias |
| `verificar-centos.sh` | **✅ Script de verificación** - Valida la instalación |
| `config-centos.env` | **⚙️ Archivo de configuración** - Variables de entorno |

## 🚀 Inicio Rápido

### 1. Preparación (en tu servidor CentOS)
```bash
# Copiar archivos al servidor
scp -r /ruta/local/FrontGitCop/* usuario@ip_centos:/tmp/fprax-migration/

# Conectar al servidor
ssh usuario@ip_centos

# Navegar a directorio
cd /tmp/fprax-migration
```

### 2. Instalación Automatizada
```bash
# Dar permisos de ejecución
chmod +x instalar-centos.sh

# Ejecutar instalación
./instalar-centos.sh
```

### 3. Configuración de Aplicación
```bash
# Editar configuración
cp config-centos.env /opt/fprax/
nano config-centos.env  # Ajustar valores según tu entorno

# Copiar código de aplicación
cp -r ausback/* /opt/fprax/backend/
cp -r FrontGitCop/* /opt/fprax/frontend/
```

### 4. Verificación
```bash
# Verificar instalación
chmod +x verificar-centos.sh
./verificar-centos.sh

# O usar el comando instalado
fprax-verify
```

## 📋 Checklist de Migración

### ✅ Pre-requisitos
- [ ] Servidor CentOS 7/8/9 disponible
- [ ] Acceso SSH al servidor
- [ ] Usuario con privilegios sudo
- [ ] Mínimo 2GB RAM y 10GB espacio

### ✅ Instalación del Sistema
- [ ] Ejecutar `instalar-centos.sh`
- [ ] Verificar instalación con `verificar-centos.sh`
- [ ] Configurar variables en `config-centos.env`

### ✅ Despliegue de Aplicación
- [ ] Copiar código fuente al servidor
- [ ] Configurar variables de entorno (.env files)
- [ ] Instalar dependencias (pnpm install)
- [ ] Construir frontend (pnpm run build)
- [ ] Configurar PM2 para ambas aplicaciones

### ✅ Configuración de Servicios
- [ ] PostgreSQL funcionando y BD creada
- [ ] Nginx configurado como proxy reverso
- [ ] Firewall configurado (puertos 80, 443, 3000, 5000)
- [ ] PM2 configurado para arranque automático

### ✅ Pruebas Finales
- [ ] Backend responde en puerto 5000
- [ ] Frontend responde en puerto 3000
- [ ] Nginx proxy funciona en puerto 80
- [ ] Login/registro funcionan
- [ ] Dashboard multi-rol funciona
- [ ] Páginas de empresa y centro funcionan

## 🔧 Comandos de Gestión

Después de la instalación, tendrás estos comandos disponibles:

```bash
# Control general de servicios
fprax-control start     # Iniciar todos los servicios
fprax-control stop      # Detener servicios de aplicación
fprax-control restart   # Reiniciar servicios
fprax-control status    # Ver estado de servicios
fprax-control logs      # Ver logs de aplicación
fprax-control backup    # Crear backup de BD

# Verificación del sistema
fprax-verify           # Verificación completa del sistema

# PM2 (gestión de procesos)
pm2 status             # Estado de procesos
pm2 logs               # Logs en tiempo real
pm2 monit              # Monitor de recursos
pm2 restart all        # Reiniciar aplicaciones
```

## 🌐 URLs de Acceso

Después de la migración exitosa:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | `http://tu_ip:3000` | Aplicación principal |
| **Backend** | `http://tu_ip:5000` | API REST |
| **Nginx** | `http://tu_ip:80` | Proxy reverso |
| **Dashboard** | `http://tu_ip/dashboard` | Panel principal |
| **Login** | `http://tu_ip/login` | Página de acceso |

## 🔒 Configuración de Seguridad

### Variables Críticas a Cambiar:
```bash
# En config-centos.env
DB_PASSWORD="TuPasswordSeguro123!"
JWT_SECRET="tu-jwt-secret-de-32-caracteres-minimo"
SESSION_SECRET="tu-session-secret-de-32-caracteres-minimo"
```

### Generar Secrets Seguros:
```bash
# JWT Secret
openssl rand -base64 32

# Session Secret
openssl rand -hex 32

# Database Password
openssl rand -base64 16
```

## 🚨 Solución de Problemas

### Problemas Comunes:

**1. Error de conexión a PostgreSQL:**
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
```

**2. Frontend no construye:**
```bash
cd /opt/fprax/frontend
rm -rf .next node_modules
pnpm install
pnpm run build
```

**3. PM2 no inicia aplicaciones:**
```bash
pm2 kill
pm2 start ecosystem.config.js
```

**4. Error de permisos:**
```bash
sudo chown -R $USER:$USER /opt/fprax
chmod 755 /opt/fprax
```

### Logs Importantes:
```bash
# Logs de aplicación
tail -f /opt/fprax/logs/backend.log
tail -f /opt/fprax/logs/frontend.log

# Logs del sistema
sudo journalctl -u postgresql -f
sudo journalctl -u nginx -f
```

## 📞 Soporte

### Documentación:
- **Guía completa**: `MIGRACION_CENTOS.md`
- **Configuración**: `config-centos.env`
- **Estado del proyecto**: `ESTADO_FINAL_SISTEMA.md`

### Verificación:
- Ejecutar `fprax-verify` para diagnóstico completo
- Revisar logs con `fprax-control logs`
- Verificar estado con `fprax-control status`

## 🎯 Próximos Pasos (Post-Migración)

1. **SSL/HTTPS**: Configurar certificados SSL para producción
2. **Dominio**: Configurar un dominio real
3. **Monitoreo**: Implementar herramientas de monitoreo
4. **Backup**: Configurar backups automáticos
5. **Performance**: Optimizar configuraciones de Nginx
6. **Seguridad**: Implementar medidas adicionales de seguridad

---

¡La plataforma FPRAX estará completamente funcional en CentOS! 🎉

Para cualquier duda, revisar la documentación completa en `MIGRACION_CENTOS.md`.
