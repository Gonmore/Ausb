// Test simple para verificar el flujo de aplicaciones
const axios = require('axios');

const API_BASE = 'http://localhost:5000';

async function testApplicationFlow() {
    try {
        console.log('🔍 Probando flujo de aplicaciones...\n');
        
        // 1. Login como estudiante
        console.log('1. Haciendo login como estudiante...');
        const loginResponse = await axios.post(`${API_BASE}/login`, {
            email: 'estudiante@test.com',
            password: 'password123'
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Login exitoso');
        
        // 2. Obtener ofertas disponibles
        console.log('2. Obteniendo ofertas disponibles...');
        const offersResponse = await axios.get(`${API_BASE}/api/offers`);
        const offers = offersResponse.data;
        
        if (offers.length === 0) {
            console.log('⚠️ No hay ofertas disponibles');
            return;
        }
        
        const firstOffer = offers[0];
        console.log(`✅ Encontradas ${offers.length} ofertas. Usando oferta: ${firstOffer.title}`);
        
        // 3. Aplicar a la oferta
        console.log('3. Aplicando a la oferta...');
        const applyResponse = await axios.post(
            `${API_BASE}/api/applications/apply`,
            {
                offerId: firstOffer.id,
                coverLetter: 'Carta de presentación de prueba'
            },
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        console.log('✅ Aplicación enviada:', applyResponse.data);
        
        // 4. Verificar que la aplicación aparece en "mis aplicaciones"
        console.log('4. Verificando mis aplicaciones...');
        const myApplicationsResponse = await axios.get(
            `${API_BASE}/api/applications/user`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        
        const myApplications = myApplicationsResponse.data;
        console.log(`✅ Mis aplicaciones (${myApplications.length}):`, myApplications);
        
        // 5. Verificar si la aplicación está en la lista
        const appliedOffer = myApplications.find(app => app.offerId === firstOffer.id);
        if (appliedOffer) {
            console.log('🎉 ¡ÉXITO! La aplicación aparece en "mis aplicaciones"');
            console.log('Detalles:', appliedOffer);
        } else {
            console.log('❌ PROBLEMA: La aplicación NO aparece en "mis aplicaciones"');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testApplicationFlow();
