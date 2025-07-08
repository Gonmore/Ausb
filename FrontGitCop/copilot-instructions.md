# Ausbildung Frontend - GitHub Copilot Instructions

## 🎯 Contexto del Proyecto

Este es el frontend moderno de la plataforma **Ausbildung**, una aplicación para la gestión de prácticas profesionales que conecta estudiantes, centros educativos y empresas. El proyecto fue migrado desde un prototipo generado con v0.dev a un stack moderno y robusto.

## 📋 Stack Tecnológico

### Core Technologies
- **Next.js 15** con App Router
- **TypeScript** (configuración estricta)
- **Tailwind CSS 4** para estilos
- **Radix UI** para componentes base

### Librerías Principales
- **Zustand** - Gestión de estado global
- **React Query** (@tanstack/react-query) - Fetching y cache de datos
- **Axios** - Cliente HTTP
- **React Hook Form** + **Zod** - Formularios y validación
- **Sonner** - Notificaciones toast
- **Lucide React** - Iconos

## 🏗️ Arquitectura del Proyecto

### Estructura de Carpetas
```
src/
├── app/                  # Pages (App Router)
├── components/           # Componentes reutilizables
│   ├── auth/            # Componentes de autenticación
│   └── ui/              # Componentes de interfaz
├── lib/                 # Utilidades y configuración
├── stores/              # Stores de Zustand
├── types/               # Tipos TypeScript
└── hooks/               # Custom hooks
```

### Patrones de Código
- **Functional Components** con hooks
- **TypeScript** estricto en todos los archivos
- **Tailwind CSS** para estilos (no CSS modules)
- **Barrel exports** para components/ui
- **Absolute imports** usando `@/`

## 👥 Roles de Usuario

1. **student** - Estudiante
2. **company** - Empresa
3. **scenter** - Centro de Estudios
4. **tutor** - Tutor

## 📡 API Integration

### Backend URL
- **Desarrollo**: `http://localhost:3000`
- **Headers**: `Authorization: Bearer <token>`

### Endpoints Principales
- `POST /auth/login` - Iniciar sesión
- `POST /auth/register` - Registro
- `GET /offers` - Obtener ofertas
- `GET /companies` - Obtener empresas
- `GET /students` - Obtener estudiantes
- `GET /scenters` - Obtener centros

## 🎨 Guías de Estilo

### Componentes UI
- Usar componentes de `@/components/ui/` cuando sea posible
- Crear nuevos componentes UI siguiendo el patrón de Radix UI
- Usar `cn()` para combinar clases CSS
- Implementar variants con `class-variance-authority`

### Formularios
- Usar `React Hook Form` + `Zod` para validación
- Implementar manejo de errores consistente
- Usar `sonner` para notificaciones de éxito/error

### Estado
- **Zustand** para estado global (auth, settings)
- **React Query** para datos del servidor
- **Local state** para UI temporal

## 🔒 Autenticación

### Implementación
- JWT tokens almacenados en localStorage
- Auto-interceptor en Axios para headers
- Store de auth con Zustand + persist
- HOCs para rutas protegidas (`withAuth`, `withRole`)

### Flujo de Autenticación
1. Login → Store token + user data
2. Axios interceptor añade token automáticamente
3. Redirección basada en rol
4. Logout → Clear storage + redirect

## 📱 Responsive Design

### Breakpoints (Tailwind)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Patrones
- Mobile-first approach
- Sidebar → Mobile menu
- Grid → Stack en móvil
- Usar `hidden md:flex` para elementos desktop

## 🧩 Componentes Comunes

### Layouts
- `Navigation` - Barra de navegación principal
- `AuthInitializer` - Inicialización de autenticación
- `Providers` - Wrappers de providers

### Forms
- Usar `Label` + `Input` + error messages
- Implementar loading states
- Validación en tiempo real con Zod

### Cards
- `Card` + `CardHeader` + `CardContent`
- Hover effects con `hover:shadow-md`
- Responsive padding

## 📊 Gestión de Datos

### React Query
- **Query Keys**: `['entities', 'filters']`
- **Stale Time**: 60 segundos
- **Retry**: 1 vez
- Usar `useQuery` para GET requests
- Usar `useMutation` para POST/PUT/DELETE

### Error Handling
- Try-catch en async functions
- Toast notifications para errores
- Fallback UI para estados de error

## 🎯 Patterns Específicos

### Páginas
- Usar `'use client'` para componentes interactivos
- Implementar loading states
- Manejar casos sin datos
- Responsive layout con max-width

### Rutas Protegidas
```typescript
// Proteger por autenticación
export default withAuth(DashboardPage);

// Proteger por rol
export default withRole(['company'])(CompanyPage);
```

### Servicios
- Crear servicios en `lib/services.ts`
- Usar tipos TypeScript para requests/responses
- Implementar error handling consistente

## 🔧 Configuración

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Tailwind Config
- Configuración en `tailwind.config.js`
- Colores personalizados
- Animaciones incluidas

### TypeScript Config
- Paths absolutos configurados
- Strict mode enabled
- Include/exclude configurado

## 🚀 Mejores Prácticas

### Rendimiento
- Usar `React.memo` para componentes pesados
- Lazy loading para páginas grandes
- Optimizar imágenes con Next.js Image

### Accesibilidad
- Usar etiquetas semánticas
- Implementar aria-labels
- Keyboard navigation
- Color contrast adecuado

### SEO
- Metadata en páginas importantes
- Structured data cuando sea relevante
- Performance optimization

## 🐛 Debug y Testing

### Logging
- Usar `console.error` para errores
- React Query Devtools en desarrollo
- Zustand devtools disponibles

### Error Boundaries
- Implementar para rutas principales
- Fallback UI amigable
- Logging de errores

## 📝 Convenciones de Naming

### Files
- `kebab-case` para archivos
- `PascalCase` para componentes
- `camelCase` para functions/variables

### Variables
- `camelCase` para variables/functions
- `PascalCase` para components/types
- `UPPER_CASE` para constantes

### CSS Classes
- Usar Tailwind utilities
- Crear custom classes solo cuando sea necesario
- Seguir naming conventions de Tailwind

## 🔄 Flujos de Trabajo

### Desarrollo
1. Verificar tipos: `npm run type-check`
2. Linting: `npm run lint`
3. Testing local: `npm run dev`
4. Build: `npm run build`

### Deployment
- Build optimizado para producción
- Environment variables configuradas
- Performance monitoring

## 🎨 Temas y Estilos

### Color Palette
- Primary: Blue (`blue-600`)
- Secondary: Gray (`gray-600`)
- Success: Green (`green-600`)
- Error: Red (`red-600`)

### Typography
- Font: Inter (Google Fonts)
- Headings: `font-bold`
- Body: `font-normal`
- Small: `text-sm`

## 📈 Próximos Pasos

### Funcionalidades Pendientes
1. Crear/editar ofertas (para empresas)
2. Sistema de aplicaciones (para estudiantes)
3. Dashboard de administración
4. Sistema de notificaciones en tiempo real
5. Chat/mensajería
6. Sistema de evaluaciones
7. Reportes y analytics

### Mejoras Técnicas
1. Implementar testing (Jest + React Testing Library)
2. Añadir Storybook para componentes
3. Implementar PWA features
4. Optimizar bundle size
5. Añadir internacionalización (i18n)

---

**Nota**: Este proyecto está en desarrollo activo. Mantén estas instrucciones actualizadas conforme evoluciona el codebase.
