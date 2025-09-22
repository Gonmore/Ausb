import { sequelize } from './src/database/database.js';
import { Offer } from './src/models/offer.js';
import { Skill } from './src/models/skill.js';

async function verifyOffersWithSkills() {
    console.log('🔍 Verificando ofertas con skills cargadas...\n');
    
    try {
        // Buscar todas las ofertas con sus skills asociadas
        const offers = await Offer.findAll({
            include: [{
                model: Skill,
                attributes: ['id', 'name']
            }]
        });

        console.log(`📊 Total de ofertas encontradas: ${offers.length}\n`);

        offers.forEach(offer => {
            console.log(`🏢 Oferta ID ${offer.id}: "${offer.name}"`);
            console.log(`   🏷️ Tag: ${offer.tag || 'No tag'}`);
            console.log(`   🎯 Skills asociadas: ${offer.Skills ? offer.Skills.length : 0}`);
            
            if (offer.Skills && offer.Skills.length > 0) {
                offer.Skills.forEach(skill => {
                    console.log(`      - ${skill.name} (ID: ${skill.id})`);
                });
            }
            console.log('');
        });

        await sequelize.close();
        console.log('✅ Verificación completada');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifyOffersWithSkills();