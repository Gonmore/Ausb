// Script para corregir el esquema de la base de datos y migrar datos
import { User, Company, Student, Offer, Application } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function fixDatabaseSchema() {
    console.log('🔧 Iniciando corrección del esquema de la base de datos...\n');
    
    try {
        // 1. Sincronizar modelos con la base de datos (esto agregará las columnas faltantes)
        console.log('1. Sincronizando modelos con la base de datos...');
        await sequelize.sync({ alter: true });
        console.log('✅ Modelos sincronizados\n');
        
        // 2. Verificar y corregir datos huérfanos
        console.log('2. Verificando datos huérfanos...');
        
        // Verificar usuarios sin compañía/estudiante
        const usersWithoutProfile = await User.findAll({
            include: [
                { model: Company, required: false },
                { model: Student, required: false }
            ]
        });
        
        console.log(`Usuarios encontrados: ${usersWithoutProfile.length}`);
        
        for (const user of usersWithoutProfile) {
            if (user.role === 'company' && !user.Company) {
                console.log(`⚠️  Usuario empresa sin perfil: ${user.email}`);
                // Crear empresa básica
                await Company.create({
                    name: user.name || 'Empresa Sin Nombre',
                    code: 'TEMP',
                    address: 'Dirección por definir',
                    phone: '000000000',
                    userId: user.id
                });
                console.log(`✅ Empresa creada para usuario ${user.email}`);
            }
            
            if (user.role === 'student' && !user.Student) {
                console.log(`⚠️  Usuario estudiante sin perfil: ${user.email}`);
                // Crear estudiante básico
                await Student.create({
                    grade: 'Por definir',
                    course: 'Por definir',
                    disp: new Date(),
                    userId: user.id
                });
                console.log(`✅ Estudiante creado para usuario ${user.email}`);
            }
        }
        
        // 3. Verificar ofertas sin compañía
        console.log('\n3. Verificando ofertas sin compañía...');
        const offersWithoutCompany = await Offer.findAll({
            where: { companyId: null }
        });
        
        console.log(`Ofertas sin compañía: ${offersWithoutCompany.length}`);
        
        if (offersWithoutCompany.length > 0) {
            // Buscar la primera empresa disponible
            const firstCompany = await Company.findOne();
            
            if (firstCompany) {
                console.log(`Asignando ofertas huérfanas a la empresa: ${firstCompany.name}`);
                
                for (const offer of offersWithoutCompany) {
                    await offer.update({ companyId: firstCompany.id });
                    console.log(`✅ Oferta "${offer.name}" asignada a empresa`);
                }
            } else {
                console.log('⚠️  No hay empresas disponibles para asignar ofertas huérfanas');
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
        
        // 5. Verificar integridad final
        console.log('\n5. Verificando integridad final...');
        
        const offersWithCompany = await Offer.findAll({
            include: [{ model: Company }]
        });
        
        const applicationsWithAllData = await Application.findAll({
            include: [
                { model: Offer, include: [Company] },
                { model: Student },
                { model: Company }
            ]
        });
        
        console.log(`\n📊 Resumen final:`);
        console.log(`- Ofertas con empresa: ${offersWithCompany.length}`);
        console.log(`- Aplicaciones con datos completos: ${applicationsWithAllData.length}`);
        
        const offersWithoutCompanyFinal = offersWithCompany.filter(o => !o.Company);
        const applicationsWithoutCompanyFinal = applicationsWithAllData.filter(a => !a.Company);
        
        console.log(`- Ofertas sin empresa: ${offersWithoutCompanyFinal.length}`);
        console.log(`- Aplicaciones sin empresa: ${applicationsWithoutCompanyFinal.length}`);
        
        if (offersWithoutCompanyFinal.length === 0 && applicationsWithoutCompanyFinal.length === 0) {
            console.log('\n✅ ¡Base de datos corregida exitosamente!');
        } else {
            console.log('\n⚠️  Aún hay datos inconsistentes');
        }
        
    } catch (error) {
        console.error('❌ Error corrigiendo el esquema:', error);
        throw error;
    }
}

// Ejecutar la corrección
fixDatabaseSchema()
    .then(() => {
        console.log('\n🎉 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error);
        process.exit(1);
    });

export { fixDatabaseSchema };
