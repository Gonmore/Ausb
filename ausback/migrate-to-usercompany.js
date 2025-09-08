import sequelize from './src/database/database.js';
import { Op } from 'sequelize';
import { Company, User, UserCompany } from './src/models/relations.js';

async function migrateToUserCompany() {
    try {
        console.log('🔄 Migrando a sistema UserCompany...');
        
        // Crear tabla UserCompany si no existe
        await UserCompany.sync({ force: false });
        console.log('✅ Tabla UserCompany verificada/creada');
        
        // Migrar datos existentes
        const companiesWithUsers = await Company.findAll({
            where: { 
                userId: { [Op.ne]: null }
            }
        });
        
        console.log(`📊 Empresas con usuarios encontradas: ${companiesWithUsers.length}`);
        
        for (const company of companiesWithUsers) {
            // Verificar si ya existe la relación
            const existingRelation = await UserCompany.findOne({
                where: {
                    userId: company.userId,
                    companyId: company.id
                }
            });
            
            if (!existingRelation) {
                await UserCompany.create({
                    userId: company.userId,
                    companyId: company.id,
                    role: 'admin',
                    isActive: true
                });
                
                console.log(`✅ Migrado: User ${company.userId} → Company ${company.id} (${company.name})`);
            } else {
                console.log(`ℹ️  Ya existe: User ${company.userId} → Company ${company.id} (${company.name})`);
            }
        }
        
        // 🔥 VERIFICACIÓN CORREGIDA: Hacer consultas separadas
        const allUserCompanies = await UserCompany.findAll();
        
        console.log('\n🔍 Relaciones UserCompany creadas:');
        for (const uc of allUserCompanies) {
            // Buscar usuario y empresa por separado
            const user = await User.findByPk(uc.userId, {
                attributes: ['id', 'email']
            });
            
            const company = await Company.findByPk(uc.companyId, {
                attributes: ['id', 'name']
            });
            
            console.log(`  - ${user?.email || 'Usuario no encontrado'} → ${company?.name || 'Empresa no encontrada'} (Rol: ${uc.role})`);
        }
        
        console.log('\n🎯 Verificación del companyService:');
        
        // Probar el nuevo companyService
        try {
            const { default: companyService } = await import('./src/services/companyService.js');
            
            // Probar con el usuario 3 (company2@example.com)
            const company = await companyService.getCompanyByUserId(3);
            console.log(`✅ CompanyService funcionando: Usuario 3 → Empresa ${company.name} (ID: ${company.id})`);
            
        } catch (serviceError) {
            console.log(`❌ Error probando companyService: ${serviceError.message}`);
        }
        
        console.log('🎉 Migración completada exitosamente');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    }
}

migrateToUserCompany();