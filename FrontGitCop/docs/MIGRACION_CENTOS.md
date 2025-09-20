# Guía de Migración a CentOS - Plataforma FPRAX

## 🎯 Objetivo
Migrar y desplegar la plataforma FPRAX (backend Node.js + frontend Next.js) en un servidor CentOS local, manteniendo la funcionalidad completa y el branding corporativo.

## 📋 Prerrequisitos del Sistema

### Sistema Base
- **CentOS 7/8/9** (versión recomendada: CentOS 9 Stream)
- **RAM**: Mínimo 2GB, recomendado 4GB+
- **Espacio**: Mínimo 10GB disponibles
- **Acceso**: Usuario con privilegios sudo

## 🔧 Instalación de Dependencias

### 1. Actualizar el Sistema
```bash
# Actualizar repositorios y paquetes
sudo dnf update -y

# Instalar herramientas básicas
sudo dnf groupinstall "Development Tools" -y
sudo dnf install git curl wget vim -y
```

### 2. Instalar Node.js y pnpm
```bash
# Instalar Node.js 18+ (versión recomendada)
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs -y

# Verificar instalación
node --version  # Debe mostrar v18.x.x o superior
npm --version   # Debe mostrar npm version

# Instalar pnpm globalmente
sudo npm install -g pnpm

# Verificar pnpm
pnpm --version
```

### 3. Instalar PostgreSQL
```bash
# Instalar PostgreSQL 14+
sudo dnf install postgresql postgresql-server postgresql-contrib -y

# Inicializar la base de datos
sudo postgresql-setup --initdb

# Habilitar y arrancar PostgreSQL
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Verificar estado
sudo systemctl status postgresql
```

### 4. Configurar PostgreSQL
```bash
# Cambiar a usuario postgres
sudo -u postgres psql

-- Dentro de PostgreSQL:
-- Crear base de datos
CREATE DATABASE fprax_db;

-- Crear usuario con privilegios
CREATE USER fprax_user WITH ENCRYPTED PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE fprax_db TO fprax_user;

-- Salir
\q
```

### 5. Instalar PM2 (Gestor de Procesos)
```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Configurar PM2 para arranque automático
pm2 startup
# Ejecutar el comando que PM2 te indique (normalmente con sudo)
```

### 6. Instalar y Configurar Nginx (Opcional)
```bash
# Instalar Nginx
sudo dnf install nginx -y

# Habilitar y arrancar
sudo systemctl enable nginx
sudo systemctl start nginx

# Verificar
sudo systemctl status nginx
```

## 📁 Preparación de Directorios

### Crear Estructura de Proyecto
```bash
# Crear directorio principal
sudo mkdir -p /opt/fprax
sudo chown $USER:$USER /opt/fprax

# Navegar al directorio
cd /opt/fprax

# Crear subdirectorios
mkdir -p backend frontend logs backups
```

## 📦 Despliegue del Backend

### 1. Copiar Archivos del Backend
```bash
# Desde tu máquina local, copiar usando SCP o rsync
# Ejemplo con SCP:
scp -r /ruta/local/ausback/* usuario@ip_centos:/opt/fprax/backend/

# O clonar desde repositorio Git (recomendado):
cd /opt/fprax/backend
git clone <tu-repositorio-backend> .
```

### 2. Configurar Variables de Entorno
```bash
cd /opt/fprax/backend

# Crear archivo .env
cat > .env << EOF
# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fprax_db
DB_USER=fprax_user
DB_PASSWORD=tu_password_seguro

# Servidor
PORT=5000
NODE_ENV=production

# JWT y Sesiones
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui
SESSION_SECRET=tu_session_secret_muy_seguro_aqui

# URLs
FRONTEND_URL=http://tu_ip_centos:3000
BACKEND_URL=http://tu_ip_centos:5000

# Social Login (si aplica)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_CLIENT_ID=tu_facebook_client_id
FACEBOOK_CLIENT_SECRET=tu_facebook_client_secret
EOF
```

### 3. Instalar Dependencias y Configurar
```bash
# Instalar dependencias
pnpm install

# Ejecutar migraciones de BD (si las tienes)
# npm run migrate

# Probar funcionamiento
npm run start
```

