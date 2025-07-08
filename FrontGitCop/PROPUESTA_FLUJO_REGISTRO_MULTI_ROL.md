# PROPUESTA: Flujo de Registro Multi-Rol con Redes Sociales

## 🎯 **FLUJO RECOMENDADO: Registro por Pasos**

### **1. Página de Registro/Login**
```
┌─────────────────────────────────────────────────┐
│              🎓 AUSBILDUNG                      │
│                                                 │
│    Inicia sesión o regístrate                   │
│                                                 │
│    [🔵 Continuar con Google]                    │
│    [📘 Continuar con Facebook]                  │
│    [✉️  Continuar con Email]                    │
│                                                 │
│    ¿Ya tienes cuenta? [Iniciar sesión]          │
└─────────────────────────────────────────────────┘
```

### **2. Después de Autenticación Social**
```
┌─────────────────────────────────────────────────┐
│    ¡Hola [Nombre de la red social]! 👋         │
│                                                 │
│    Para completar tu registro, selecciona       │
│    el tipo de perfil que quieres crear:        │
│                                                 │
│    👨‍🎓 SOY ESTUDIANTE                          │
│    • Busco oportunidades laborales             │
│    • Quiero crear mi CV profesional            │
│    • Busco prácticas y empleos                 │
│    [Crear perfil de estudiante]                │
│                                                 │
│    🏢 REPRESENTO UNA EMPRESA                    │
│    • Publico ofertas de trabajo                │
│    • Busco talento joven                       │
│    • Gestiono procesos de selección            │
│    [Crear perfil de empresa]                   │
│                                                 │
│    🏫 SOY DE UN CENTRO DE ESTUDIOS             │
│    • Gestiono estudiantes                      │
│    • Superviso programas formativos             │
│    • Conecto estudiantes con empresas          │
│    [Crear perfil de centro]                    │
│                                                 │
│    💡 Podrás agregar más perfiles después       │
└─────────────────────────────────────────────────┘
```

### **3. Formularios Específicos por Rol**

#### **3A. Estudiante**
```
┌─────────────────────────────────────────────────┐
│    👨‍🎓 Completa tu perfil de estudiante        │
│                                                 │
│    Información básica (prellenada de red social): │
│    • Nombre: [María García]                     │
│    • Email: [maria@gmail.com]                   │
│                                                 │
│    Información académica:                       │
│    • Programa de estudios: [Dropdown]           │
│    • Centro de estudios: [Dropdown/Autocomplete] │
│    • Año de estudio: [Dropdown]                 │
│    • Fecha de graduación: [Date picker]         │
│                                                 │
│    Preferencias laborales:                      │
│    • Tipo de empleo: [Prácticas/Tiempo parcial/etc] │
│    • Ubicación preferida: [Dropdown]            │
│    • Industrias de interés: [Multi-select]      │
│                                                 │
│    [Crear mi perfil] [← Volver]                 │
└─────────────────────────────────────────────────┘
```

#### **3B. Empresa**
```
┌─────────────────────────────────────────────────┐
│    🏢 Completa tu perfil de empresa             │
│                                                 │
│    Información personal:                        │
│    • Nombre: [Juan Pérez]                       │
│    • Email: [juan@empresa.com]                  │
│    • Cargo: [Dropdown: RRHH, Gerente, etc.]    │
│                                                 │
│    Información de la empresa:                   │
│    • Nombre de la empresa: [Input]              │
│    • CIF/NIF: [Input]                          │
│    • Sector: [Dropdown]                        │
│    • Tamaño: [1-10, 11-50, 51-200, 200+]      │
│    • Dirección: [Input]                        │
│    • Sitio web: [Input]                        │
│                                                 │
│    Plan de suscripción:                         │
│    • 🆓 Básico: 2 ofertas/mes                  │
│    • 💎 Premium: Ofertas ilimitadas + extras    │
│                                                 │
│    [Crear mi perfil] [← Volver]                 │
└─────────────────────────────────────────────────┘
```

