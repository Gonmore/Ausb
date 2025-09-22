const { Sequelize, DataTypes } = require('sequelize');

// Configurar conexión directa a la base de datos
const sequelize = new Sequelize('ausbildung', 'postgres', 'D3v3/op3R', {
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    logging: console.log
});

async function addMoreSkillsToOffer() {
    console.log('🔧 Agregando más skills relevantes a la oferta de prácticas...\n');
    
    try {
        // Primero ver qué skills existen relacionados con frontend/programación
        const [skillResults] = await sequelize.query(`
            SELECT id, name, area FROM "skills" 
            WHERE name ILIKE '%javascript%' 
               OR name ILIKE '%react%'
               OR name ILIKE '%html%'
               OR name ILIKE '%css%'
               OR name ILIKE '%frontend%'
               OR name ILIKE '%web%'
               OR name ILIKE '%typescript%'
               OR name ILIKE '%node%'
               OR name ILIKE '%angular%'
               OR name ILIKE '%vue%'
            ORDER BY name
        `);
        
        console.log('🎯 Skills relacionados con frontend encontrados:');
        skillResults.forEach(skill => {
            console.log(`   ID ${skill.id}: ${skill.name} (${skill.area || 'Sin área'})`);
        });
        
        // Si hay skills relevantes, agregar algunos a la oferta ID 4
        if (skillResults.length > 0) {
            console.log('\n🔗 Agregando skills adicionales a la oferta...');
            
            // Seleccionar los primeros 3-4 skills más relevantes (además del ya existente)
            const skillsToAdd = skillResults.slice(0, Math.min(4, skillResults.length));
            
            for (const skill of skillsToAdd) {
                // Verificar si ya existe la asociación
                const [existing] = await sequelize.query(`
                    SELECT * FROM "OfferSkill" 
                    WHERE "offerId" = 4 AND "skillId" = ${skill.id}
                `);
                
                if (existing.length === 0) {
                    // Agregar la asociación
                    await sequelize.query(`
                        INSERT INTO "OfferSkill" ("offerId", "skillId", "createdAt", "updatedAt")
                        VALUES (4, ${skill.id}, NOW(), NOW())
                    `);
                    console.log(`   ✅ Agregado: ${skill.name}`);
                } else {
                    console.log(`   ⚠️  Ya existe: ${skill.name}`);
                }
            }
            
        } else {
            console.log('\n🚨 No se encontraron skills específicos de frontend.');
            console.log('   Vamos a buscar skills más generales...');
            
            // Buscar skills más generales
            const [generalSkills] = await sequelize.query(`
                SELECT id, name, area FROM "skills" 
                WHERE name ILIKE '%desarrollo%'
                   OR name ILIKE '%software%'
                   OR name ILIKE '%tecnologia%'
                   OR name ILIKE '%informatica%'
                LIMIT 5
            `);
            
            console.log('\n🎯 Skills generales encontrados:');
            generalSkills.forEach(skill => {
                console.log(`   ID ${skill.id}: ${skill.name}`);
            });
        }
        
        // Verificar el resultado final
        console.log('\n📊 Estado final de la oferta:');
        const [finalResult] = await sequelize.query(`
            SELECT os.*, s.name as skill_name 
            FROM "OfferSkill" os
            JOIN "skills" s ON os."skillId" = s.id
            WHERE os."offerId" = 4
            ORDER BY os."skillId"
        `);
        
        console.log(`   Total skills asociados: ${finalResult.length}`);
        finalResult.forEach(record => {
            console.log(`   - ${record.skill_name} (ID: ${record.skillId})`);
        });
        
        await sequelize.close();
        console.log('\n✅ Proceso completado');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addMoreSkillsToOffer();