// Script para popular las relaciones faltantes
import { User, Company, Student, Offer, Application } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function populateRelations() {
    console.log('🔗 Populando relaciones faltantes...\n');
    
    try {
        // 1. Asociar empresas con usuarios
        console.log('1. Asociando empresas con usuarios...');
        const companiesWithoutUser = await Company.findAll({ where: { userId: null } });
        console.log(`Empresas sin usuario: ${companiesWithoutUser.length}`);
        
        for (const company of companiesWithoutUser) {
            // Buscar un usuario tipo company que no tenga empresa asociada
            const companyUser = await User.findOne({
                where: { role: 'company' },
                include: [{ model: Company, required: false }]
            });
            
            if (companyUser && !companyUser.Company) {
                await company.update({ userId: companyUser.id });
                console.log(`✅ Empresa "${company.name}" asociada con usuario ${companyUser.email}`);
            } else {
                // Crear un usuario para esta empresa
                const newUser = await User.create({
                    username: company.name.toLowerCase().replace(/\s+/g, ''),
                    email: `${company.name.toLowerCase().replace(/\s+/g, '')}@empresa.com`,
                    password: '$2b$10$dummy.hash.for.company',
                    role: 'company',
                    name: company.name,
                    active: true
                });
                await company.update({ userId: newUser.id });
                console.log(`✅ Nuevo usuario creado y asociado con empresa "${company.name}"`);
            }
        }
        
        // 2. Asociar estudiantes con usuarios
        console.log('\n2. Asociando estudiantes con usuarios...');
        const studentsWithoutUser = await Student.findAll({ where: { userId: null } });
        console.log(`Estudiantes sin usuario: ${studentsWithoutUser.length}`);
        
        for (const student of studentsWithoutUser) {
            // Buscar un usuario tipo student que no tenga estudiante asociado
            const studentUser = await User.findOne({
                where: { role: 'student' },
                include: [{ model: Student, required: false }]
            });
            
            if (studentUser && !studentUser.Student) {
                await student.update({ userId: studentUser.id });
                console.log(`✅ Estudiante asociado con usuario ${studentUser.email}`);
            } else {
                // Crear un usuario para este estudiante
                const newUser = await User.create({
                    username: `student${student.id}`,
                    email: `student${student.id}@ejemplo.com`,
                    password: '$2b$10$dummy.hash.for.student',
                    role: 'student',
                    name: `Estudiante ${student.id}`,
                    active: true
                });
                await student.update({ userId: newUser.id });
                console.log(`✅ Nuevo usuario creado y asociado con estudiante ID ${student.id}`);
            }
        }
        
        // 3. Asociar ofertas con empresas
        console.log('\n3. Asociando ofertas con empresas...');
        const offersWithoutCompany = await Offer.findAll({ where: { companyId: null } });
        console.log(`Ofertas sin empresa: ${offersWithoutCompany.length}`);
        
        const companies = await Company.findAll();
        let companyIndex = 0;
        
        for (const offer of offersWithoutCompany) {
            if (companies.length > 0) {
                const company = companies[companyIndex % companies.length];
                await offer.update({ companyId: company.id });
                console.log(`✅ Oferta "${offer.name}" asociada con empresa "${company.name}"`);
                companyIndex++;
            }
        }
        
        // 4. Verificar aplicaciones
        console.log('\n4. Verificando aplicaciones...');
        const applications = await Application.findAll({
            include: [
                { model: Offer, include: [Company] },
                { model: Student },
                { model: Company }
            ]
        });
        
        console.log(`Aplicaciones encontradas: ${applications.length}`);
        
        for (const app of applications) {
            if (!app.companyId && app.Offer && app.Offer.Company) {
                await app.update({ companyId: app.Offer.Company.id });
                console.log(`✅ Aplicación ${app.id} actualizada con companyId`);
            }
        }
        
        // 5. Verificar estado final
        console.log('\n5. Verificando estado final...');
        
        const allUsers = await User.findAll();
        const allCompanies = await Company.findAll({ include: [User] });
        const allStudents = await Student.findAll({ include: [User] });
        const allOffers = await Offer.findAll({ include: [Company] });
        
        console.log(`\n📊 Estado final:`);
        console.log(`- Usuarios totales: ${allUsers.length}`);
        console.log(`- Empresas con usuario: ${allCompanies.filter(c => c.User).length}/${allCompanies.length}`);
        console.log(`- Estudiantes con usuario: ${allStudents.filter(s => s.User).length}/${allStudents.length}`);
        console.log(`- Ofertas con empresa: ${allOffers.filter(o => o.Company).length}/${allOffers.length}`);
        
        console.log('\n✅ Relaciones populadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error populando relaciones:', error.message);
        throw error;
    }
}

// Ejecutar
populateRelations()
    .then(() => {
        console.log('\n🎉 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });
