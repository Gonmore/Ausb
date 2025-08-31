#!/bin/bash

# =================================================================
# Script de Instalación Automatizada - FPRAX en CentOS
# =================================================================

set -e  # Salir si hay errores

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables de configuración
FPRAX_USER=${FPRAX_USER:-$USER}
FPRAX_DIR="/opt/fprax"
DB_NAME="fprax_db"
DB_USER="fprax_user"
DB_PASSWORD=${FPRAX_DB_PASSWORD:-$(openssl rand -base64 12)}
JWT_SECRET=${FPRAX_JWT_SECRET:-$(openssl rand -base64 32)}
SESSION_SECRET=${FPRAX_SESSION_SECRET:-$(openssl rand -base64 32)}

# Función para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

# Función para verificar si es root
check_root() {
    if [ "$EUID" -eq 0 ]; then
        error "No ejecutar este script como root. Usa un usuario con privilegios sudo."
    fi
}

# Función para verificar SO
check_os() {
    if [ ! -f /etc/os-release ]; then
        error "No se puede determinar el sistema operativo"
    fi
    
    . /etc/os-release
    if [[ "$ID" != "centos" && "$ID" != "rhel" && "$ID" != "rocky" && "$ID" != "almalinux" ]]; then
        error "Este script está diseñado para CentOS/RHEL/Rocky/AlmaLinux"
    fi
    
    log "Detectado: $PRETTY_NAME"
}

# Función principal
main() {
    echo "🚀 INSTALACIÓN AUTOMATIZADA DE FPRAX EN CENTOS"
    echo "==============================================="
    echo
    
    check_root
    check_os
    
    info "Usuario: $FPRAX_USER"
    info "Directorio de instalación: $FPRAX_DIR"
    info "Base de datos: $DB_NAME"
    echo
    
    read -p "¿Continuar con la instalación? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Instalación cancelada"
    fi
    
    # Pasos de instalación
    update_system
    install_nodejs
    install_postgresql
    install_nginx
    install_pm2
    create_directories
    configure_postgresql
    configure_firewall
    create_management_scripts
    
    log "✅ INSTALACIÓN COMPLETADA EXITOSAMENTE"
    echo
    echo "📋 INFORMACIÓN IMPORTANTE:"
    echo "=========================="
    echo "Base de datos: $DB_NAME"
    echo "Usuario DB: $DB_USER"
    echo "Password DB: $DB_PASSWORD"
    echo "JWT Secret: $JWT_SECRET"
    echo "Session Secret: $SESSION_SECRET"
    echo
    echo "🔐 GUARDA ESTA INFORMACIÓN DE FORMA SEGURA!"
    echo
    echo "📁 Directorio de trabajo: $FPRAX_DIR"
    echo "🎯 Próximos pasos:"
    echo "1. Copiar los archivos de tu aplicación"
    echo "2. Configurar variables de entorno"
    echo "3. Instalar dependencias y ejecutar"
    echo
    echo "📖 Ver documentación completa en: MIGRACION_CENTOS.md"
}

# Actualizar sistema
update_system() {
    log "Actualizando sistema..."
    sudo dnf update -y
    sudo dnf groupinstall "Development Tools" -y
    sudo dnf install git curl wget vim jq htop -y
}

# Instalar Node.js
install_nodejs() {
    log "Instalando Node.js..."
    
    if command -v node &> /dev/null; then
        warning "Node.js ya está instalado: $(node --version)"
        return
    fi
    
    # Instalar Node.js 18 LTS
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo dnf install nodejs -y
    
    # Verificar instalación
    node --version || error "Error instalando Node.js"
    npm --version || error "Error instalando NPM"
    
    log "Node.js instalado: $(node --version)"
}

# Instalar pnpm
install_pnpm() {
    log "Instalando pnpm..."
    
    if command -v pnpm &> /dev/null; then
        warning "pnpm ya está instalado: $(pnpm --version)"
        return
    fi
    
    sudo npm install -g pnpm
    pnpm --version || error "Error instalando pnpm"
    
    log "pnpm instalado: $(pnpm --version)"
}

# Instalar PostgreSQL
install_postgresql() {
    log "Instalando PostgreSQL..."
    
    if command -v psql &> /dev/null; then
        warning "PostgreSQL ya está instalado"
        return
    fi
    
    sudo dnf install postgresql postgresql-server postgresql-contrib -y
    
    # Inicializar BD
    sudo postgresql-setup --initdb
    
    # Configurar para arranque automático
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
    
    # Verificar instalación
    sudo systemctl status postgresql --no-pager || error "Error iniciando PostgreSQL"
    
    log "PostgreSQL instalado y configurado"
}