### 4. Configurar PM2 para Backend
```bash
# Crear archivo de configuración PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'fprax-backend',
    script: 'app.js',
    cwd: '/opt/fprax/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    log_file: '/opt/fprax/logs/backend.log',
    error_file: '/opt/fprax/logs/backend-error.log',
    out_file: '/opt/fprax/logs/backend-out.log',
    max_memory_restart: '1G',
    restart_delay: 4000
  }]
};
EOF

# Iniciar con PM2
pm2 start ecosystem.config.js

# Guardar configuración PM2
pm2 save
```

## 🎨 Despliegue del Frontend

### 1. Copiar Archivos del Frontend
```bash
# Copiar archivos (similar al backend)
cd /opt/fprax/frontend

# Con SCP:
scp -r /ruta/local/FrontGitCop/* usuario@ip_centos:/opt/fprax/frontend/

# O con Git:
git clone <tu-repositorio-frontend> .
```

### 2. Configurar Variables de Entorno
```bash
cd /opt/fprax/frontend

# Crear .env.local
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://tu_ip_centos:5000
NEXTAUTH_URL=http://tu_ip_centos:3000
NEXTAUTH_SECRET=tu_nextauth_secret_muy_seguro

# Social Login (si aplica)
GOOGLE_CLIENT_ID=tu_google_client_id
GOOGLE_CLIENT_SECRET=tu_google_client_secret
FACEBOOK_CLIENT_ID=tu_facebook_client_id
FACEBOOK_CLIENT_SECRET=tu_facebook_client_secret
EOF
```

### 3. Instalar y Construir
```bash
# Instalar dependencias
pnpm install

# Construir para producción
pnpm run build

# Probar funcionamiento
pnpm run start
```

### 4. Configurar PM2 para Frontend
```bash
# Agregar frontend a PM2
cat > frontend-ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'fprax-frontend',
    script: 'node_modules/.bin/next',
    args: 'start -p 3000',
    cwd: '/opt/fprax/frontend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: '/opt/fprax/logs/frontend.log',
    error_file: '/opt/fprax/logs/frontend-error.log',
    out_file: '/opt/fprax/logs/frontend-out.log',
    max_memory_restart: '1G'
  }]
};
EOF

# Iniciar frontend
pm2 start frontend-ecosystem.config.js

# Guardar configuración actualizada
pm2 save
```

## 🔧 Configuración de Nginx (Proxy Reverso)

### Configurar Sitio FPRAX
```bash
# Crear configuración del sitio
sudo tee /etc/nginx/conf.d/fprax.conf << EOF
server {
    listen 80;
    server_name tu_ip_centos;  # Cambia por tu IP o dominio

    # Frontend (Next.js)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Logs
    access_log /var/log/nginx/fprax_access.log;
    error_log /var/log/nginx/fprax_error.log;
}
EOF

# Probar configuración
sudo nginx -t

# Recargar nginx
sudo systemctl reload nginx
```

## 🔒 Configuración del Firewall

### Configurar firewalld (CentOS)
```bash
# Verificar estado del firewall
sudo systemctl status firewalld

# Abrir puertos necesarios
sudo firewall-cmd --permanent --add-port=80/tcp     # Nginx
sudo firewall-cmd --permanent --add-port=443/tcp    # HTTPS (futuro)
sudo firewall-cmd --permanent --add-port=3000/tcp   # Frontend (desarrollo)
sudo firewall-cmd --permanent --add-port=5000/tcp   # Backend (desarrollo)

# Recargar firewall
sudo firewall-cmd --reload

# Verificar puertos abiertos
sudo firewall-cmd --list-ports
```

## 📊 Scripts de Gestión

### Script de Inicio/Parada
```bash
# Crear script de gestión
sudo tee /usr/local/bin/fprax-control << 'EOF'
#!/bin/bash

case "$1" in
    start)
        echo "🚀 Iniciando servicios FPRAX..."
        sudo systemctl start postgresql
        sudo systemctl start nginx
        pm2 start /opt/fprax/backend/ecosystem.config.js
        pm2 start /opt/fprax/frontend/frontend-ecosystem.config.js
        echo "✅ Servicios iniciados"
        ;;
    stop)
        echo "🛑 Deteniendo servicios FPRAX..."
        pm2 stop all
        sudo systemctl stop nginx
        echo "✅ Servicios detenidos"
        ;;
    restart)
        echo "🔄 Reiniciando servicios FPRAX..."
        $0 stop
        sleep 5
        $0 start
        ;;
    status)
        echo "📊 Estado de servicios FPRAX:"
        echo "--- PostgreSQL ---"
        sudo systemctl status postgresql --no-pager -l
        echo "--- Nginx ---"
        sudo systemctl status nginx --no-pager -l
        echo "--- PM2 ---"
        pm2 status
        ;;
    logs)
        echo "📄 Logs del sistema:"
        echo "--- Backend ---"
        tail -50 /opt/fprax/logs/backend.log
        echo "--- Frontend ---"
        tail -50 /opt/fprax/logs/frontend.log
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
EOF

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/fprax-control
```

