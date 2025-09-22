// Script simple para ver qué devuelven los endpoints
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

async function testEndpoints() {
    console.log('🔍 Probando endpoints disponibles...\n');
    
    const endpoints = [
        '/api/skills',
        '/api/skill',
        '/api/offers'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const url = `http://localhost:5000${endpoint}`;
            console.log(`📡 Probando: ${url}`);
            
            const response = await makeRequest(url);
            console.log(`   Status: ${response.statusCode}`);
            
            if (response.statusCode === 200) {
                try {
                    const parsed = JSON.parse(response.data);
                    console.log(`   Tipo: ${Array.isArray(parsed) ? 'Array' : typeof parsed}`);
                    console.log(`   Elementos: ${Array.isArray(parsed) ? parsed.length : 'N/A'}`);
                    
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        console.log(`   Primer elemento:`, parsed[0]);
                    }
                } catch (e) {
                    console.log(`   Error parsing JSON: ${e.message}`);
                    console.log(`   Raw data (primeros 200 chars): ${response.data.substring(0, 200)}...`);
                }
            } else {
                console.log(`   Error: ${response.data.substring(0, 100)}...`);
            }
            
            console.log('');
        } catch (error) {
            console.log(`   Error: ${error.message}\n`);
        }
    }
}

testEndpoints();