#!/bin/bash
# ==========================================
# SCRIPT DE DEPLOYMENT PARA PRODUCCIÓN
# ==========================================

set -e

echo "🚀 Iniciando deployment de AUSB..."

# Variables
PROJECT_NAME="ausb"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Función de error
error() {
    echo "❌ ERROR: $1" >&2
    exit 1
}

# Verificar dependencias
check_dependencies() {
    log "🔍 Verificando dependencias..."
    
    command -v docker >/dev/null 2>&1 || error "Docker no está instalado"
    command -v docker-compose >/dev/null 2>&1 || error "Docker Compose no está instalado"
    
    log "✅ Dependencias verificadas"
}

# Crear backup de la base de datos
backup_database() {
    log "💾 Creando backup de la base de datos..."
    
    mkdir -p "$BACKUP_DIR"
    
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps database | grep -q "Up"; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database mysqldump \
            -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/database.sql"
        log "✅ Backup creado en $BACKUP_DIR/database.sql"
    else
        log "⚠️  Base de datos no está corriendo, omitiendo backup"
    fi
}

# Construir imágenes
build_images() {
    log "🏗️  Construyendo imágenes..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    log "✅ Imágenes construidas"
}

# Parar servicios
stop_services() {
    log "⏹️  Parando servicios..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" down --remove-orphans
    
    log "✅ Servicios parados"
}

# Iniciar servicios
start_services() {
    log "▶️  Iniciando servicios..."
    
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    log "✅ Servicios iniciados"
}

# Verificar salud de servicios
health_check() {
    log "🏥 Verificando salud de servicios..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost/health >/dev/null 2>&1; then
            log "✅ Servicios funcionando correctamente"
            return 0
        fi
        
        log "⏳ Intento $attempt/$max_attempts - esperando servicios..."
        sleep 10
        ((attempt++))
    done
    
    error "Servicios no responden después de $max_attempts intentos"
}

# Limpiar recursos antiguos
cleanup() {
    log "🧹 Limpiando recursos antiguos..."
    
    # Eliminar imágenes sin usar
    docker image prune -f
    
    # Eliminar volúmenes huérfanos
    docker volume prune -f
    
    # Eliminar redes no utilizadas
    docker network prune -f
    
    log "✅ Limpieza completada"
}

# Función principal
main() {
    log "🎯 Iniciando deployment de $PROJECT_NAME"
    
    # Verificar que existe el archivo de configuración
    [ -f "$DOCKER_COMPOSE_FILE" ] || error "Archivo $DOCKER_COMPOSE_FILE no encontrado"
    
    # Cargar variables de entorno
    [ -f ".env.production" ] && source .env.production
    
    # Ejecutar steps
    check_dependencies
    backup_database
    stop_services
    build_images
    start_services
    health_check
    cleanup
    
    log "🎉 ¡Deployment completado exitosamente!"
    log "🌐 Aplicación disponible en: https://your-domain.com"
    log "📊 Logs: docker-compose -f $DOCKER_COMPOSE_FILE logs -f"
}

# Ejecutar función principal
main "$@"