// Test simple para verificar endpoints
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000';

// Función helper para hacer requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = protocol.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve({ data: parsedData, statusCode: res.statusCode });
                } catch (e) {
                    resolve({ data: data, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function testEndpoints() {
    try {
        console.log('🔍 Probando endpoints...\n');
        
        // 1. Verificar si el servidor está funcionando
        console.log('1. Verificando servidor...');
        const healthResponse = await makeRequest(`${API_BASE}/`);
        console.log('Status:', healthResponse.statusCode);
        console.log('Response:', healthResponse.data);
        
        // 2. Verificar endpoint de ofertas
        console.log('\n2. Verificando ofertas...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        console.log('Status:', offersResponse.statusCode);
        console.log('Ofertas:', offersResponse.data);
        
        // 3. Intentar login con diferentes credenciales
        console.log('\n3. Intentando login con credenciales de prueba...');
        const testCredentials = [
            { email: 'admin@test.com', password: 'admin123' },
            { email: 'student@test.com', password: 'student123' },
            { email: 'company@test.com', password: 'company123' },
            { email: 'test@test.com', password: 'test123' }
        ];
        
        for (const cred of testCredentials) {
            const loginResponse = await makeRequest(`${API_BASE}/login`, {
                method: 'POST',
                body: cred
            });
            
            console.log(`Login ${cred.email}:`, loginResponse.statusCode, loginResponse.data.message || 'OK');
            
            if (loginResponse.statusCode === 200) {
                console.log('✅ Login exitoso con:', cred.email);
                
                // Probar endpoint de aplicaciones
                const token = loginResponse.data.token;
                const appsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Mis aplicaciones:', appsResponse.statusCode, appsResponse.data);
                break;
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testEndpoints();
