// Script para crear empresa y asociar con ofertas existentes
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

async function setupCompanyAndOffers() {
    try {
        console.log('🏢 Configurando empresa para ofertas de práticas...\n');
        
        // 1. Crear empresa
        const timestamp = Date.now();
        const companyData = {
            username: `techcorp_${timestamp}`,
            email: `contacto@techcorp.com`,
            password: 'password123',
            role: 'company',
            name: 'TechCorp Innovación',
            description: 'Empresa líder en desarrollo tecnológico y prácticas profesionales'
        };
        
        console.log('📝 Creando empresa:', companyData.name);
        const registerResponse = await makeRequest(`${API_BASE}/register`, {
            method: 'POST',
            body: companyData
        });
        
        if (registerResponse.statusCode !== 201) {
            console.error('❌ Error creando empresa:', registerResponse.data);
            
            // Intentar login si ya existe
            console.log('🔄 Intentando login con empresa existente...');
            const loginResponse = await makeRequest(`${API_BASE}/login`, {
                method: 'POST',
                body: {
                    email: companyData.email,
                    password: companyData.password
                }
            });
            
            if (loginResponse.statusCode !== 200) {
                console.error('❌ No se pudo hacer login con empresa existente');
                return;
            }
            
            console.log('✅ Login exitoso con empresa existente');
            return {
                companyId: loginResponse.data.user.id,
                token: loginResponse.data.token
            };
        }
        
        console.log('✅ Empresa creada exitosamente');
        
        // 2. Login como empresa para obtener token
        const loginResponse = await makeRequest(`${API_BASE}/login`, {
            method: 'POST',
            body: {
                email: companyData.email,
                password: companyData.password
            }
        });
        
        if (loginResponse.statusCode !== 200) {
            console.error('❌ Error en login de empresa:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const companyUserId = loginResponse.data.user.id;
        console.log('✅ Login empresa exitoso - UserID:', companyUserId);
        
        // 3. Obtener ofertas disponibles
        console.log('\n📋 Obteniendo ofertas disponibles...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        console.log(`✅ Ofertas encontradas: ${offers.length}`);
        
        console.log('\n🎯 Empresa configurada correctamente:');
        console.log(`• Nombre: ${companyData.name}`);
        console.log(`• Email: ${companyData.email}`);
        console.log(`• UserID: ${companyUserId}`);
        console.log(`• Ofertas disponibles: ${offers.length}`);
        
        return {
            companyId: companyUserId,
            token: token,
            email: companyData.email,
            password: companyData.password,
            offers: offers
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

// También crear un script separado para asociar ofertas con empresa manualmente
async function associateOffersWithCompany() {
    try {
        // Este script deberá ejecutarse directamente en la base de datos
        // o crear un endpoint especial para asociar ofertas con empresas
        console.log('ℹ️ Para asociar ofertas con empresas, se necesita:');
        console.log('1. Obtener el ID de la empresa de la tabla companies');
        console.log('2. Asociar cada oferta con la empresa en la tabla CompanyOffer');
        console.log('3. Esto se puede hacer con una consulta SQL directa o endpoint especial');
    } catch (error) {
        console.error('Error:', error.message);
    }
}

console.log('🚀 Configurando empresa para prácticas profesionales...');
setupCompanyAndOffers().then(result => {
    if (result) {
        console.log('\n✅ CONFIGURACIÓN COMPLETADA');
        console.log('📋 La empresa está lista para recibir aplicaciones de estudiantes');
        console.log('\n⚠️ NOTA: Las ofertas existentes necesitan ser asociadas manualmente');
        console.log('con la empresa para permitir aplicaciones.');
    }
});