#### **3C. Centro de Estudios**
```
┌─────────────────────────────────────────────────┐
│    🏫 Completa tu perfil de centro              │
│                                                 │
│    Información personal:                        │
│    • Nombre: [Ana López]                        │
│    • Email: [ana@centro.edu]                    │
│    • Cargo: [Coordinador, Director, etc.]       │
│                                                 │
│    Información del centro:                      │
│    • Nombre del centro: [Input]                 │
│    • Código de centro: [Input]                 │
│    • Tipo: [Universidad, FP, Instituto, etc.]   │
│    • Dirección: [Input]                        │
│    • Sitio web: [Input]                        │
│                                                 │
│    Programas que ofrece:                        │
│    • [Multi-select de programas formativos]     │
│    • [+ Agregar programa personalizado]         │
│                                                 │
│    [Crear mi perfil] [← Volver]                 │
└─────────────────────────────────────────────────┘
```

### **4. Confirmación y Onboarding**
```
┌─────────────────────────────────────────────────┐
│    ✅ ¡Perfil creado exitosamente!             │
│                                                 │
│    👨‍🎓 Tu perfil de estudiante está listo      │
│                                                 │
│    🚀 Próximos pasos:                           │
│    • Completa tu CV                             │
│    • Explora ofertas disponibles               │
│    • Configura alertas de trabajo              │
│                                                 │
│    💡 ¿Sabías que puedes agregar más perfiles? │
│    Si también tienes una empresa o trabajas     │
│    en un centro de estudios, puedes agregar    │
│    esos perfiles a tu cuenta.                  │
│                                                 │
│    [Ir a mi dashboard] [Agregar otro perfil]   │
└─────────────────────────────────────────────────┘
```

### **5. Funcionalidad de Multi-Perfil**
```
┌─────────────────────────────────────────────────┐
│    Configuración de cuenta                      │
│                                                 │
│    👤 Tus perfiles activos:                     │
│    • 👨‍🎓 Estudiante - María García             │
│    • 🏢 Empresa - Innovatech Solutions         │
│                                                 │
│    [+ Agregar nuevo perfil]                     │
│                                                 │
│    🔄 Cambiar entre perfiles:                   │
│    El selector de rol te permite cambiar        │
│    rápidamente entre tus diferentes perfiles    │
│    sin cerrar sesión.                           │
│                                                 │
│    [Cambiar perfil] [Configurar cuenta]         │
└─────────────────────────────────────────────────┘
```

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Modelo de Datos**
```typescript
interface User {
  id: string;
  email: string;
  socialAccounts: {
    google?: SocialAccount;
    facebook?: SocialAccount;
  };
  profiles: UserProfile[];
  activeProfileId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface UserProfile {
  id: string;
  type: 'student' | 'company' | 'center';
  name: string;
  data: StudentData | CompanyData | CenterData;
  isActive: boolean;
  createdAt: Date;
}

interface StudentData {
  program: string;
  studyCenter: string;
  graduationDate: Date;
  preferences: {
    jobTypes: string[];
    locations: string[];
    industries: string[];
  };
}

interface CompanyData {
  companyName: string;
  cif: string;
  sector: string;
  size: string;
  address: string;
  website?: string;
  subscription: 'basic' | 'premium';
}

interface CenterData {
  centerName: string;
  centerCode: string;
  type: string;
  address: string;
  website?: string;
  programs: string[];
}
```

### **Rutas del Flujo**
```
/auth/login - Página de login/registro
/auth/social-callback - Callback de redes sociales
/auth/profile-selection - Selección de tipo de perfil
/auth/complete-profile/student - Formulario estudiante
/auth/complete-profile/company - Formulario empresa  
/auth/complete-profile/center - Formulario centro
/auth/confirmation - Confirmación y onboarding
/dashboard - Dashboard multi-rol
/settings/profiles - Gestión de perfiles múltiples
```

## 🎯 **BENEFICIOS DE ESTE ENFOQUE**

1. **Experiencia Clara**: El usuario sabe exactamente qué está creando
2. **Datos Específicos**: Recolecta información relevante desde el inicio  
3. **Flexibilidad**: Permite múltiples perfiles por usuario
4. **Escalabilidad**: Fácil agregar nuevos tipos de perfil
5. **Onboarding Dirigido**: Cada rol tiene su propio flujo de bienvenida

## 🚀 **PRÓXIMOS PASOS**

1. Implementar páginas del flujo de registro
2. Integrar con proveedores de OAuth (Google, Facebook)
3. Crear formularios específicos por rol
4. Implementar sistema de multi-perfil
5. Añadir onboarding y tutoriales por rol

¿Te parece bien este enfoque? ¿Quieres que implemente alguna parte específica?
