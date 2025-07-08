// Script para crear empresa y asociarla con ofertas
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

async function createCompanyAndAssociateOffers() {
    try {
        console.log('🏢 Creando empresa de prueba y asociando con ofertas...\n');
        
        // 1. Crear usuario empresa
        const timestamp = Date.now();
        const companyData = {
            username: `company_${timestamp}`,
            email: `company_${timestamp}@example.com`,
            password: 'password123',
            role: 'company',
            name: 'TechCorp Solutions',
            description: 'Empresa de desarrollo tecnológico'
        };
        
        console.log('Creando usuario empresa...');
        const registerResponse = await makeRequest(`${API_BASE}/register`, {
            method: 'POST',
            body: companyData
        });
        
        if (registerResponse.statusCode !== 201) {
            console.error('❌ Error creando empresa:', registerResponse.data);
            return;
        }
        
        console.log('✅ Usuario empresa creado exitosamente');
        
        // 2. Hacer login como empresa
        console.log('Haciendo login como empresa...');
        const loginResponse = await makeRequest(`${API_BASE}/login`, {
            method: 'POST',
            body: {
                email: companyData.email,
                password: companyData.password
            }
        });
        
        if (loginResponse.statusCode !== 200) {
            console.error('❌ Error en login empresa:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const companyUserId = loginResponse.data.user.id;
        console.log('✅ Login empresa exitoso - UserID:', companyUserId);
        
        // 3. Obtener ofertas disponibles
        console.log('Obteniendo ofertas disponibles...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        console.log(`✅ Ofertas encontradas: ${offers.length}`);
        
        if (offers.length === 0) {
            console.log('⚠️ No hay ofertas para asociar');
            return;
        }
        
        // 4. Asociar empresa con ofertas (esto se hace típicamente en el backend)
        console.log('📌 Empresa creada y lista para asociar con ofertas');
        console.log('Datos de la empresa:');
        console.log('- Email:', companyData.email);
        console.log('- Password:', companyData.password);
        console.log('- UserID:', companyUserId);
        
        return {
            email: companyData.email,
            password: companyData.password,
            userId: companyUserId,
            token: token
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createCompanyAndAssociateOffers();
