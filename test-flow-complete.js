// Test final del flujo de aplicaciones
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

async function testCompleteApplicationFlow() {
    try {
        console.log('🎯 TEST COMPLETO DEL FLUJO DE APLICACIONES');
        console.log('='.repeat(50));
        
        // 1. LOGIN DEL USUARIO EXISTENTE
        console.log('\n1. 🔑 LOGIN DEL ESTUDIANTE');
        const loginResponse = await makeRequest(`${API_BASE}/login`, {
            method: 'POST',
            body: {
                email: 'student_1751947679438@example.com',
                password: 'password123'
            }
        });
        
        if (loginResponse.statusCode !== 200) {
            console.error('❌ Error en login:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log('✅ Login exitoso - UserID:', userId);
        
        // 2. OBTENER OFERTAS DISPONIBLES
        console.log('\n2. 📋 OBTENER OFERTAS DISPONIBLES');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        console.log(`✅ Ofertas encontradas: ${offers.length}`);
        
        if (offers.length === 0) {
            console.log('⚠️ No hay ofertas disponibles para aplicar');
            return;
        }
        
        const targetOffer = offers[0];
        console.log(`📌 Oferta objetivo: "${targetOffer.name}" (ID: ${targetOffer.id})`);
        
        // 3. VERIFICAR APLICACIONES ANTES DE APLICAR
        console.log('\n3. 🔍 VERIFICAR APLICACIONES ANTES DE APLICAR');
        const beforeAppsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (beforeAppsResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo aplicaciones:', beforeAppsResponse.data);
            return;
        }
        
        const applicationsBefore = beforeAppsResponse.data;
        console.log(`✅ Aplicaciones antes: ${applicationsBefore.length}`);
        
        // 4. APLICAR A LA OFERTA
        console.log('\n4. 🚀 APLICAR A LA OFERTA');
        const applyResponse = await makeRequest(`${API_BASE}/api/applications/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                offerId: targetOffer.id,
                message: 'Estoy muy interesado en esta oferta de prácticas. Creo que mi perfil encaja perfectamente.'
            }
        });
        
        console.log(`📤 Respuesta de aplicación: ${applyResponse.statusCode}`);
        
        if (applyResponse.statusCode !== 200 && applyResponse.statusCode !== 201) {
            console.error('❌ Error aplicando:', applyResponse.data);
            return;
        }
        
        console.log('✅ Aplicación enviada exitosamente');
        console.log('📄 Datos de la aplicación:', applyResponse.data);
        
        // 5. VERIFICAR APLICACIONES DESPUÉS DE APLICAR
        console.log('\n5. 🔍 VERIFICAR APLICACIONES DESPUÉS DE APLICAR');
        const afterAppsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (afterAppsResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo aplicaciones después:', afterAppsResponse.data);
            return;
        }
        
        const applicationsAfter = afterAppsResponse.data;
        console.log(`✅ Aplicaciones después: ${applicationsAfter.length}`);
        
        // 6. RESULTADO FINAL
        console.log('\n6. 🎯 RESULTADO FINAL');
        console.log('='.repeat(50));
        
        console.log('📊 RESUMEN:');
        console.log(`• Aplicaciones antes: ${applicationsBefore.length}`);
        console.log(`• Aplicaciones después: ${applicationsAfter.length}`);
        console.log(`• Diferencia: ${applicationsAfter.length - applicationsBefore.length}`);
        
        // Verificar si la aplicación está en la lista
        const appliedToTargetOffer = applicationsAfter.find(app => app.offerId === targetOffer.id);
        
        if (appliedToTargetOffer) {
            console.log('\n🎉 ¡PROBLEMA RESUELTO!');
            console.log('✅ La aplicación aparece correctamente en "mis aplicaciones"');
            console.log('📋 Detalles de la aplicación:');
            console.log(`   • ID: ${appliedToTargetOffer.id}`);
            console.log(`   • Oferta: ${appliedToTargetOffer.offerId}`);
            console.log(`   • Estado: ${appliedToTargetOffer.status}`);
            console.log(`   • Fecha: ${appliedToTargetOffer.createdAt}`);
            console.log(`   • Mensaje: ${appliedToTargetOffer.message?.substring(0, 50)}...`);
        } else {
            console.log('\n❌ PROBLEMA PERSISTE');
            console.log('La aplicación NO aparece en "mis aplicaciones"');
            console.log('🔍 Aplicaciones encontradas:');
            applicationsAfter.forEach(app => {
                console.log(`   • Oferta ${app.offerId}: ${app.status}`);
            });
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🏁 FIN DEL TEST');
        
    } catch (error) {
        console.error('❌ Error en el test:', error.message);
        console.error('Stack:', error.stack);
    }
}

console.log('🚀 Iniciando test completo del flujo de aplicaciones...');
testCompleteApplicationFlow();