# Configurar PostgreSQL
configure_postgresql() {
    log "Configurando base de datos..."
    
    # Crear base de datos y usuario
    sudo -u postgres psql << EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH ENCRYPTED PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF
    
    # Verificar conexión
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT version();" || error "Error configurando base de datos"
    
    log "Base de datos configurada: $DB_NAME"
}

# Instalar Nginx
install_nginx() {
    log "Instalando Nginx..."
    
    if command -v nginx &> /dev/null; then
        warning "Nginx ya está instalado"
        return
    fi
    
    sudo dnf install nginx -y
    sudo systemctl enable nginx
    sudo systemctl start nginx
    
    # Verificar instalación
    sudo systemctl status nginx --no-pager || error "Error iniciando Nginx"
    
    log "Nginx instalado y configurado"
}

# Instalar PM2
install_pm2() {
    log "Instalando PM2..."
    
    if command -v pm2 &> /dev/null; then
        warning "PM2 ya está instalado: $(pm2 --version)"
        return
    fi
    
    sudo npm install -g pm2
    
    # Configurar para arranque automático
    pm2 startup
    
    log "PM2 instalado. Configura el arranque automático manualmente."
}

# Crear directorios
create_directories() {
    log "Creando estructura de directorios..."
    
    sudo mkdir -p $FPRAX_DIR/{backend,frontend,logs,backups}
    sudo chown -R $FPRAX_USER:$FPRAX_USER $FPRAX_DIR
    
    # Crear directorio para logs de nginx
    sudo mkdir -p /var/log/nginx
    
    log "Directorios creados en $FPRAX_DIR"
}

# Configurar firewall
configure_firewall() {
    log "Configurando firewall..."
    
    if ! systemctl is-active --quiet firewalld; then
        sudo systemctl start firewalld
        sudo systemctl enable firewalld
    fi
    
    # Abrir puertos necesarios
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --permanent --add-port=3000/tcp
    sudo firewall-cmd --permanent --add-port=5000/tcp
    sudo firewall-cmd --reload
    
    log "Firewall configurado"
}

# Crear scripts de gestión
create_management_scripts() {
    log "Creando scripts de gestión..."
    
    # Script principal de control
    sudo tee /usr/local/bin/fprax-control > /dev/null << 'EOF'
#!/bin/bash

FPRAX_DIR="/opt/fprax"

case "$1" in
    start)
        echo "🚀 Iniciando servicios FPRAX..."
        sudo systemctl start postgresql
        sudo systemctl start nginx
        cd $FPRAX_DIR/backend && pm2 start ecosystem.config.js 2>/dev/null || echo "Backend config no encontrado"
        cd $FPRAX_DIR/frontend && pm2 start frontend-ecosystem.config.js 2>/dev/null || echo "Frontend config no encontrado"
        echo "✅ Servicios iniciados"
        ;;
    stop)
        echo "🛑 Deteniendo servicios FPRAX..."
        pm2 stop all 2>/dev/null || echo "No hay procesos PM2"
        sudo systemctl stop nginx
        echo "✅ Servicios detenidos"
        ;;
    restart)
        echo "🔄 Reiniciando servicios FPRAX..."
        $0 stop
        sleep 3
        $0 start
        ;;
    status)
        echo "📊 Estado de servicios FPRAX:"
        echo "--- PostgreSQL ---"
        sudo systemctl status postgresql --no-pager -l
        echo "--- Nginx ---"
        sudo systemctl status nginx --no-pager -l
        echo "--- PM2 ---"
        pm2 status 2>/dev/null || echo "PM2 no tiene procesos"
        ;;
    logs)
        echo "📄 Logs del sistema:"
        echo "--- Backend ---"
        [ -f $FPRAX_DIR/logs/backend.log ] && tail -20 $FPRAX_DIR/logs/backend.log || echo "Log no encontrado"
        echo "--- Frontend ---"
        [ -f $FPRAX_DIR/logs/frontend.log ] && tail -20 $FPRAX_DIR/logs/frontend.log || echo "Log no encontrado"
        ;;
    backup)
        echo "💾 Creando backup de base de datos..."
        backup_file="$FPRAX_DIR/backups/fprax_backup_$(date +%Y%m%d_%H%M%S).sql"
        sudo -u postgres pg_dump fprax_db > "$backup_file" && echo "Backup creado: $backup_file"
        ;;
    *)
        echo "Uso: $0 {start|stop|restart|status|logs|backup}"
        exit 1
        ;;
esac
EOF
    
    sudo chmod +x /usr/local/bin/fprax-control
    
    # Script de verificación
    cp verificar-centos.sh /usr/local/bin/fprax-verify 2>/dev/null || true
    sudo chmod +x /usr/local/bin/fprax-verify 2>/dev/null || true
    
    log "Scripts de gestión creados"
}

# Ejecutar función principal
main "$@"
