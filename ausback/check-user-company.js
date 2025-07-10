// Script para verificar la estructura de usuario-empresa
import { User, Company } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function checkUserCompanyRelation() {
    console.log('🔍 Verificando relación usuario-empresa...\n');
    
    try {
        // Obtener usuario company1@example.com
        const user = await User.findOne({
            where: { email: 'company1@example.com' },
            include: [{ model: Company }]
        });
        
        if (!user) {
            console.log('❌ Usuario company1@example.com no encontrado');
            return;
        }
        
        console.log('👤 Usuario encontrado:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Username: ${user.username}`);
        
        if (user.Company) {
            console.log('\n🏢 Empresa asociada:');
            console.log(`   - ID: ${user.Company.id}`);
            console.log(`   - Name: ${user.Company.name}`);
            console.log(`   - City: ${user.Company.city}`);
            console.log(`   - Sector: ${user.Company.sector}`);
            console.log(`   - UserId: ${user.Company.userId}`);
        } else {
            console.log('\n❌ No hay empresa asociada a este usuario');
        }
        
        // También verificar la empresa directamente
        console.log('\n🔍 Verificando empresas disponibles:');
        const companies = await Company.findAll({
            include: [{ model: User }]
        });
        
        console.log(`Total empresas: ${companies.length}`);
        companies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.name} (ID: ${company.id})`);
            if (company.User) {
                console.log(`   - Usuario: ${company.User.email} (ID: ${company.User.id})`);
            } else {
                console.log(`   - Sin usuario asociado`);
            }
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkUserCompanyRelation();
