// Test final para verificar el flujo de aplicaciones
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

async function testApplicationFlow() {
    try {
        console.log('🔍 Probando flujo de aplicaciones...\n');
        
        // 0. Crear usuario estudiante
        console.log('0. Creando usuario estudiante...');
        const studentData = {
            username: 'teststudent',
            email: 'test.student@example.com',
            password: 'password123',
            role: 'student',
            name: 'Test',
            surname: 'Student'
        };
        
        const registerResponse = await makeRequest(`${API_BASE}/register`, {
            method: 'POST',
            body: studentData
        });
        
        if (registerResponse.statusCode === 201) {
            console.log('✅ Usuario creado exitosamente');
        } else if (registerResponse.statusCode === 400 && registerResponse.data.message?.includes('ya existe')) {
            console.log('✅ Usuario ya existe, continuando...');
        } else {
            console.error('❌ Error creando usuario:', registerResponse.data);
            return;
        }
        
        // 1. Login como estudiante
        console.log('1. Haciendo login como estudiante...');
        const loginResponse = await makeRequest(`${API_BASE}/login`, {
            method: 'POST',
            body: {
                email: 'test.student@example.com',
                password: 'password123'
            }
        });
        
        if (loginResponse.statusCode !== 200) {
            console.error('❌ Error en login:', loginResponse.data);
            return;
        }
        
        const token = loginResponse.data.token;
        const userId = loginResponse.data.user.id;
        console.log('✅ Login exitoso. UserID:', userId);
        
        // 2. Obtener ofertas disponibles
        console.log('2. Obteniendo ofertas disponibles...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        const firstOffer = offers[0];
        console.log(`✅ Encontradas ${offers.length} ofertas. Usando oferta: ${firstOffer.name} (ID: ${firstOffer.id})`);
        
        // 3. Verificar aplicaciones ANTES de aplicar
        console.log('3. Verificando aplicaciones antes de aplicar...');
        const beforeAppsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (beforeAppsResponse.statusCode === 200) {
            console.log(`✅ Aplicaciones antes: ${beforeAppsResponse.data.length}`);
        } else {
            console.error('❌ Error obteniendo aplicaciones antes:', beforeAppsResponse.data);
        }
        
        // 4. Aplicar a la oferta
        console.log('4. Aplicando a la oferta...');
        const applyResponse = await makeRequest(`${API_BASE}/api/applications/`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                offerId: firstOffer.id,
                coverLetter: 'Carta de presentación de prueba para el flujo de aplicaciones'
            }
        });
        
        console.log('Apply response status:', applyResponse.statusCode);
        console.log('Apply response data:', applyResponse.data);
        
        if (applyResponse.statusCode !== 200 && applyResponse.statusCode !== 201) {
            console.error('❌ Error aplicando:', applyResponse.data);
            return;
        }
        
        console.log('✅ Aplicación enviada exitosamente');
        
        // 5. Verificar aplicaciones DESPUÉS de aplicar
        console.log('5. Verificando aplicaciones después de aplicar...');
        const afterAppsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (afterAppsResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo aplicaciones después:', afterAppsResponse.data);
            return;
        }
        
        const myApplications = afterAppsResponse.data;
        console.log(`✅ Aplicaciones después: ${myApplications.length}`);
        
        if (myApplications.length > 0) {
            console.log('📋 Detalles de las aplicaciones:');
            myApplications.forEach((app, index) => {
                console.log(`  ${index + 1}. ID: ${app.id}, Oferta: ${app.offerId}, Status: ${app.status}`);
                console.log(`     Fecha: ${app.createdAt}`);
                console.log(`     Carta: ${app.coverLetter?.substring(0, 50)}...`);
            });
        }
        
        // 6. Verificar si la aplicación específica está en la lista
        const appliedOffer = myApplications.find(app => app.offerId === firstOffer.id);
        if (appliedOffer) {
            console.log('\n🎉 ¡ÉXITO! La aplicación aparece en "mis aplicaciones"');
            console.log('✅ PROBLEMA RESUELTO: Las aplicaciones se muestran correctamente');
        } else {
            console.log('\n❌ PROBLEMA PERSISTENTE: La aplicación NO aparece en "mis aplicaciones"');
            console.log('🔍 Buscando oferta con ID:', firstOffer.id);
            console.log('🔍 IDs de aplicaciones encontradas:', myApplications.map(app => app.offerId));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
    }
}

console.log('🚀 Iniciando test del flujo de aplicaciones...');
testApplicationFlow();
