import { Skill } from './src/models/skill.js';
import { Offer } from './src/models/offer.js';
import './src/models/relations.js';
import sequelize from './src/database/database.js';

async function checkData() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a DB');
    
    // Verificar tabla OfferSkill
    const offerSkillCount = await sequelize.query('SELECT COUNT(*) as count FROM "OfferSkill"', { type: sequelize.QueryTypes.SELECT });
    console.log('📊 Registros en OfferSkill:', offerSkillCount[0].count);
    
    // Verificar ofertas con skills
    const offersWithSkills = await Offer.findAll({
      include: [{
        model: Skill,
        attributes: ['id', 'name']
      }],
      limit: 5
    });
    
    console.log('\n📋 Ofertas con skills:');
    offersWithSkills.forEach(offer => {
      console.log(`- Oferta: "${offer.name}" | Skills: ${offer.Skills?.length || 0}`);
      if (offer.Skills && offer.Skills.length > 0) {
        offer.Skills.forEach(skill => console.log(`  * ${skill.name}`));
      }
    });
    
    // Verificar ofertas con tags
    const offersWithTags = await Offer.findAll({
      where: {
        tag: {
          [sequelize.Sequelize.Op.not]: null,
          [sequelize.Sequelize.Op.ne]: ''
        }
      },
      attributes: ['id', 'name', 'tag'],
      limit: 5
    });
    
    console.log('\n🏷️ Ofertas con tags:');
    offersWithTags.forEach(offer => {
      console.log(`- Oferta: "${offer.name}" | Tags: "${offer.tag}"`);
    });
    
    await sequelize.close();
    console.log('\n✅ Verificación completa');
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkData();