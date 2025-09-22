const { Sequelize, DataTypes } = require('sequelize');

// Configurar conexión directa a la base de datos
const sequelize = new Sequelize('postgres://postgres:Vertical23@localhost:5432/ausbildung', {
    dialect: 'postgres',
    logging: console.log
});

async function checkOfferHistory() {
    console.log('🔍 Investigando historial completo de la oferta...\n');
    
    try {
        // Verificar estado actual de OfferSkill
        const [offerSkillResults] = await sequelize.query(`
            SELECT os.*, s.name as skill_name, o.name as offer_name 
            FROM "OfferSkill" os
            JOIN "skills" s ON os."skillId" = s.id
            JOIN "offers" o ON os."offerId" = o.id
            ORDER BY os."offerId", os."skillId"
        `);
        
        console.log('📊 Estado actual de OfferSkill:');
        console.log(`Total registros: ${offerSkillResults.length}\n`);
        
        offerSkillResults.forEach(record => {
            console.log(`🔗 Oferta "${record.offer_name}" (ID: ${record.offerId}) -> Skill "${record.skill_name}" (ID: ${record.skillId})`);
        });
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Verificar todos los skills disponibles
        const [skillResults] = await sequelize.query(`
            SELECT id, name, area FROM "skills" ORDER BY id
        `);
        
        console.log('🎯 Todos los skills disponibles:');
        skillResults.forEach(skill => {
            console.log(`   ID ${skill.id}: ${skill.name} (${skill.area || 'Sin área'})`);
        });
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Verificar datos de la oferta específica
        const [offerResults] = await sequelize.query(`
            SELECT * FROM "offers" WHERE id = 4
        `);
        
        if (offerResults.length > 0) {
            const offer = offerResults[0];
            console.log('🏢 Detalles de la oferta ID 4:');
            console.log(`   Nombre: ${offer.name}`);
            console.log(`   Tag original: ${offer.tag}`);
            console.log(`   Descripción: ${offer.description}`);
            console.log(`   Requisitos: ${offer.requisites}`);
            console.log(`   Sector: ${offer.sector}`);
            
            // Buscar en descripción y requisitos si hay mentions de otros skills
            const allText = `${offer.description} ${offer.requisites} ${offer.tag}`.toLowerCase();
            
            console.log('\n🔍 Analizando contenido para detectar skills mencionados:');
            
            skillResults.forEach(skill => {
                if (allText.includes(skill.name.toLowerCase())) {
                    console.log(`   ✅ "${skill.name}" encontrado en el contenido`);
                }
            });
        }
        
        await sequelize.close();
        console.log('\n✅ Análisis completado');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkOfferHistory();