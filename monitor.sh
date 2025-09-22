#!/bin/bash
# ==========================================
# SCRIPT DE MONITOREO Y SALUD DEL SISTEMA
# ==========================================

set -e

# Variables
PROJECT_NAME="ausb"
DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
LOG_FILE="./logs/monitoring.log"
ALERT_EMAIL="admin@your-domain.com"

# Función de logging
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Verificar salud de servicios
check_service_health() {
    local service=$1
    local url=$2
    
    if curl -f -s --max-time 10 "$url" >/dev/null 2>&1; then
        log "✅ $service: Saludable"
        return 0
    else
        log "❌ $service: No responde"
        return 1
    fi
}

# Verificar uso de recursos
check_resources() {
    log "📊 Verificando uso de recursos..."
    
    # CPU y Memoria
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | while read line; do
        log "  $line"
    done
    
    # Espacio en disco
    df -h | grep -E "/$|/var" | while read line; do
        log "  Disco: $line"
    done
}

# Verificar logs de errores
check_error_logs() {
    log "🔍 Verificando logs de errores..."
    
    # Errores en backend en las últimas 5 minutos
    local errors=$(docker-compose -f "$DOCKER_COMPOSE_FILE" logs --since="5m" backend 2>&1 | grep -i "error" | wc -l)
    
    if [ "$errors" -gt 10 ]; then
        log "⚠️  Alto número de errores en backend: $errors"
        return 1
    fi
    
    log "✅ Logs de errores normales: $errors errores"
    return 0
}

# Verificar base de datos
check_database() {
    log "🗄️  Verificando base de datos..."
    
    # Verificar conexiones activas
    local connections=$(docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T database mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SHOW STATUS LIKE 'Threads_connected';" | tail -n 1 | awk '{print $2}')
    
    if [ "$connections" -gt 80 ]; then
        log "⚠️  Alto número de conexiones: $connections"
        return 1
    fi
    
    log "✅ Conexiones de BD normales: $connections"
    return 0
}

# Verificar espacio de almacenamiento
check_storage() {
    log "💾 Verificando almacenamiento..."
    
    # Verificar volúmenes de Docker
    docker system df | while read line; do
        log "  $line"
    done
    
    # Alertar si el uso de disco es >85%
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$disk_usage" -gt 85 ]; then
        log "⚠️  Uso de disco alto: $disk_usage%"
        return 1
    fi
    
    log "✅ Uso de disco normal: $disk_usage%"
    return 0
}

# Enviar alerta por email
send_alert() {
    local message=$1
    
    # Aquí puedes integrar con tu servicio de email preferido
    log "📧 Enviando alerta: $message"
    
    # Ejemplo con sendmail (requiere configuración)
    # echo "$message" | mail -s "ALERTA: $PROJECT_NAME" "$ALERT_EMAIL"
}

# Reporte de estado
generate_report() {
    log "📋 Generando reporte de estado..."
    
    echo "===========================================" >> "$LOG_FILE"
    echo "REPORTE DE ESTADO - $(date)" >> "$LOG_FILE"
    echo "===========================================" >> "$LOG_FILE"
    
    # Estado de contenedores
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps >> "$LOG_FILE"
    
    echo "===========================================" >> "$LOG_FILE"
}

# Función principal de monitoreo
main() {
    mkdir -p ./logs
    
    log "🔍 Iniciando monitoreo del sistema..."
    
    local errors=0
    
    # Verificaciones de salud
    check_service_health "Frontend" "http://localhost:3000" || ((errors++))
    check_service_health "Backend" "http://localhost:5000/health" || ((errors++))
    check_service_health "NGINX" "http://localhost/health" || ((errors++))
    
    # Verificaciones de recursos
    check_resources
    check_error_logs || ((errors++))
    check_database || ((errors++))
    check_storage || ((errors++))
    
    # Generar reporte
    generate_report
    
    # Alertar si hay errores
    if [ "$errors" -gt 0 ]; then
        local alert_msg="Se detectaron $errors problemas en el sistema $PROJECT_NAME"
        send_alert "$alert_msg"
        log "⚠️  $alert_msg"
        exit 1
    else
        log "✅ Todos los sistemas funcionando correctamente"
        exit 0
    fi
}

# Función para limpiar logs antiguos
cleanup_logs() {
    log "🧹 Limpiando logs antiguos..."
    
    # Mantener solo logs de los últimos 30 días
    find ./logs -name "*.log" -mtime +30 -delete
    
    # Rotar logs de Docker si son muy grandes
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs --tail=1000 > ./logs/docker-recent.log
    
    log "✅ Limpieza de logs completada"
}

# Manejo de argumentos
case "${1:-monitor}" in
    monitor)
        main
        ;;
    cleanup)
        cleanup_logs
        ;;
    report)
        generate_report
        cat "$LOG_FILE" | tail -50
        ;;
    *)
        echo "Uso: $0 {monitor|cleanup|report}"
        echo "  monitor: Verificar salud del sistema (por defecto)"
        echo "  cleanup: Limpiar logs antiguos"
        echo "  report:  Mostrar reporte reciente"
        exit 1
        ;;
esac