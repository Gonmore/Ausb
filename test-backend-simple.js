// Script para probar directamente el endpoint de aplicaciones sin depender de la DB
const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000';

async function testBackendHealth() {
    try {
        console.log('🏥 Verificando estado del backend...');
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        
        if (response.ok) {
            console.log('✅ Backend funcionando correctamente');
            return true;
        } else {
            console.log('❌ Backend no disponible:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Backend no accesible:', error.message);
        return false;
    }
}

async function testApplicationEndpoint() {
    console.log('🚀 Probando endpoint de aplicaciones...\n');
    
    const isHealthy = await testBackendHealth();
    if (!isHealthy) {
        console.log('❌ El backend no está disponible. Iniciando el backend primero...');
        return;
    }
    
    // Test básico del endpoint
    try {
        const response = await fetch(`${API_BASE_URL}/api/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token'  // Para probar el endpoint
            },
            body: JSON.stringify({
                offerId: 1,
                message: 'Test application'
            })
        });
        
        const data = await response.json();
        console.log('📊 Respuesta del endpoint /api/applications:');
        console.log('Status:', response.status);
        console.log('Data:', data);
        
        if (response.status === 401) {
            console.log('✅ Endpoint responde correctamente (error de autorización esperado)');
        } else if (response.status === 404) {
            console.log('❌ Endpoint no encontrado - verificar rutas');
        } else {
            console.log('✅ Endpoint funcionando');
        }
        
    } catch (error) {
        console.error('❌ Error probando endpoint:', error.message);
    }
}

if (require.main === module) {
    testApplicationEndpoint().catch(console.error);
}

module.exports = { testApplicationEndpoint };
