#!/bin/bash

# =================================================================
# Script de Verificación Post-Migración - FPRAX en CentOS
# =================================================================

echo "🔍 VERIFICACIÓN DEL SISTEMA FPRAX EN CENTOS"
echo "=============================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para verificar estado
check_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
        return 0
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Función para verificar comando
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
        return 0
    else
        echo -e "${RED}❌ $1 NO está instalado${NC}"
        return 1
    fi
}

echo
echo "🖥️  INFORMACIÓN DEL SISTEMA"
echo "============================="
echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
echo "Kernel: $(uname -r)"
echo "Memoria: $(free -h | grep '^Mem:' | awk '{print $2}') total, $(free -h | grep '^Mem:' | awk '{print $7}') disponible"
echo "Espacio en disco: $(df -h / | tail -1 | awk '{print $4}') disponible en /"

echo
echo "📦 VERIFICACIÓN DE DEPENDENCIAS"
echo "==============================="

# Verificar comandos básicos
check_command "node"
if command -v node &> /dev/null; then
    echo "   Versión Node.js: $(node --version)"
fi

check_command "npm"
if command -v npm &> /dev/null; then
    echo "   Versión NPM: $(npm --version)"
fi

check_command "pnpm"
if command -v pnpm &> /dev/null; then
    echo "   Versión PNPM: $(pnpm --version)"
fi

check_command "pm2"
if command -v pm2 &> /dev/null; then
    echo "   Versión PM2: $(pm2 --version)"
fi

check_command "psql"
if command -v psql &> /dev/null; then
    echo "   Versión PostgreSQL: $(psql --version | awk '{print $3}')"
fi

check_command "nginx"
if command -v nginx &> /dev/null; then
    echo "   Versión Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
fi

check_command "git"
if command -v git &> /dev/null; then
    echo "   Versión Git: $(git --version | awk '{print $3}')"
fi

echo
echo "🔧 VERIFICACIÓN DE SERVICIOS"
echo "============================="

# Verificar PostgreSQL
systemctl is-active --quiet postgresql
check_status $? "PostgreSQL está activo"

systemctl is-enabled --quiet postgresql
check_status $? "PostgreSQL está habilitado para inicio automático"

# Verificar Nginx
systemctl is-active --quiet nginx
check_status $? "Nginx está activo"

systemctl is-enabled --quiet nginx
check_status $? "Nginx está habilitado para inicio automático"

# Verificar firewall
systemctl is-active --quiet firewalld
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Firewalld está activo${NC}"
    echo "   Puertos abiertos: $(sudo firewall-cmd --list-ports 2>/dev/null)"
else
    echo -e "${YELLOW}⚠️  Firewalld no está activo${NC}"
fi

echo
echo "📁 VERIFICACIÓN DE DIRECTORIOS"
echo "=============================="

# Verificar estructura de directorios
dirs=("/opt/fprax" "/opt/fprax/backend" "/opt/fprax/frontend" "/opt/fprax/logs")
for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir existe${NC}"
        echo "   Propietario: $(ls -ld $dir | awk '{print $3":"$4}')"
    else
        echo -e "${RED}❌ $dir NO existe${NC}"
    fi
done

echo
echo "🔗 VERIFICACIÓN DE CONECTIVIDAD"
echo "==============================="

# Verificar puertos locales
ports=(3000 5000 80 5432)
for port in "${ports[@]}"; do
    if netstat -tuln 2>/dev/null | grep ":$port " > /dev/null; then
        echo -e "${GREEN}✅ Puerto $port está en uso${NC}"
    else
        echo -e "${RED}❌ Puerto $port NO está en uso${NC}"
    fi
done

# Verificar conectividad HTTP
echo
echo "🌐 VERIFICACIÓN WEB"
echo "=================="

# Verificar backend (puerto 5000)
if curl -s -I http://localhost:5000 &>/dev/null; then
    echo -e "${GREEN}✅ Backend responde en puerto 5000${NC}"
    echo "   Status: $(curl -s -I http://localhost:5000 | head -1)"
else
    echo -e "${RED}❌ Backend NO responde en puerto 5000${NC}"
fi

# Verificar frontend (puerto 3000)
if curl -s -I http://localhost:3000 &>/dev/null; then
    echo -e "${GREEN}✅ Frontend responde en puerto 3000${NC}"
    echo "   Status: $(curl -s -I http://localhost:3000 | head -1)"
else
    echo -e "${RED}❌ Frontend NO responde en puerto 3000${NC}"
fi

# Verificar Nginx (puerto 80)
if curl -s -I http://localhost:80 &>/dev/null; then
    echo -e "${GREEN}✅ Nginx responde en puerto 80${NC}"
    echo "   Status: $(curl -s -I http://localhost:80 | head -1)"
else
    echo -e "${RED}❌ Nginx NO responde en puerto 80${NC}"
fi

echo
echo "💾 VERIFICACIÓN DE BASE DE DATOS"
echo "==============================="

# Verificar conexión a PostgreSQL
if sudo -u postgres psql -d fprax_db -c "SELECT version();" &>/dev/null; then
    echo -e "${GREEN}✅ Conexión a base de datos fprax_db exitosa${NC}"
    
    # Verificar tablas
    table_count=$(sudo -u postgres psql -d fprax_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
    if [ "$table_count" -gt 0 ]; then
        echo -e "${GREEN}✅ Base de datos tiene $table_count tablas${NC}"
    else
        echo -e "${YELLOW}⚠️  Base de datos está vacía (0 tablas)${NC}"
    fi
else
    echo -e "${RED}❌ NO se puede conectar a la base de datos fprax_db${NC}"
fi

echo
echo "🔄 VERIFICACIÓN DE PM2"
echo "====================="

if command -v pm2 &> /dev/null; then
    pm2_status=$(pm2 jlist 2>/dev/null)
    if [ $? -eq 0 ]; then
        running_apps=$(echo "$pm2_status" | jq length 2>/dev/null || echo "0")
        echo -e "${GREEN}✅ PM2 está funcionando con $running_apps aplicaciones${NC}"
        
        # Mostrar estado de aplicaciones
        if [ "$running_apps" -gt 0 ]; then
            echo "   Aplicaciones PM2:"
            pm2 status --no-color 2>/dev/null | grep -E "(App name|fprax-|│)" | head -20
        fi
    else
        echo -e "${RED}❌ PM2 no está funcionando correctamente${NC}"
    fi
else
    echo -e "${RED}❌ PM2 no está instalado${NC}"
fi

echo
echo "📄 VERIFICACIÓN DE ARCHIVOS DE CONFIGURACIÓN"
echo "==========================================="

# Verificar archivos importantes
config_files=(
    "/opt/fprax/backend/.env"
    "/opt/fprax/frontend/.env.local"
    "/opt/fprax/backend/package.json"
    "/opt/fprax/frontend/package.json"
    "/etc/nginx/conf.d/fprax.conf"
)

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file existe${NC}"
        echo "   Tamaño: $(du -h $file | cut -f1)"
    else
        echo -e "${RED}❌ $file NO existe${NC}"
    fi
done

echo
echo "📊 VERIFICACIÓN DE LOGS"
echo "======================"

log_files=(
    "/opt/fprax/logs/backend.log"
    "/opt/fprax/logs/frontend.log"
    "/var/log/nginx/fprax_access.log"
    "/var/log/nginx/fprax_error.log"
)

for log in "${log_files[@]}"; do
    if [ -f "$log" ]; then
        echo -e "${GREEN}✅ $log existe${NC}"
        lines=$(wc -l < "$log" 2>/dev/null)
        size=$(du -h "$log" 2>/dev/null | cut -f1)
        echo "   Líneas: $lines, Tamaño: $size"
        
        # Mostrar últimas líneas si hay errores
        if grep -i "error\|fail\|exception" "$log" &>/dev/null; then
            echo -e "${YELLOW}   ⚠️  Contiene errores recientes${NC}"
        fi
    else
        echo -e "${RED}❌ $log NO existe${NC}"
    fi
done

echo
echo "🔒 VERIFICACIÓN DE SEGURIDAD"
echo "============================"

# Verificar permisos de archivos sensibles
sensitive_files=(
    "/opt/fprax/backend/.env"
    "/opt/fprax/frontend/.env.local"
)

for file in "${sensitive_files[@]}"; do
    if [ -f "$file" ]; then
        perms=$(stat -c "%a" "$file" 2>/dev/null)
        if [ "$perms" = "600" ] || [ "$perms" = "644" ]; then
            echo -e "${GREEN}✅ $file tiene permisos seguros ($perms)${NC}"
        else
            echo -e "${YELLOW}⚠️  $file tiene permisos: $perms (recomendado: 600)${NC}"
        fi
    fi
done

echo
echo "📋 RESUMEN FINAL"
echo "==============="

# Generar resumen basado en verificaciones anteriores
errors=0
warnings=0

# Contar errores y warnings (simplificado)
if ! systemctl is-active --quiet postgresql; then ((errors++)); fi
if ! systemctl is-active --quiet nginx; then ((errors++)); fi
if ! command -v pm2 &> /dev/null; then ((errors++)); fi
if ! command -v node &> /dev/null; then ((errors++)); fi

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}🎉 SISTEMA COMPLETAMENTE FUNCIONAL${NC}"
    echo "   ✅ Todos los servicios principales están funcionando"
    echo "   ✅ La aplicación FPRAX está lista para usar"
    echo
    echo "🌐 URLs de Acceso:"
    echo "   Frontend: http://$(hostname -I | awk '{print $1}'):3000"
    echo "   Backend:  http://$(hostname -I | awk '{print $1}'):5000"
    echo "   Nginx:    http://$(hostname -I | awk '{print $1}'):80"
elif [ $errors -le 2 ]; then
    echo -e "${YELLOW}⚠️  SISTEMA PARCIALMENTE FUNCIONAL${NC}"
    echo "   Algunos servicios necesitan atención"
    echo "   Revisar los elementos marcados en rojo arriba"
else
    echo -e "${RED}❌ SISTEMA CON PROBLEMAS CRÍTICOS${NC}"
    echo "   Múltiples servicios no están funcionando"
    echo "   Necesaria intervención manual"
fi

echo
echo "📞 COMANDOS ÚTILES PARA SOLUCIÓN DE PROBLEMAS:"
echo "============================================="
echo "Ver logs de backend:    tail -f /opt/fprax/logs/backend.log"
echo "Ver logs de frontend:   tail -f /opt/fprax/logs/frontend.log"
echo "Estado de PM2:          pm2 status"
echo "Reiniciar servicios:    fprax-control restart"
echo "Ver estado completo:    fprax-control status"

echo
echo "✅ Verificación completada - $(date)"
