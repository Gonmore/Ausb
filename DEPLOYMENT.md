# 🚀 GUÍA DE DEPLOYMENT PARA PRODUCCIÓN

## 📋 Tabla de Contenidos
- [Prerrequisitos](#prerrequisitos)
- [Configuración](#configuración)
- [Deployment](#deployment)
- [Monitoreo](#monitoreo)
- [Mantenimiento](#mantenimiento)
- [Solución de Problemas](#solución-de-problemas)

## 🔧 Prerrequisitos

### Software Requerido
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git** >= 2.30
- **Make** (opcional, para comandos simplificados)

### Recursos del Servidor
- **CPU**: 4+ cores recomendados
- **RAM**: 8GB mínimo, 16GB recomendado
- **Almacenamiento**: 50GB+ SSD
- **Red**: Banda ancha estable

### Puertos Requeridos
- `80` - HTTP (redirección a HTTPS)
- `443` - HTTPS
- `3306` - MySQL (interno)
- `6379` - Redis (interno)

## ⚙️ Configuración

### 1. Variables de Entorno

Copia y configura los archivos de entorno:

```bash
# Backend
cp ausback/.env.production.example ausback/.env.production
# Editar ausback/.env.production

# Frontend  
cp FrontGitCop/.env.production.example FrontGitCop/.env.production
# Editar FrontGitCop/.env.production
```

### 2. Certificados SSL

Coloca tus certificados SSL en:
```
nginx/ssl/
├── cert.pem
└── key.pem
```

### 3. Configuración de Base de Datos

Crea el archivo `.env` con las credenciales de BD:
```bash
DB_ROOT_PASSWORD=your_root_password
DB_NAME=ausbildung_prod
DB_USER=ausb_user
DB_PASSWORD=your_secure_password
```

## 🚀 Deployment

### Deployment Automático

```bash
# Ejecutar script de deployment
chmod +x deploy.sh
./deploy.sh
```

### Deployment Manual

```bash
# 1. Construir imágenes
docker-compose -f docker-compose.prod.yml build

# 2. Parar servicios existentes
docker-compose -f docker-compose.prod.yml down

# 3. Iniciar servicios
docker-compose -f docker-compose.prod.yml up -d

# 4. Verificar salud
curl http://localhost/health
```

### Comandos Útiles

```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver estado de servicios
docker-compose -f docker-compose.prod.yml ps

# Reiniciar servicio específico
docker-compose -f docker-compose.prod.yml restart backend

# Ejecutar comando en contenedor
docker-compose -f docker-compose.prod.yml exec backend bash
```

## 📊 Monitoreo

### Script de Monitoreo Automático

```bash
# Ejecutar verificación de salud
chmod +x monitor.sh
./monitor.sh

# Configurar cron para monitoreo cada 5 minutos
echo "*/5 * * * * /path/to/project/monitor.sh" | crontab -
```

### Métricas Importantes

- **Uptime** de servicios
- **Tiempo de respuesta** de APIs
- **Uso de CPU y memoria**
- **Espacio en disco**
- **Conexiones de base de datos**
- **Errores en logs**

### Logs de Sistema

```bash
# Logs de aplicación
tail -f logs/monitoring.log

# Logs de Docker
docker-compose -f docker-compose.prod.yml logs --tail=100

# Logs de NGINX
docker-compose -f docker-compose.prod.yml logs nginx
```

## 🔧 Mantenimiento

### Backup Regular

```bash
# Backup manual de base de datos
docker-compose -f docker-compose.prod.yml exec database mysqldump \
  -u$DB_USER -p$DB_PASSWORD $DB_NAME > backup_$(date +%Y%m%d).sql

# Configurar backup automático diario
echo "0 2 * * * /path/to/project/backup.sh" | crontab -
```

### Actualización de Código

```bash
# 1. Hacer backup
./backup.sh

# 2. Obtener último código
git pull origin main

# 3. Redesplegar
./deploy.sh
```

### Limpieza de Sistema

```bash
# Limpiar logs antiguos
./monitor.sh cleanup

# Limpiar imágenes Docker no utilizadas
docker system prune -f

# Limpiar volúmenes huérfanos
docker volume prune -f
```

## 🚨 Solución de Problemas

### Servicios No Inician

```bash
# Verificar logs de error
docker-compose -f docker-compose.prod.yml logs

# Verificar configuración
docker-compose -f docker-compose.prod.yml config

# Reiniciar servicios
docker-compose -f docker-compose.prod.yml restart
```

### Base de Datos No Responde

```bash
# Verificar estado de MySQL
docker-compose -f docker-compose.prod.yml exec database mysql -u$DB_USER -p$DB_PASSWORD -e "SELECT 1"

# Verificar logs de BD
docker-compose -f docker-compose.prod.yml logs database

# Restaurar desde backup
docker-compose -f docker-compose.prod.yml exec -T database mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < backup.sql
```

### Alto Uso de Memoria

```bash
# Verificar uso por contenedor
docker stats

# Reiniciar contenedores problemáticos
docker-compose -f docker-compose.prod.yml restart backend

# Verificar logs de memoria
dmesg | grep -i memory
```

### Problemas de SSL

```bash
# Verificar certificados
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Probar conexión SSL
openssl s_client -connect your-domain.com:443

# Renovar certificados Let's Encrypt
certbot renew --nginx
```

## 📱 Contacto y Soporte

- **Email**: soporte@fprax.com
- **Documentación**: [Enlace a documentación técnica]
- **Issues**: [Enlace a sistema de tickets]

## 📄 Licencia

Este proyecto está bajo la licencia [ESPECIFICAR LICENCIA].

---

**⚠️ Importante**: Asegúrate de cambiar todas las contraseñas por defecto y configurar correctamente las variables de entorno antes del deployment en producción.