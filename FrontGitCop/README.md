# Ausbildung Frontend

Una plataforma moderna para la gestión de prácticas profesionales que conecta estudiantes, centros educativos y empresas.

## 🚀 Características

- **Autenticación completa**: Login y registro con JWT
- **Roles de usuario**: Estudiantes, empresas, centros educativos y tutores
- **Gestión de ofertas**: Crear, editar y buscar oportunidades de prácticas
- **Dashboard personalizado**: Interfaz adaptada según el rol del usuario
- **Diseño responsivo**: Optimizado para desktop y móvil
- **Interfaz moderna**: Construida con Next.js 15 y Tailwind CSS

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes UI**: Radix UI
- **Gestión de estado**: Zustand
- **Fetching de datos**: React Query (@tanstack/react-query)
- **Cliente HTTP**: Axios
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: Sonner
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router pages
│   ├── dashboard/         # Dashboard principal
│   ├── login/             # Página de inicio de sesión
│   ├── registro/          # Página de registro
│   └── ofertas/           # Listado de ofertas
├── components/            # Componentes reutilizables
│   ├── auth/             # Componentes de autenticación
│   ├── ui/               # Componentes de interfaz
│   └── navigation.tsx    # Navegación principal
├── lib/                   # Utilidades y configuración
│   ├── api.ts            # Cliente HTTP con Axios
│   ├── services.ts       # Servicios para API
│   └── utils.ts          # Funciones de utilidad
├── stores/               # Stores de Zustand
│   └── auth.ts           # Store de autenticación
└── types/                # Tipos TypeScript
    └── index.ts          # Definiciones de tipos
```

## 🚦 Comenzar

### Prerrequisitos

- Node.js 18 o superior
- npm o yarn
- Backend de Ausbildung ejecutándose en puerto 3000

### Instalación

1. Clona el repositorio:
   ```bash
   git clone <repository-url>
   cd ausbildung-frontend
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Crea un archivo `.env.local` con las variables de entorno:
   ```bash
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre [http://localhost:3001](http://localhost:3001) en tu navegador

### Scripts Disponibles

- `npm run dev` - Inicia el servidor de desarrollo con Turbo
- `npm run build` - Construye la aplicación para producción
- `npm run start` - Inicia el servidor de producción
- `npm run lint` - Ejecuta ESLint
- `npm run type-check` - Verifica tipos TypeScript

## 🔐 Autenticación

La aplicación utiliza JWT para la autenticación. Los tokens se almacenan en localStorage y se incluyen automáticamente en las peticiones HTTP.

### Roles de Usuario

1. **Estudiante** (`student`): Puede buscar ofertas, crear CV y aplicar a prácticas
2. **Empresa** (`company`): Puede crear ofertas, ver candidatos y gestionar contrataciones
3. **Centro Educativo** (`scenter`): Puede gestionar estudiantes y tutores
4. **Tutor** (`tutor`): Puede supervisar estudiantes y crear evaluaciones

## 📱 Funcionalidades por Rol

### Estudiante
- Ver y buscar ofertas de prácticas
- Crear y gestionar CV
- Aplicar a ofertas
- Ver estado de aplicaciones

### Empresa
- Crear y gestionar ofertas
- Ver candidatos
- Gestionar proceso de selección
- Ver estadísticas de contrataciones

### Centro Educativo
- Gestionar estudiantes
- Asignar tutores
- Ver reportes de prácticas
- Gestionar convenios

### Tutor
- Supervisar estudiantes asignados
- Crear evaluaciones
- Generar reportes de seguimiento
- Comunicarse con empresas

## 🎨 Componentes UI

El proyecto utiliza una librería de componentes construida sobre Radix UI:

- **Button**: Botones con variantes
- **Card**: Tarjetas para contenido
- **Input**: Campos de entrada
- **Badge**: Etiquetas de estado
- **Radio Group**: Grupos de botones radio
- **Y más...**

## 📊 Gestión de Estado

- **Zustand**: Para estado global (autenticación, preferencias)
- **React Query**: Para estado del servidor (cache, sincronización)
- **React Hook Form**: Para estado de formularios

## 🔧 Configuración

### Tailwind CSS
El proyecto está configurado con Tailwind CSS 4 y incluye:
- Configuración de colores personalizada
- Animaciones predefinidas
- Clases de utilidad para spacing y layout

### TypeScript
Configuración estricta de TypeScript con:
- Paths absolutos (`@/`)
- Tipos estrictos
- Verificación de tipos en build

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🔗 Enlaces Útiles

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)
