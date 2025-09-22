// Script simple para verificar datos mediante consultas SQL directas
const fs = require('fs');

// Vamos a crear consultas SQL que podemos ejecutar manualmente
const queries = `
-- 1. Ver estado actual de OfferSkill
SELECT 
    os."offerId", 
    os."skillId", 
    o.name as offer_name, 
    s.name as skill_name,
    os."createdAt"
FROM "OfferSkill" os
JOIN "offers" o ON os."offerId" = o.id  
JOIN "skills" s ON os."skillId" = s.id
ORDER BY os."offerId", os."skillId";

-- 2. Ver todos los skills disponibles  
SELECT id, name, area FROM "skills" ORDER BY id;

-- 3. Ver detalles completos de la oferta ID 4
SELECT * FROM "offers" WHERE id = 4;

-- 4. Buscar skills que podrían estar relacionados con 'programacion'
SELECT * FROM "skills" 
WHERE name ILIKE '%program%' 
   OR name ILIKE '%desarrollo%'
   OR name ILIKE '%javascript%'
   OR name ILIKE '%python%'
   OR name ILIKE '%java%'
   OR name ILIKE '%sql%'
   OR name ILIKE '%web%'
   OR name ILIKE '%frontend%'
   OR name ILIKE '%backend%';

-- 5. Verificar si hay más registros en OfferSkill que no vemos
SELECT COUNT(*) as total_records FROM "OfferSkill";

-- 6. Ver qué skills están disponibles por área
SELECT area, COUNT(*) as skill_count, array_agg(name) as skills
FROM "skills" 
GROUP BY area;
`;

// Guardar consultas en archivo
fs.writeFileSync('debug-queries.sql', queries);

console.log('🔍 Archivo debug-queries.sql creado con consultas para investigar');
console.log('');
console.log('📊 Consultas incluidas:');
console.log('1. Estado actual de OfferSkill');
console.log('2. Todos los skills disponibles');
console.log('3. Detalles de la oferta ID 4');
console.log('4. Skills relacionados con programación');
console.log('5. Total de registros en OfferSkill');
console.log('6. Skills agrupados por área');
console.log('');
console.log('Ahora voy a hacer una consulta directa al API para ver qué retorna...');

// También vamos a verificar qué retorna el endpoint de ofertas
console.log('');
console.log('🌐 Para verificar la respuesta del API, ejecuta en otra terminal:');
console.log('curl "http://localhost:5000/api/offer"');