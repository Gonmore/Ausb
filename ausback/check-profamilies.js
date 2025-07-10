// Script para verificar el estado de familias profesionales en la DB

import { Profamily } from './src/models/profamily.js';
import sequelize from './src/database/database.js';

async function checkProfamilies() {
    console.log('🔍 Verificando familias profesionales en la base de datos...\n');
    
    try {
        // Verificar conexión a la base de datos
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida');
        
        // Obtener todas las familias profesionales
        const profamilies = await Profamily.findAll();
        console.log(`📋 Familias profesionales encontradas: ${profamilies.length}`);
        
        if (profamilies.length === 0) {
            console.log('❌ No hay familias profesionales en la base de datos');
            console.log('💡 Creando familias profesionales de ejemplo...');
            
            // Crear familias profesionales básicas
            const defaultProfamilies = [
                {
                    name: 'Informática y Comunicaciones',
                    description: 'Familia profesional relacionada con tecnología, programación y comunicaciones'
                },
                {
                    name: 'Administración y Gestión',
                    description: 'Familia profesional relacionada con gestión empresarial y administración'
                },
                {
                    name: 'Comercio y Marketing',
                    description: 'Familia profesional relacionada con ventas, marketing y comercio'
                },
                {
                    name: 'Sanidad',
                    description: 'Familia profesional relacionada con salud y servicios sanitarios'
                },
                {
                    name: 'Servicios Socioculturales y a la Comunidad',
                    description: 'Familia profesional relacionada con servicios sociales y culturales'
                }
            ];
            
            for (const profamilyData of defaultProfamilies) {
                const profamily = await Profamily.create(profamilyData);
                console.log(`✅ Creada: ${profamily.name} (ID: ${profamily.id})`);
            }
            
            console.log('\n✅ Familias profesionales creadas exitosamente');
        } else {
            console.log('\n📋 Familias profesionales existentes:');
            profamilies.forEach(profamily => {
                console.log(`- ${profamily.name} (ID: ${profamily.id})`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('Stack:', error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

checkProfamilies();
