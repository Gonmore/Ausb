// Script para asociar manualmente el usuario company1@example.com con la empresa
import { User, Company } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function associateUserWithCompany() {
    console.log('🔗 Asociando usuario con empresa...\n');
    
    try {
        // Buscar el usuario company1@example.com
        const user = await User.findOne({ where: { email: 'company1@example.com' } });
        if (!user) {
            console.log('❌ Usuario company1@example.com no encontrado');
            return;
        }
        
        console.log(`✅ Usuario encontrado: ${user.email} (ID: ${user.id})`);
        
        // Buscar la primera empresa disponible
        const company = await Company.findOne({ where: { id: 1 } });
        if (!company) {
            console.log('❌ Empresa con ID 1 no encontrada');
            return;
        }
        
        console.log(`✅ Empresa encontrada: ${company.name} (ID: ${company.id})`);
        
        // Asociar el usuario con la empresa
        await company.update({ userId: user.id });
        console.log(`✅ Usuario ${user.email} asociado con empresa ${company.name}`);
        
        // Verificar la asociación
        const updatedCompany = await Company.findByPk(company.id, {
            include: [{ model: User }]
        });
        
        if (updatedCompany.User) {
            console.log(`✅ Asociación verificada: ${updatedCompany.User.email} ↔ ${updatedCompany.name}`);
        } else {
            console.log('❌ La asociación falló');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

associateUserWithCompany();
