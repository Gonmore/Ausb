// Test para crear usuario y probar flujo de aplicaciones
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
        
        // 0. Crear usuario de prueba (estudiante)
        console.log('0. Creando usuario de prueba...');
        const registerResponse = await makeRequest(`${API_BASE}/register`, {
            method: 'POST',
            body: {
                email: 'test.student@example.com',
                password: 'password123',
                role: 'student',
                name: 'Test Student'
            }
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
        console.log('✅ Login exitoso');
        
        // 2. Obtener ofertas disponibles
        console.log('2. Obteniendo ofertas disponibles...');
        const offersResponse = await makeRequest(`${API_BASE}/api/offers`);
        
        if (offersResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo ofertas:', offersResponse.data);
            return;
        }
        
        const offers = offersResponse.data;
        
        if (offers.length === 0) {
            console.log('⚠️ No hay ofertas disponibles. Creando una oferta de prueba...');
            
            // Crear una oferta de prueba
            const offerResponse = await makeRequest(`${API_BASE}/api/offers`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: {
                    title: 'Oferta de Prueba',
                    description: 'Descripción de prueba',
                    location: 'Test Location',
                    type: 'full-time',
                    salary: 50000
                }
            });
            
            if (offerResponse.statusCode === 201) {
                console.log('✅ Oferta de prueba creada');
                offers.push(offerResponse.data);
            } else {
                console.error('❌ Error creando oferta:', offerResponse.data);
                return;
            }
        }
        
        const firstOffer = offers[0];
        console.log(`✅ Encontradas ${offers.length} ofertas. Usando oferta: ${firstOffer.title}`);
        
        // 3. Aplicar a la oferta
        console.log('3. Aplicando a la oferta...');
        const applyResponse = await makeRequest(`${API_BASE}/api/applications/apply`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: {
                offerId: firstOffer.id,
                coverLetter: 'Carta de presentación de prueba'
            }
        });
        
        if (applyResponse.statusCode !== 200 && applyResponse.statusCode !== 201) {
            console.error('❌ Error aplicando:', applyResponse.data);
            return;
        }
        
        console.log('✅ Aplicación enviada:', applyResponse.data);
        
        // 4. Verificar que la aplicación aparece en "mis aplicaciones"
        console.log('4. Verificando mis aplicaciones...');
        const myApplicationsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (myApplicationsResponse.statusCode !== 200) {
            console.error('❌ Error obteniendo mis aplicaciones:', myApplicationsResponse.data);
            return;
        }
        
        const myApplications = myApplicationsResponse.data;
        console.log(`✅ Mis aplicaciones (${myApplications.length}):`);
        
        if (myApplications.length > 0) {
            myApplications.forEach((app, index) => {
                console.log(`  ${index + 1}. Oferta ID: ${app.offerId}, Status: ${app.status}, Fecha: ${app.createdAt}`);
            });
        }
        
        // 5. Verificar si la aplicación está en la lista
        const appliedOffer = myApplications.find(app => app.offerId === firstOffer.id);
        if (appliedOffer) {
            console.log('🎉 ¡ÉXITO! La aplicación aparece en "mis aplicaciones"');
            console.log('Detalles:', {
                id: appliedOffer.id,
                offerId: appliedOffer.offerId,
                status: appliedOffer.status,
                coverLetter: appliedOffer.coverLetter,
                createdAt: appliedOffer.createdAt
            });
        } else {
            console.log('❌ PROBLEMA: La aplicación NO aparece en "mis aplicaciones"');
            console.log('Buscando oferta con ID:', firstOffer.id);
            console.log('Aplicaciones encontradas:', myApplications.map(app => ({
                id: app.id,
                offerId: app.offerId,
                status: app.status
            })));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testApplicationFlow();
