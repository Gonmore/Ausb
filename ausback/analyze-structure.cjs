// Script para ver la estructura exacta de la respuesta
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

async function analyzeOfferStructure() {
    console.log('🔍 Analizando estructura detallada de la oferta...\n');
    
    try {
        const response = await makeRequest('http://localhost:5000/api/offers');
        
        if (response.statusCode === 200) {
            const offers = JSON.parse(response.data);
            const offer = offers[0];
            
            console.log('📊 Estructura completa de la oferta:');
            console.log(JSON.stringify(offer, null, 2));
            
            console.log('\n🔍 Propiedades relacionadas con skills:');
            console.log(`- skills: ${offer.skills ? 'EXISTE' : 'NO EXISTE'}`);
            console.log(`- Skills: ${offer.Skills ? 'EXISTE' : 'NO EXISTE'}`);
            
            if (offer.skills) {
                console.log(`\n📋 offer.skills (minúscula):`, offer.skills);
                console.log(`   Tipo: ${Array.isArray(offer.skills) ? 'Array' : typeof offer.skills}`);
                console.log(`   Longitud: ${Array.isArray(offer.skills) ? offer.skills.length : 'N/A'}`);
            }
            
            if (offer.Skills) {
                console.log(`\n📋 offer.Skills (mayúscula):`, offer.Skills);
                console.log(`   Tipo: ${Array.isArray(offer.Skills) ? 'Array' : typeof offer.Skills}`);
                console.log(`   Longitud: ${Array.isArray(offer.Skills) ? offer.Skills.length : 'N/A'}`);
            }
            
        } else {
            console.log('❌ Error:', response.data);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

analyzeOfferStructure();