# Arquitectura Multi-Rol - Ausbildung Platform

## Roles Identificados del Backend

1. **`student`** - Estudiante ✅ (Ya implementado)
2. **`company`** - Empresa 🔄 (Por implementar)
3. **`scenter`** - Centro de estudios 🔄 (Por implementar)
4. **`tutor`** - Tutor 🔄 (Por implementar)
5. **`admin`** - Administrador 🔄 (Por implementar)

## Funcionalidades por Rol

### 👨‍🎓 **Estudiante (Student)** - ✅ IMPLEMENTADO
- ✅ Ver ofertas públicas
- ✅ Aplicar a ofertas
- ✅ Gestionar CV
- ✅ Dashboard con estadísticas
- ✅ Notificaciones

### 🏢 **Empresa (Company)** - 🔄 POR IMPLEMENTAR
- 📝 Crear y gestionar ofertas
- 👥 Ver estudiantes que aplicaron
- 💰 **Monetización**: Revelar CVs (pago por CV)
- 📊 Dashboard con estadísticas de ofertas
- 🔍 Buscador avanzado de estudiantes
- 📋 Gestión de aplicaciones recibidas
- 🏢 Gestión de perfil de empresa

### 🎓 **Centro de Estudios (Scenter)** - 🔄 POR IMPLEMENTAR
- 👥 Gestión de estudiantes asociados
- 👨‍🏫 Gestión de tutores
- 📊 Dashboard con estadísticas de estudiantes
- 🎯 Seguimiento de colocaciones
- 📋 Gestión de programas formativos
- 🏫 Gestión de perfil del centro

### 👨‍🏫 **Tutor** - 🔄 POR IMPLEMENTAR
- 👥 Seguimiento de estudiantes asignados
- 📊 Dashboard con progreso de estudiantes
- 📝 Gestión de incidencias
- 💬 Comunicación con empresas
- 🎓 Vinculado a centro de estudios específico

### 🔧 **Administrador (Admin)** - 🔄 POR IMPLEMENTAR
- 👥 Gestión de todos los usuarios
- 🏢 Gestión de empresas y centros
- 📊 Dashboard global con todas las estadísticas
- 🔧 Configuración del sistema
- 💰 Gestión de monetización

## Arquitectura de Navegación Propuesta

### **Flujo de Login Multi-Rol**

```
LOGIN PAGE
├── Email/Password
├── Social Login (Google, Facebook)
└── [Después del login] → Selector de Rol Disponible
```

### **Selector de Rol (Post-Login)**

```javascript
// Ejemplo de respuesta del backend después del login
{
  user: {
    id: 1,
    email: "usuario@email.com",
    availableRoles: ["student", "company"], // Usuario puede ser estudiante Y empresa
    activeRole: "student" // Rol activo actual
  }
}
```

### **Dashboard Adaptativo**

```
DASHBOARD
├── if (role === 'student') → Student Dashboard
├── if (role === 'company') → Company Dashboard  
├── if (role === 'scenter') → Study Center Dashboard
├── if (role === 'tutor') → Tutor Dashboard
└── if (role === 'admin') → Admin Dashboard
```

## Componentes a Desarrollar

### **1. Role Selector Component**
```typescript
// src/components/role-selector.tsx
interface RoleSelectorProps {
  availableRoles: string[];
  activeRole: string;
  onRoleChange: (role: string) => void;
}
```

### **2. Dashboard Factory**
```typescript
// src/components/dashboard-factory.tsx
const DashboardFactory = ({ role }: { role: string }) => {
  switch (role) {
    case 'student': return <StudentDashboard />;
    case 'company': return <CompanyDashboard />;
    case 'scenter': return <StudyCenterDashboard />;
    case 'tutor': return <TutorDashboard />;
    case 'admin': return <AdminDashboard />;
    default: return <StudentDashboard />;
  }
};
```

### **3. Navigation per Role**
```typescript
// src/components/navigation-factory.tsx
const NavigationFactory = ({ role }: { role: string }) => {
  const navItems = getNavItemsForRole(role);
  return <Navigation items={navItems} />;
};
```

## Rutas por Rol

### **Estudiante** (✅ Ya implementado)
- `/dashboard` - Dashboard principal
- `/mi-cv` - Gestión de CV
- `/aplicaciones` - Aplicaciones enviadas
- `/ofertas` - Ofertas disponibles (público)

### **Empresa** (🔄 Por implementar)
- `/dashboard` - Dashboard de empresa
- `/mi-empresa` - Gestión de perfil
- `/ofertas` - Gestión de ofertas creadas
- `/crear-oferta` - Crear nueva oferta
- `/buscador-alumnos` - Buscar estudiantes
- `/aplicaciones-recibidas` - Ver aplicaciones
- `/cvs-revelados` - CVs comprados
- `/facturacion` - Historial de pagos

### **Centro de Estudios** (🔄 Por implementar)
- `/dashboard` - Dashboard del centro
- `/mi-centro` - Gestión de perfil
- `/estudiantes` - Gestión de estudiantes
- `/tutores` - Gestión de tutores
- `/estadisticas` - Estadísticas del centro
- `/programas` - Gestión de programas

### **Tutor** (🔄 Por implementar)
- `/dashboard` - Dashboard del tutor
- `/mis-estudiantes` - Estudiantes asignados
- `/seguimiento` - Seguimiento de progreso
- `/incidencias` - Gestión de incidencias
- `/comunicacion` - Comunicación con empresas

## Monetización - Revelado de CVs

### **Flujo de Compra de CV**
```
EMPRESA ve lista de aplicantes
├── Información básica (gratis): Nombre, programa, centro
├── [BOTÓN] "Revelar CV Completo" → €X.XX
├── Procesamiento de pago
└── Acceso completo al CV
```

### **Integración de Pagos**
- Stripe/PayPal para procesamiento
- Historial de transacciones
- Facturas automáticas
- Créditos empresariales

## Próximos Pasos

1. **Implementar Role Selector** en login
2. **Crear Dashboard Company** 
3. **Crear Dashboard Study Center**
4. **Implementar gestión de ofertas para empresas**
5. **Implementar búsqueda y revelado de CVs**
6. **Crear dashboards restantes (tutor, admin)**

## Consideraciones Técnicas

- **Estado Global**: Gestión de rol activo en Zustand store
- **Autenticación**: JWT con información de roles
- **Rutas Protegidas**: AuthGuard con validación de rol
- **Responsive Design**: Todas las vistas optimizadas para mobile
- **Monetización**: Integración con sistema de pagos
