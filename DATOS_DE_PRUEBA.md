# Datos de Prueba - Base de Datos Ausbildung

## 📅 Creado: 4 de Julio, 2025

Se ha ejecutado exitosamente el seed de la base de datos con los siguientes datos de prueba:

## 📊 Resumen de Registros Creados

- **👥 Usuarios**: 6 registros
- **🏢 Empresas**: 4 registros  
- **🏫 Centros de Estudios**: 3 registros
- **💼 Ofertas de Prácticas**: 4 registros
- **🎓 Estudiantes**: 3 registros
- **📚 Familias Profesionales**: 5 registros
- **👨‍🏫 Tutores**: 3 registros

## 🔧 Endpoints Disponibles

### ✅ Endpoints Públicos (No requieren autenticación)
- `GET /api/offers` - Lista todas las ofertas de prácticas
- `GET /api/scenter` - Lista todos los centros de estudios
- `GET /api/profamilies` - Lista todas las familias profesionales

### 🔒 Endpoints Protegidos (Requieren autenticación)
- `GET /api/company` - Lista todas las empresas
- `GET /api/users` - Lista todos los usuarios
- `GET /api/student` - Lista todos los estudiantes

### 🛠️ Endpoints de Desarrollo
- `POST /api/dev/seed` - Ejecuta el seed de la base de datos
- `GET /api/dev/status` - Verifica el estado de la base de datos

## 📝 Usuarios de Prueba Creados

### Administradores
- **admin@ausbildung.com** - Administrador del sistema
- **test@ausbildung.com** - Usuario de prueba

### Usuarios de Empresa
- **rrhh@techinnova.com** - Tech Innova Solutions
- **practicas@consultoriabcn.es** - Consultoría Barcelona
- **recursos@healthcare.es** - HealthCare Valencia
- **talento@marketingpro.es** - Marketing Digital Pro

## 🏢 Empresas de Prueba

1. **Tech Innova Solutions** (TECH001)
   - Sector: Tecnología
   - Ubicación: Madrid
   - Contacto: Juan García

2. **Consultoría Barcelona** (CONS002)
   - Sector: Consultoría
   - Ubicación: Barcelona
   - Contacto: Pedro Martinez

3. **HealthCare Valencia** (HEAL003)
   - Sector: Sanidad
   - Ubicación: Valencia
   - Contacto: Ana López

4. **Marketing Digital Pro** (MARK004)
   - Sector: Marketing
   - Ubicación: Sevilla
   - Contacto: Carlos Ruiz

## 🏫 Centros de Estudios

1. **IES Tecnológico Madrid** (IES001)
   - Ubicación: Madrid
   - Especialidad: Tecnología

2. **Centro FP Barcelona** (CFP002)
   - Ubicación: Barcelona
   - Especialidad: Formación Profesional

3. **Instituto Valencia** (INS003)
   - Ubicación: Valencia
   - Especialidad: Multidisciplinar

## 💼 Ofertas de Prácticas

1. **Prácticas Desarrollo Frontend**
   - Empresa: Tech Innova Solutions
   - Ubicación: Madrid
   - Duración: 6 meses
   - Modalidad: Presencial

2. **Prácticas Marketing Digital**
   - Empresa: Marketing Digital Pro
   - Ubicación: Barcelona
   - Duración: 4 meses
   - Modalidad: Híbrido

3. **Prácticas Administración**
   - Empresa: Consultoría Barcelona
   - Ubicación: Barcelona
   - Duración: 5 meses
   - Modalidad: Presencial

4. **Prácticas Auxiliar Sanitario**
   - Empresa: HealthCare Valencia
   - Ubicación: Valencia
   - Duración: 6 meses
   - Modalidad: Presencial

## 🎓 Estudiantes

1. **Juan Pérez** (EST001)
   - Email: juan.perez@student.edu
   - Especialidad: Informática

2. **María González** (EST002)
   - Email: maria.gonzalez@student.edu
   - Especialidad: Administración

3. **Carlos López** (EST003)
   - Email: carlos.lopez@student.edu
   - Especialidad: Marketing

## 📚 Familias Profesionales

1. **Informática y Comunicaciones**
   - Desarrollo de software, redes, sistemas informáticos

2. **Administración y Gestión**
   - Gestión empresarial, contabilidad, recursos humanos

3. **Comercio y Marketing**
   - Ventas, marketing digital, comercio internacional

4. **Sanidad**
   - Auxiliar de enfermería, farmacia, laboratorio

5. **Servicios Socioculturales**
   - Educación infantil, integración social, animación

## 👨‍🏫 Tutores

1. **Carmen Fernández** (TUT001)
   - Email: carmen.fernandez@ies001.edu
   - Especialidad: Ingeniería Informática

2. **Roberto Silva** (TUT002)
   - Email: roberto.silva@ies002.edu
   - Especialidad: Administración de Empresas

3. **Laura Morales** (TUT003)
   - Email: laura.morales@ies003.edu
   - Especialidad: Marketing Digital

## 🔍 Cómo Probar

### Desde el Frontend
1. Ir a `http://localhost:3001/test` para ver el panel de pruebas
2. Navegar a `http://localhost:3001/ofertas` para ver las ofertas
3. Navegar a `http://localhost:3001/centros` para ver los centros

### Desde API (Postman/curl)
```bash
# Probar ofertas
curl -X GET "http://localhost:5000/api/offers"

# Probar centros
curl -X GET "http://localhost:5000/api/scenter"

# Verificar estado de la base de datos
curl -X GET "http://localhost:5000/api/dev/status"
```

### Regenerar Datos
Si necesitas regenerar los datos:
```bash
curl -X POST "http://localhost:5000/api/dev/seed"
```

## ⚠️ Notas Importantes

1. **Base de Datos**: Los datos se recrean completamente cada vez que se ejecuta el seed (force: true)
2. **Contraseñas**: Todas las contraseñas están hasheadas con bcrypt
3. **Emails**: Los emails son únicos por usuario
4. **IDs**: Los IDs de tutores son strings (TUT001, TUT002, etc.)
5. **Relaciones**: Se mantienen las relaciones entre tablas según los modelos

## 📊 Estado Actual

✅ **Seed Ejecutado**: Sí  
✅ **Datos Disponibles**: Sí  
✅ **Endpoints Funcionando**: Sí  
✅ **Frontend Conectado**: Sí  

La base de datos está lista para pruebas completas del sistema.
