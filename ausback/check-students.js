// Script para verificar estudiantes en la base de datos
const { Student, User } = require('./src/models/relations.js');

async function checkStudents() {
    try {
        console.log('🔍 Verificando estudiantes en la base de datos...\n');
        
        // Buscar todos los estudiantes
        const students = await Student.findAll({
            include: [{
                model: User,
                attributes: ['id', 'username', 'email', 'role']
            }]
        });
        
        console.log(`📊 Total de estudiantes encontrados: ${students.length}\n`);
        
        if (students.length > 0) {
            console.log('👥 Lista de estudiantes:');
            students.forEach(student => {
                console.log(`- ID: ${student.id}, UserID: ${student.userId}, User: ${student.User?.username || 'N/A'} (${student.User?.email || 'N/A'})`);
            });
        }
        
        // Buscar específicamente el usuario ID 1
        console.log('\n🔍 Verificando usuario ID 1...');
        const user1 = await User.findByPk(1);
        
        if (user1) {
            console.log(`👤 Usuario ID 1 encontrado: ${user1.username} (${user1.email}) - Rol: ${user1.role}`);
            
            // Buscar si existe un perfil de estudiante para el usuario 1
            const student1 = await Student.findOne({ where: { userId: 1 } });
            if (student1) {
                console.log(`✅ Perfil de estudiante encontrado para usuario 1: ID ${student1.id}`);
            } else {
                console.log(`❌ NO existe perfil de estudiante para usuario 1`);
            }
        } else {
            console.log('❌ Usuario ID 1 NO encontrado');
        }
        
        // Buscar todos los usuarios con rol 'student'
        console.log('\n🔍 Verificando usuarios con rol "student"...');
        const studentUsers = await User.findAll({
            where: { role: 'student' },
            attributes: ['id', 'username', 'email', 'role']
        });
        
        console.log(`📊 Usuarios con rol student: ${studentUsers.length}`);
        studentUsers.forEach(user => {
            console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkStudents();