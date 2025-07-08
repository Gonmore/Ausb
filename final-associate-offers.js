// Script para asociar ofertas con empresa usando el nuevo endpoint
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
        console.log('🔗 Asociando ofertas con empresa TechCorp...\n');
        
        // 1. Login como empresa para obtener el userId
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
        
        // 2. Usar el endpoint para asociar todas las ofertas con la empresa
        console.log('\n2. Asociando ofertas con la empresa...');
        const associateResponse = await makeRequest(`${API_BASE}/api/admin-temp/associate-offers-company`, {
            method: 'POST',
            body: {
                companyUserId: companyUserId
            }
        });
        
        console.log('Respuesta status:', associateResponse.statusCode);
        
        if (associateResponse.statusCode === 200) {
            console.log('✅ ¡Ofertas asociadas exitosamente!');
            console.log('📋 Detalles de la asociación:');
            console.log(`• Empresa: ${associateResponse.data.company.name}`);
            console.log(`• Total de ofertas asociadas: ${associateResponse.data.total}`);
            
            console.log('\n📝 Ofertas asociadas:');
            associateResponse.data.associations.forEach((assoc, index) => {
                console.log(`  ${index + 1}. ${assoc.offerName} (ID: ${assoc.offerId})`);
            });
            
            console.log('\n🎉 ¡CONFIGURACIÓN COMPLETADA!');
            console.log('✅ Las ofertas ahora tienen empresa asociada');
            console.log('✅ Los estudiantes pueden aplicar a las ofertas');
            
            return true;
        } else {
            console.error('❌ Error asociando ofertas:', associateResponse.data);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return false;
    }
}

async function testOfferCompanyAssociation() {
    console.log('\n🧪 VERIFICANDO ASOCIACIÓN...');
    
    try {
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode === 200) {
            const offers = offersResponse.data;
            console.log('📋 Verificando ofertas con empresas asociadas:');
            
            offers.forEach((offer, index) => {
                const hasCompanies = offer.companies && offer.companies.length > 0;
                console.log(`  ${index + 1}. ${offer.name} - ${hasCompanies ? '✅ Con empresa' : '❌ Sin empresa'}`);
            });
            
            const offersWithCompanies = offers.filter(offer => offer.companies && offer.companies.length > 0);
            console.log(`\n📊 Resultado: ${offersWithCompanies.length}/${offers.length} ofertas tienen empresa asociada`);
            
            return offersWithCompanies.length === offers.length;
        }
    } catch (error) {
        console.error('Error verificando asociación:', error.message);
        return false;
    }
}

console.log('🚀 Iniciando asociación de ofertas con empresa...');
associateOffersWithCompany().then(success => {
    if (success) {
        setTimeout(() => {
            testOfferCompanyAssociation().then(allAssociated => {
                if (allAssociated) {
                    console.log('\n🎯 ¡PROCESO COMPLETADO EXITOSAMENTE!');
                    console.log('🚀 El sistema está listo para testing de aplicaciones');
                }
            });
        }, 1000);
    }
});
