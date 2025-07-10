// Script para verificar y corregir la relación usuario-empresa directamente
import { User, Company } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function fixUserCompanyRelation() {
    console.log('🔧 Corrigiendo relación usuario-empresa...\n');
    
    try {
        // Actualizar directamente en la base de datos
        const [affectedRows] = await sequelize.query(
            'UPDATE companies SET "userId" = 2 WHERE id = 1',
            { type: sequelize.QueryTypes.UPDATE }
        );
        
        console.log(`✅ Filas afectadas: ${affectedRows}`);
        
        // Verificar la actualización
        const result = await sequelize.query(
            'SELECT c.id, c.name, c."userId", u.email FROM companies c LEFT JOIN users u ON c."userId" = u.id WHERE c.id = 1',
            { type: sequelize.QueryTypes.SELECT }
        );
        
        console.log('📋 Resultado de la consulta:', result);
        
        // Ahora verificar con Sequelize
        const company = await Company.findByPk(1, {
            include: [{ model: User }]
        });
        
        console.log('🏢 Empresa con Sequelize:');
        console.log(`   - ID: ${company.id}`);
        console.log(`   - Name: ${company.name}`);
        console.log(`   - UserId: ${company.userId}`);
        
        if (company.User) {
            console.log(`   - Usuario asociado: ${company.User.email}`);
        } else {
            console.log('   - Sin usuario asociado en Sequelize');
        }
        
        // También verificar el usuario
        const user = await User.findByPk(2, {
            include: [{ model: Company }]
        });
        
        console.log('\n👤 Usuario con Sequelize:');
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        
        if (user.Company) {
            console.log(`   - Empresa asociada: ${user.Company.name}`);
        } else {
            console.log('   - Sin empresa asociada en Sequelize');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

fixUserCompanyRelation();