## ✅ Checklist de Verificación

### Después de la Instalación
```bash
# 1. Verificar servicios base
sudo systemctl status postgresql
sudo systemctl status nginx

# 2. Verificar PM2
pm2 status

# 3. Verificar conectividad de BD
psql -h localhost -U fprax_user -d fprax_db -c "SELECT version();"

# 4. Probar backend
curl -I http://localhost:5000

# 5. Probar frontend
curl -I http://localhost:3000

# 6. Verificar logs
tail -f /opt/fprax/logs/backend.log
tail -f /opt/fprax/logs/frontend.log

# 7. Probar desde navegador
# http://tu_ip_centos (con Nginx)
# http://tu_ip_centos:3000 (directo)
```

### URLs de Prueba
- **Homepage**: `http://tu_ip_centos/`
- **Login**: `http://tu_ip_centos/login`
- **Dashboard**: `http://tu_ip_centos/dashboard`
- **API Health**: `http://tu_ip_centos/api/health`

## 🔧 Comandos Útiles de Gestión

### Gestión Diaria
```bash
# Ver estado general
fprax-control status

# Reiniciar servicios
fprax-control restart

# Ver logs en tiempo real
pm2 logs

# Monitorear recursos
pm2 monit

# Actualizar aplicación (después de cambios)
cd /opt/fprax/frontend
git pull
pnpm run build
pm2 restart fprax-frontend

cd /opt/fprax/backend
git pull
pnpm install
pm2 restart fprax-backend
```

### Backup de Base de Datos
```bash
# Crear backup
sudo -u postgres pg_dump fprax_db > /opt/fprax/backups/fprax_backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
sudo -u postgres psql fprax_db < /opt/fprax/backups/fprax_backup_YYYYMMDD_HHMMSS.sql
```

## 🚨 Solución de Problemas Comunes

### Error de Conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar conexión
sudo -u postgres psql -c "SELECT version();"

# Verificar configuración en pg_hba.conf
sudo vi /var/lib/pgsql/data/pg_hba.conf
```

### Error de Permisos de Archivos
```bash
# Corregir propietario de archivos
sudo chown -R $USER:$USER /opt/fprax

# Corregir permisos de logs
sudo mkdir -p /opt/fprax/logs
sudo chown -R $USER:$USER /opt/fprax/logs
```

### Frontend no se construye
```bash
# Limpiar cache de Node
cd /opt/fprax/frontend
rm -rf .next node_modules
pnpm install
pnpm run build
```

### Error de CORS
```bash
# Verificar variables de entorno
cat /opt/fprax/backend/.env | grep URL
cat /opt/fprax/frontend/.env.local | grep API_URL

# Ajustar URLs según tu configuración de red
```

## 🎯 Optimizaciones para Producción

### Performance
```bash
# Configurar límites de sistema
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Optimizar Nginx
sudo vi /etc/nginx/nginx.conf
# Ajustar worker_processes, worker_connections
```

### Monitoreo
```bash
# Instalar htop para monitoreo
sudo dnf install htop -y

# Configurar logrotate para logs de aplicación
sudo tee /etc/logrotate.d/fprax << EOF
/opt/fprax/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reload all
    endscript
}
EOF
```

---

## 📝 Notas Finales

1. **Seguridad**: Cambiar todas las contraseñas por defecto
2. **Backup**: Configurar backups automáticos de la BD
3. **SSL**: Configurar certificados SSL para producción
4. **Dominio**: Configurar un dominio real en lugar de IP
5. **Monitoreo**: Implementar herramientas de monitoreo adicionales

¡La plataforma FPRAX estará lista para uso en producción en CentOS! 🎉
