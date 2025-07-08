// Script para resetear la base de datos usando sync force

import { User, Company, Student, Offer, Application, Profamily } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import { encriptar } from './src/common/bcrypt.js';

async function resetDatabase() {
    console.log('🔄 RESETEANDO BASE DE DATOS CON SYNC FORCE...\n');
    
    try {
        // 1. Crear todas las tablas (force: true las recreará)
        console.log('1. Recreando tablas con el esquema correcto...');
        await sequelize.sync({ force: true });
        console.log('✅ Tablas recreadas\n');
        
        // 2. Crear familia profesional básica
        console.log('2. Creando familia profesional...');
        const profamily = await Profamily.create({
            name: 'Informática y Comunicaciones',
            description: 'Familia profesional relacionada con tecnología'
        });
        console.log('✅ Familia profesional creada\n');
        
        // 3. Crear usuarios de prueba
        console.log('3. Creando usuarios de prueba...');
        
        // Usuario estudiante
        const studentUser = await User.create({
            username: 'student_user',
            email: 'student@example.com',
            password: await encriptar('password123'),
            role: 'student',
            name: 'Juan',
            surname: 'Pérez',
            phone: '123456789',
            description: 'Estudiante de informática',
            active: true
        });
        
        // Usuario empresa 1
        const companyUser1 = await User.create({
            username: 'company_user1',
            email: 'company1@example.com',
            password: await encriptar('password123'),
            role: 'company',
            name: 'María',
            surname: 'García',
            phone: '987654321',
            description: 'Representante de empresa',
            active: true
        });
        
        // Usuario empresa 2
        const companyUser2 = await User.create({
            username: 'company_user2',
            email: 'company2@example.com',
            password: await encriptar('password123'),
            role: 'company',
            name: 'Carlos',
            surname: 'López',
            phone: '456789123',
            description: 'Representante de empresa',
            active: true
        });
        
        console.log('✅ Usuarios creados\n');
        
        // 4. Crear perfiles de estudiante y empresa
        console.log('4. Creando perfiles...');
        
        // Perfil estudiante
        const student = await Student.create({
            grade: 'Superior',
            course: 'Desarrollo de Aplicaciones Web',
            double: false,
            car: true,
            active: true,
            tag: 'frontend,backend,javascript',
            description: 'Estudiante motivado con ganas de aprender',
            disp: new Date('2024-03-01'),
            userId: studentUser.id,
            profamilyId: profamily.id
        });
        
        // Empresa 1
        const company1 = await Company.create({
            name: 'TechSolutions España',
            code: 'TECH001',
            city: 'Madrid',
            active: true,
            address: 'Calle Gran Vía, 123',
            phone: '915555001',
            email: 'info@techsolutions.es',
            web: 'https://techsolutions.es',
            rrhh: 'rrhh@techsolutions.es',
            sector: 'Tecnología',
            main: 'Desarrollo de software',
            description: 'Empresa líder en soluciones tecnológicas',
            userId: companyUser1.id
        });
        
        // Empresa 2
        const company2 = await Company.create({
            name: 'InnovateLab',
            code: 'INNO001',
            city: 'Barcelona',
            active: true,
            address: 'Passeig de Gràcia, 456',
            phone: '935555002',
            email: 'info@innovatelab.es',
            web: 'https://innovatelab.es',
            rrhh: 'rrhh@innovatelab.es',
            sector: 'Consultoría',
            main: 'Consultoría IT',
            description: 'Laboratorio de innovación tecnológica',
            userId: companyUser2.id
        });
        
        console.log('✅ Perfiles creados\n');
        
        // 5. Crear ofertas de prueba
        console.log('5. Creando ofertas de prueba...');
        
        const offer1 = await Offer.create({
            name: 'Prácticas Desarrollo Frontend',
            location: 'Madrid',
            mode: 'Presencial',
            type: 'Prácticas',
            period: '6 meses',
            schedule: 'Mañana',
            min_hr: 300,
            car: false,
            sector: 'Tecnología',
            tag: 'React, JavaScript, CSS',
            description: 'Prácticas en desarrollo frontend con React',
            jobs: 'Desarrollar interfaces de usuario modernas',
            requisites: 'Conocimientos básicos de JavaScript y React',
            profamilyId: profamily.id,
            companyId: company1.id
        });
        
        const offer2 = await Offer.create({
            name: 'Prácticas Desarrollo Backend',
            location: 'Barcelona',
            mode: 'Híbrido',
            type: 'Prácticas',
            period: '6 meses',
            schedule: 'Tarde',
            min_hr: 350,
            car: false,
            sector: 'Tecnología',
            tag: 'Node.js, Python, Bases de datos',
            description: 'Prácticas en desarrollo backend con Node.js',
            jobs: 'Desarrollar APIs y servicios backend',
            requisites: 'Conocimientos básicos de programación',
            profamilyId: profamily.id,
            companyId: company2.id
        });
        
        const offer3 = await Offer.create({
            name: 'Analista de Sistemas',
            location: 'Madrid',
            mode: 'Presencial',
            type: 'Prácticas',
            period: '4 meses',
            schedule: 'Mañana',
            min_hr: 250,
            car: true,
            sector: 'Consultoría',
            tag: 'Análisis, Documentación, SQL',
            description: 'Prácticas en análisis de sistemas',
            jobs: 'Analizar y documentar sistemas existentes',
            requisites: 'Capacidad analítica y conocimientos de SQL',
            profamilyId: profamily.id,
            companyId: company1.id
        });
        
        console.log('✅ Ofertas creadas\n');
        
        // 6. Verificar que todo esté correcto
        console.log('6. Verificando integridad de datos...');
        
        const users = await User.findAll();
        const companies = await Company.findAll({ include: [User] });
        const students = await Student.findAll({ include: [User] });
        const offers = await Offer.findAll({ include: [Company, Profamily] });
        
        console.log('📊 RESUMEN DE DATOS CREADOS:');
        console.log('=============================');
        console.log(`✅ Usuarios: ${users.length}`);
        console.log(`   - Estudiantes: ${users.filter(u => u.role === 'student').length}`);
        console.log(`   - Empresas: ${users.filter(u => u.role === 'company').length}`);
        console.log(`✅ Empresas: ${companies.length}`);
        console.log(`✅ Estudiantes: ${students.length}`);
        console.log(`✅ Ofertas: ${offers.length}`);
        console.log(`✅ Familias profesionales: 1`);
        
        // Verificar relaciones
        console.log('\n🔗 VERIFICACIÓN DE RELACIONES:');
        console.log('==============================');
        
        for (const company of companies) {
            console.log(`Empresa "${company.name}" - Usuario: ${company.User ? company.User.email : 'ERROR'}`);
        }
        
        for (const student of students) {
            console.log(`Estudiante "${student.User ? student.User.name : 'ERROR'}" - Email: ${student.User ? student.User.email : 'ERROR'}`);
        }
        
        for (const offer of offers) {
            console.log(`Oferta "${offer.name}" - Empresa: ${offer.Company ? offer.Company.name : 'ERROR'}`);
        }
        
        console.log('\n🎉 ¡BASE DE DATOS RESETEADA Y CONFIGURADA CORRECTAMENTE!');
        console.log('\n📝 CREDENCIALES DE PRUEBA:');
        console.log('==========================');
        console.log('Estudiante:');
        console.log('  Email: student@example.com');
        console.log('  Password: password123');
        console.log('');
        console.log('Empresa 1:');
        console.log('  Email: company1@example.com');
        console.log('  Password: password123');
        console.log('');
        console.log('Empresa 2:');
        console.log('  Email: company2@example.com');
        console.log('  Password: password123');
        
    } catch (error) {
        console.error('❌ Error reseteando la base de datos:', error);
        throw error;
    }
}

// Ejecutar el reset
resetDatabase()
    .then(() => {
        console.log('\n✅ Proceso completado exitosamente');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error durante el proceso:', error);
        process.exit(1);
    });
