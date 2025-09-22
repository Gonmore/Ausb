// Script para crear el perfil de estudiante faltante para usuario ID 1
import { Student, User, Profamily } from './src/models/relations.js';

async function fixStudentProfile() {
    try {
        console.log('🔧 Creando perfil de estudiante para usuario ID 1...\n');
        
        // Verificar que el usuario existe
        const user = await User.findByPk(1);
        if (!user) {
            console.log('❌ Usuario ID 1 no encontrado');
            process.exit(1);
        }
        
        console.log(`✅ Usuario encontrado: ${user.username} (${user.email})`);
        
        // Verificar si ya existe un perfil de estudiante
        const existingStudent = await Student.findOne({ where: { userId: 1 } });
        if (existingStudent) {
            console.log('✅ El perfil de estudiante ya existe');
            process.exit(0);
        }
        
        // Obtener una profamilia por defecto (Informática y Comunicaciones)
        const profamily = await Profamily.findOne({ where: { name: 'Informática y Comunicaciones' } });
        if (!profamily) {
            console.log('❌ No se encontró la profamilia por defecto');
            process.exit(1);
        }
        
        // Crear el perfil de estudiante
        const studentData = {
            userId: 1,
            grade: 'Licenciatura',
            course: 'Ingeniería de Sistemas',
            double: false,
            car: false,
            active: true,
            tag: 'frontend',
            description: 'Estudiante de sistemas interesado en desarrollo frontend',
            disp: '2025-09-21', // Fecha de disponibilidad (DATEONLY format)
            profamilyId: profamily.id
        };
        
        const newStudent = await Student.create(studentData);
        
        console.log('✅ Perfil de estudiante creado exitosamente:');
        console.log(`   - ID: ${newStudent.id}`);
        console.log(`   - UserID: ${newStudent.userId}`);
        console.log(`   - Grade: ${newStudent.grade}`);
        console.log(`   - Course: ${newStudent.course}`);
        console.log(`   - Profamily: ${profamily.name}`);
        
        console.log('\n🎉 ¡El usuario ahora puede aplicar a ofertas!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixStudentProfile();