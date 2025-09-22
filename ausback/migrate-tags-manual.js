import { Skill } from './src/models/skill.js';
import { Offer } from './src/models/offer.js';
import './src/models/relations.js';
import sequelize from './src/database/database.js';

async function migrarTagsASkills() {
  const transaction = await sequelize.transaction();
  
  try {
    console.log('🚀 Iniciando migración manual de tags a skills...');
    
    // 1. Obtener ofertas con tags
    const offers = await Offer.findAll({
      where: {
        tag: {
          [sequelize.Sequelize.Op.not]: null,
          [sequelize.Sequelize.Op.ne]: ''
        }
      },
      transaction
    });
    
    console.log(`📊 Encontradas ${offers.length} ofertas con tags`);
    
    if (offers.length === 0) {
      console.log('✅ No hay ofertas con tags para migrar');
      await transaction.commit();
      return;
    }
    
    // 2. Extraer todos los tags únicos
    const allTags = new Set();
    const offerTagsMap = new Map();
    
    offers.forEach(offer => {
      if (offer.tag) {
        const tags = offer.tag.split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0);
        
        offerTagsMap.set(offer.id, tags);
        tags.forEach(tag => allTags.add(tag));
      }
    });
    
    console.log(`🏷️ Tags únicos encontrados: ${allTags.size}`);
    Array.from(allTags).forEach(tag => console.log(`   - ${tag}`));
    
    // 3. Crear skills para cada tag único
    const skillsByName = new Map();
    
    for (const tagName of allTags) {
      // Verificar si ya existe
      let skill = await Skill.findOne({
        where: { name: tagName },
        transaction
      });
      
      if (!skill) {
        // Crear nueva skill
        skill = await Skill.create({
          name: tagName,
          category: 'Technical',
          description: `Skill migrada desde tags: ${tagName}`,
          demandLevel: 'medium',
          isActive: true
        }, { transaction });
        
        console.log(`   ✅ Creada skill: ${tagName}`);
      } else {
        console.log(`   📌 Skill existente: ${tagName}`);
      }
      
      skillsByName.set(tagName, skill);
    }
    
    // 4. Asociar skills con ofertas
    let relationsCreated = 0;
    
    for (const [offerId, tagNames] of offerTagsMap) {
      const offer = await Offer.findByPk(offerId, { transaction });
      if (!offer) continue;
      
      const skillsToAssociate = tagNames
        .map(tagName => skillsByName.get(tagName))
        .filter(skill => skill !== undefined);
      
      if (skillsToAssociate.length > 0) {
        // Limpiar asociaciones existentes
        await offer.setSkills([], { transaction });
        
        // Crear nuevas asociaciones
        await offer.addSkills(skillsToAssociate, { transaction });
        relationsCreated += skillsToAssociate.length;
        
        console.log(`   🔗 Oferta "${offer.name}": ${skillsToAssociate.length} skills asociadas`);
      }
    }
    
    await transaction.commit();
    
    console.log('\n🎉 Migración completada exitosamente!');
    console.log(`   - Ofertas procesadas: ${offers.length}`);
    console.log(`   - Skills creadas/utilizadas: ${allTags.size}`);
    console.log(`   - Relaciones creadas: ${relationsCreated}`);
    
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error durante la migración:', error);
  } finally {
    await sequelize.close();
  }
}

migrarTagsASkills();