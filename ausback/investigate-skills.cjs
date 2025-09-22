// Script para investigar qué skills había antes y restaurar los que faltan
const https = require('https');
const http = require('http');

function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    statusCode: res.statusCode,
                    data: data
                });
            });
        });
        
        req.on('error', (err) => {
            reject(err);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function checkSkillsAndOffers() {
    console.log('🔍 Investigando skills disponibles y ofertas...\n');
    
    try {
        // Primero verificar todos los skills disponibles
        const skillsResponse = await makeRequest('http://localhost:5000/api/skills');
        
        if (skillsResponse.statusCode === 200) {
            const skills = JSON.parse(skillsResponse.data);
            console.log(`🎯 Total de skills disponibles: ${skills.length}\n`);
            
            console.log('📋 Skills relacionados con programación/desarrollo:');
            const progSkills = skills.filter(skill => 
                skill.name.toLowerCase().includes('program') ||
                skill.name.toLowerCase().includes('javascript') ||
                skill.name.toLowerCase().includes('python') ||
                skill.name.toLowerCase().includes('java') ||
                skill.name.toLowerCase().includes('desarrollo') ||
                skill.name.toLowerCase().includes('web') ||
                skill.name.toLowerCase().includes('frontend') ||
                skill.name.toLowerCase().includes('backend') ||
                skill.name.toLowerCase().includes('sql') ||
                skill.name.toLowerCase().includes('database') ||
                skill.name.toLowerCase().includes('framework')
            );
            
            progSkills.forEach(skill => {
                console.log(`   - ${skill.name} (ID: ${skill.id}) - Área: ${skill.area || 'Sin área'}`);
            });
            
            if (progSkills.length > 1) {
                console.log('\n💡 ¡Encontramos múltiples skills relacionados con programación!');
                console.log('   Esto sugiere que la oferta debería tener más de un skill asociado.');
                
                console.log('\n🔧 Skills candidatos para asociar a la oferta "practicas en supernovatel":');
                progSkills.forEach(skill => {
                    console.log(`   ${skill.id}: ${skill.name}`);
                });
            }
            
        } else {
            console.log('❌ Error al obtener skills:', skillsResponse.data);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

checkSkillsAndOffers();