// Script para hacer consulta HTTP al API local
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

async function testOfferEndpoint() {
    console.log('🌐 Probando endpoint de ofertas...\n');
    
    try {
        const response = await makeRequest('http://localhost:5000/api/offers');
        
        console.log(`📊 Status Code: ${response.statusCode}`);
        
        if (response.statusCode === 200) {
            const offers = JSON.parse(response.data);
            console.log(`📈 Total de ofertas: ${offers.length}\n`);
            
            offers.forEach((offer, index) => {
                console.log(`🏢 Oferta ${index + 1}:`);
                console.log(`   ID: ${offer.id}`);
                console.log(`   Nombre: ${offer.name}`);
                console.log(`   Tag: ${offer.tag || 'No tag'}`);
                console.log(`   Skills: ${offer.Skills ? offer.Skills.length : 0}`);
                
                if (offer.Skills && offer.Skills.length > 0) {
                    console.log('   📋 Skills asociados:');
                    offer.Skills.forEach(skill => {
                        console.log(`      - ${skill.name} (ID: ${skill.id})`);
                    });
                } else {
                    console.log('   ⚠️  No hay skills asociados');
                }
                console.log('');
            });
        } else {
            console.log('❌ Error en la respuesta:');
            console.log(response.data);
        }
        
    } catch (error) {
        console.log('❌ Error al conectar con el API:');
        console.log(error.message);
    }
}

testOfferEndpoint();