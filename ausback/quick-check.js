// Script simplificado para reiniciar el servidor y probar el flujo
import { User, Company, Student, Offer, Application } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function resetAndTest() {
    console.log('🔄 Reiniciando el servidor y probando el flujo...\n');
    
    try {
        // 1. Matar el servidor actual
        console.log('1. Reiniciando servidor...');
        
        // 2. Verificar conexión a la base de datos
        console.log('2. Verificando conexión a la base de datos...');
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');
        
        // 3. Verificar datos existentes
        console.log('3. Verificando datos existentes...');
        
        const users = await User.findAll({ limit: 5 });
        const companies = await Company.findAll({ limit: 5 });
        const students = await Student.findAll({ limit: 5 });
        const offers = await Offer.findAll({ limit: 5 });
        const applications = await Application.findAll({ limit: 5 });
        
        console.log(`- Usuarios: ${users.length}`);
        console.log(`- Empresas: ${companies.length}`);
        console.log(`- Estudiantes: ${students.length}`);
        console.log(`- Ofertas: ${offers.length}`);
        console.log(`- Aplicaciones: ${applications.length}\n`);
        
        // 4. Verificar usuarios de prueba
        console.log('4. Verificando usuarios de prueba...');
        const studentUser = await User.findOne({ where: { email: 'student@example.com' } });
        const companyUser = await User.findOne({ where: { email: 'company@example.com' } });
        
        if (studentUser) {
            console.log('✅ Usuario estudiante encontrado');
            const student = await Student.findOne({ where: { userId: studentUser.id } });
            console.log(`   - Perfil de estudiante: ${student ? 'Sí' : 'No'}`);
        } else {
            console.log('❌ Usuario estudiante no encontrado');
        }
        
        if (companyUser) {
            console.log('✅ Usuario empresa encontrado');
            const company = await Company.findOne({ where: { userId: companyUser.id } });
            console.log(`   - Perfil de empresa: ${company ? 'Sí' : 'No'}`);
        } else {
            console.log('❌ Usuario empresa no encontrado');
        }
        
        // 5. Verificar ofertas con empresa
        console.log('\n5. Verificando ofertas con empresa...');
        const offersWithCompany = await Offer.findAll({
            include: [{ model: Company }],
            limit: 3
        });
        
        console.log(`Ofertas con empresa: ${offersWithCompany.length}`);
        offersWithCompany.forEach(offer => {
            console.log(`   - ${offer.name} -> ${offer.Company ? offer.Company.name : 'Sin empresa'}`);
        });
        
        console.log('\n✅ Verificación completada. El servidor debería estar listo para pruebas.');
        
    } catch (error) {
        console.error('❌ Error en la verificación:', error.message);
        throw error;
    }
}

// Ejecutar la verificación
resetAndTest()
    .then(() => {
        console.log('\n🎉 Servidor listo para pruebas');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });
