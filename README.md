# Ausbildung - Plataforma de Formación Profesional

Sistema completo para la gestión de formación profesional, ofertas laborales y conexiones entre estudiantes, empresas y centros educativos.

## 🚀 Inicio Rápido

### Opción 1: Acceso Local (Desarrollo)

```bash
# Backend
cd ausback
npm install
npm start

# Frontend (en otra terminal)
cd FrontGitCop
npm install
npm run dev
```

Acceder en: http://localhost:3001

### Opción 2: Acceso desde Red Local (Testing Multi-usuario)

Para que otros usuarios de tu oficina puedan probar el sistema:

```bash
# Ejecutar el script de configuración automática
.\scripts\start-network.bat
```

Este script:
- Detecta automáticamente tu IP local
- Configura el frontend para usar la IP del servidor
- Inicia ambos servidores con acceso en red

**URLs para compartir con otros usuarios:**
- Frontend: `http://TU_IP:3001`
- Backend API: `http://TU_IP:5000`
- Documentación: `http://TU_IP:5000/api-docs`

## 📋 Requisitos

### Desarrollo
- Node.js 18+
- PostgreSQL
- npm o yarn

### Producción
- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM mínimo
- 20GB disco disponible

## 🐳 Despliegue con Docker

### Configuración Completa para Producción

```bash
# 1. Configurar entorno de producción
.\scripts\setup-production.bat

# 2. Editar variables de entorno
notepad .env

# 3. Desplegar
.\scripts\deploy.bat

# 4. Verificar
.\scripts\check-deployment.bat
```

### Servicios Incluidos

- **PostgreSQL**: Base de datos robusta con health checks
- **Redis**: Cache y sesiones (opcional)
- **Nginx**: Proxy reverso con SSL y rate limiting
- **Backend**: API REST con Express.js optimizada
- **Frontend**: Aplicación Next.js en modo standalone

### Variables de Entorno Críticas

```bash
# Base de datos
DB_ROOT_PASSWORD=tu_password_seguro
DB_PASSWORD=tu_password_db

# Seguridad
JWT_SECRET=tu_jwt_secret_muy_seguro_32_chars_min
SESSION_SECRET=tu_session_secret_seguro

# URLs de producción
FRONTEND_URL=https://tu-dominio.com
NEXT_PUBLIC_API_URL=https://api.tu-dominio.com

# Geonames API
GEONAMES_USERNAME=tu_username_geonames
```

Ver [DEPLOYMENT_README.md](DEPLOYMENT_README.md) para guía completa de despliegue.

## 🏗️ Arquitectura

### Backend (Express.js + Sequelize)
- API REST completa
- Autenticación JWT
- Base de datos PostgreSQL
- WebSockets para notificaciones
- Documentación Swagger

### Frontend (Next.js + TypeScript)
- React con hooks personalizados
- UI moderna con shadcn/ui
- Autenticación integrada
- Formularios responsivos

## 🔧 Configuración

### Variables de Entorno

#### Backend (.env)
```env
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/ausbildung
JWT_SECRET=tu_jwt_secret
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_USE_API=true
```

### Base de Datos

```bash
# Crear base de datos
createdb ausbildung

# Ejecutar migraciones
cd ausback
npm run migrate
```

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/me` - Perfil del usuario

### Usuarios
- `GET /api/users/profile/me` - Perfil completo
- `PUT /api/users/profile/me` - Actualizar perfil

### Estudiantes
- `GET /api/students/:id` - Datos del estudiante
- `PUT /api/students/:id` - Actualizar estudiante

### Empresas
- `GET /api/company` - Lista de empresas
- `POST /api/company` - Crear empresa

### Ofertas
- `GET /api/offers` - Lista de ofertas
- `POST /api/offers` - Crear oferta

## 🔒 Roles del Sistema

1. **Estudiante**: Busca formación y oportunidades laborales
2. **Empresa**: Publica ofertas y busca candidatos
3. **Centro Educativo**: Gestiona formación profesional

## 🌐 Acceso en Red Local

Para testing multi-usuario:

1. **Backend**: Ya configurado para escuchar en todas las interfaces
2. **Frontend**: Actualizar `NEXT_PUBLIC_API_URL` con la IP del servidor
3. **Firewall**: Asegurar que permita conexiones al puerto 5000

### Scripts de Ayuda

- `scripts\start-network.bat` - Configuración e inicio automático
- `scripts\setup-network-access.bat` - Configurar solo frontend
- `ausback/network-info.bat` - Mostrar URLs de acceso

Ver [NETWORK_ACCESS_README.md](NETWORK_ACCESS_README.md) para instrucciones detalladas.

## 🧪 Testing

```bash
# Backend
cd ausback
npm test

# Frontend
cd FrontGitCop
npm run type-check
npm run lint
```

## 📖 Documentación Adicional

- [🚀 Guía de Despliegue](scripts/DEPLOYMENT_README.md)
- [🌐 Acceso en Red](scripts/NETWORK_ACCESS_README.md)
- [🔧 ¿Por qué Nginx?](scripts/WHY_NGINX.md) - Arquitectura técnica explicada
- [🔧 API Backend](ausback/README.md)
- [🎨 Frontend Guide](FrontGitCop/README.md)
- [🗄️ Database Schema](docs/)

## 🛠️ Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `scripts\setup-production.bat` | Configura entorno de producción |
| `scripts\deploy.bat` | Despliegue completo con Docker |
| `scripts\check-deployment.bat` | Verifica estado del despliegue |
| `scripts\start-network.bat` | Configuración para acceso en red local |
| `scripts\setup-network-access.bat` | Configura frontend para red local |

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🆘 Soporte

Si encuentras problemas:

1. **Docker**: `docker-compose logs -f`
2. **Configuración**: Verifica `.env`
3. **Documentación**: Consulta [DEPLOYMENT_README.md](DEPLOYMENT_README.md)
4. **Issues**: Revisa issues existentes en el repositorio

¡Gracias por usar Ausbildung! 🎓