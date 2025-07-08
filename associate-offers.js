// Script para asociar ofertas existentes con la empresa
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

async function associateOffersWithCompany() {
    try {
        console.log('🔗 Asociando ofertas existentes con empresa...\n');
        
        // 1. Login como empresa para obtener el companyId
        console.log('1. Obteniendo datos de la empresa...');
        const loginResponse = await makeRequest(`${API_BASE}/login`, {
            method: 'POST',
            body: {
                email: 'contacto@techcorp.com',
                password: 'password123'
            }
        });
        
        if (loginResponse.statusCode !== 200) {
            console.error('❌ Error en login de empresa:', loginResponse.data);
            return;
        }
        
        const companyUserId = loginResponse.data.user.id;
        console.log('✅ Empresa encontrada - UserID:', companyUserId);
        
        // 2. Obtener ofertas existentes
        console.log('\n2. Obteniendo ofertas disponibles...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        console.log(`✅ Ofertas encontradas: ${offers.length}`);
        
        // 3. Crear un endpoint temporal para asociar ofertas
        // Como no tenemos un endpoint directo, voy a sugerir crear uno
        console.log('\n3. 📝 SIGUIENTE PASO: Crear endpoint para asociar ofertas');
        console.log('Necesitamos crear un endpoint en el backend que permita:');
        console.log('POST /api/admin/associate-offers-company');
        console.log('Body: { companyUserId, offerIds }');
        
        console.log('\n📋 DATOS PARA LA ASOCIACIÓN:');
        console.log(`• Company UserID: ${companyUserId}`);
        console.log('• Ofertas a asociar:');
        offers.forEach(offer => {
            console.log(`  - ID: ${offer.id}, Nombre: ${offer.name}`);
        });
        
        // Mientras tanto, voy a crear un script SQL manual
        console.log('\n🔧 SCRIPT SQL MANUAL (ejecutar en la base de datos):');
        console.log('-- Primero obtener el ID de la empresa de la tabla companies');
        console.log(`SELECT id FROM companies WHERE "userId" = ${companyUserId};`);
        console.log('\n-- Luego asociar cada oferta con la empresa (reemplazar COMPANY_ID)');
        offers.forEach(offer => {
            console.log(`INSERT INTO "CompanyOffer" ("companyId", "offerId", "createdAt", "updatedAt") VALUES (COMPANY_ID, ${offer.id}, NOW(), NOW()) ON CONFLICT DO NOTHING;`);
        });
        
        return {
            companyUserId: companyUserId,
            offers: offers
        };
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

console.log('🚀 Iniciando asociación de ofertas con empresa...');
associateOffersWithCompany();
