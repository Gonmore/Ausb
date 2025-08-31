import bcrypt from 'bcrypt';
import sequelize from './src/database/database.js';

// Importar modelos con los nombres correctos de archivo
import { User } from './src/models/users.js';
import { Student } from './src/models/student.js';
import { Profamily } from './src/models/profamily.js';

// Importar relaciones para que se establezcan correctamente
import './src/models/relations.js';

// Configuración del seed
const SEED_OPTIONS = {
  UPDATE_EXISTING: true, // Cambiar a false para solo crear nuevos
  FORCE_UPDATE: false    // Cambiar a true para forzar actualización de contraseñas
};

const studentsData = [
  {
    user: {
      username: 'carlos.garcia',
      name: 'Carlos',
      surname: 'García López',
      email: 'carlos.garcia@estudios.com',
      phone: '+34 612 345 678',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Desarrollo de Aplicaciones Web',
      car: true,
      tag: 'JavaScript, React, Node.js, HTML, CSS',
      disp: '2025-03-01',
      description: 'Estudiante motivado con experiencia en desarrollo web'
    }
  },
  {
    user: {
      username: 'maria.rodriguez',
      name: 'María',
      surname: 'Rodríguez Sánchez',
      email: 'maria.rodriguez@estudios.com',
      phone: '+34 623 456 789',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Desarrollo de Aplicaciones Multiplataforma',
      car: false,
      tag: 'Java, Python, Android, SQL',
      disp: '2025-02-15',
      description: 'Especializada en desarrollo móvil y bases de datos'
    }
  },
  {
    user: {
      username: 'ana.martinez',
      name: 'Ana',
      surname: 'Martínez González',
      email: 'ana.martinez@estudios.com',
      phone: '+34 634 567 890',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Administración de Sistemas Informáticos',
      car: true,
      tag: 'Linux, Windows Server, Redes, Virtualización',
      disp: '2025-03-15',
      description: 'Experta en administración de sistemas y redes'
    }
  },
  {
    user: {
      username: 'diego.lopez',
      name: 'Diego',
      surname: 'López Fernández',
      email: 'diego.lopez@estudios.com',
      phone: '+34 645 678 901',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Administración y Finanzas',
      car: false,
      tag: 'Contabilidad, Excel, SAP, Gestión',
      disp: '2025-02-20',
      description: 'Conocimientos sólidos en gestión empresarial y finanzas'
    }
  },
  {
    user: {
      username: 'laura.ruiz',
      name: 'Laura',
      surname: 'Ruiz Moreno',
      email: 'laura.ruiz@estudios.com',
      phone: '+34 656 789 012',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Marketing y Publicidad',
      car: true,
      tag: 'Marketing Digital, Redes Sociales, Diseño, Photoshop',
      disp: '2025-03-10',
      description: 'Creativa con experiencia en marketing digital y diseño'
    }
  },
  {
    user: {
      username: 'javier.jimenez',
      name: 'Javier',
      surname: 'Jiménez Herrera',
      email: 'javier.jimenez@estudios.com',
      phone: '+34 667 890 123',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Técnico en Cuidados Auxiliares de Enfermería',
      car: false,
      tag: 'Primeros Auxilios, Atención Paciente, Higiene',
      disp: '2025-02-10',
      description: 'Vocación de servicio y experiencia en atención sanitaria'
    }
  },
  {
    user: {
      username: 'elena.vazquez',
      name: 'Elena',
      surname: 'Vázquez Castillo',
      email: 'elena.vazquez@estudios.com',
      phone: '+34 678 901 234',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Diseño Gráfico y Multimedia',
      car: true,
      tag: 'Photoshop, Illustrator, After Effects, UX/UI',
      disp: '2025-03-05',
      description: 'Diseñadora con portfolio en proyectos multimedia'
    }
  },
  {
    user: {
      username: 'roberto.morales',
      name: 'Roberto',
      surname: 'Morales Peña',
      email: 'roberto.morales@estudios.com',
      phone: '+34 689 012 345',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Desarrollo de Aplicaciones Web',
      car: false,
      tag: 'Vue.js, Angular, TypeScript, MongoDB',
      disp: '2025-02-25',
      description: 'Desarrollador full-stack con proyectos personales'
    }
  },
  {
    user: {
      username: 'carmen.torres',
      name: 'Carmen',
      surname: 'Torres Silva',
      email: 'carmen.torres@estudios.com',
      phone: '+34 690 123 456',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Integración Social',
      car: true,
      tag: 'Trabajo Social, Psicología, Mediación',
      disp: '2025-03-20',
      description: 'Comprometida con la inclusión social y el trabajo comunitario'
    }
  },
  {
    user: {
      username: 'francisco.herrera',
      name: 'Francisco',
      surname: 'Herrera Ramos',
      email: 'francisco.herrera@estudios.com',
      phone: '+34 601 234 567',
      password: 'password123',
      role: 'student'
    },
    student: {
      grade: 'Grado Superior',
      course: 'Ciberseguridad',
      car: false,
      tag: 'Ethical Hacking, Pentesting, Redes, Seguridad',
      disp: '2025-02-28',
      description: 'Especialista en seguridad informática y ethical hacking'
    }
  }
];

async function seedStudents() {
  try {
    console.log('🌱 Iniciando seed de estudiantes...');
    console.log(`⚙️ Configuración: Actualizar existentes = ${SEED_OPTIONS.UPDATE_EXISTING}`);

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;

    for (const studentData of studentsData) {
      try {
        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({
          where: { email: studentData.user.email },
          include: [Student]
        });

        if (existingUser) {
          if (SEED_OPTIONS.UPDATE_EXISTING) {
            console.log(`🔄 Actualizando usuario ${studentData.user.email}...`);
            
            // Actualizar datos del usuario (sin cambiar la contraseña a menos que se fuerce)
            const updateData = { ...studentData.user };
            if (!SEED_OPTIONS.FORCE_UPDATE) {
              delete updateData.password; // No actualizar contraseña por defecto
            } else {
              updateData.password = await bcrypt.hash(studentData.user.password, 10);
            }
            
            await existingUser.update(updateData);

            // Actualizar o crear datos del estudiante
            if (existingUser.Student) {
              await existingUser.Student.update({
                ...studentData.student,
                userId: existingUser.id
              });
              console.log(`✏️ Estudiante ${studentData.user.name} ${studentData.user.surname} actualizado`);
            } else {
              // Crear registro de estudiante si no existe
              await Student.create({
                ...studentData.student,
                userId: existingUser.id
              });
              console.log(`➕ Perfil de estudiante creado para ${studentData.user.name} ${studentData.user.surname}`);
            }
            
            updatedCount++;
          } else {
            console.log(`⚠️ Usuario ${studentData.user.email} ya existe, saltando...`);
            skippedCount++;
          }
          continue;
        }

        // Crear nuevo usuario si no existe
        const hashedPassword = await bcrypt.hash(studentData.user.password, 10);
        const user = await User.create({
          ...studentData.user,
          password: hashedPassword
        });

        // Crear estudiante
        await Student.create({
          ...studentData.student,
          userId: user.id
        });

        console.log(`✅ Estudiante ${studentData.user.name} ${studentData.user.surname} creado`);
        createdCount++;

      } catch (userError) {
        console.error(`❌ Error procesando estudiante ${studentData.user.name}:`, userError.message);
        if (userError.sql) {
          console.error('SQL Error:', userError.sql);
        }
      }
    }

    console.log('\n🎉 ¡Seed de estudiantes completado!');
    console.log(`📊 Resumen:`);
    console.log(`   ✅ Creados: ${createdCount}`);
    console.log(`   ✏️ Actualizados: ${updatedCount}`);
    console.log(`   ⚠️ Saltados: ${skippedCount}`);
    
    // Mostrar total de estudiantes en la base de datos
    const totalStudents = await Student.count();
    console.log(`📚 Total de estudiantes en la base de datos: ${totalStudents}`);

  } catch (error) {
    console.error('❌ Error en seed de estudiantes:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente - ajustado para Windows
const isMainModule = import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`;
if (isMainModule) {
  seedStudents()
    .then(() => {
      console.log('✅ Proceso completado exitosamente');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

export { seedStudents };