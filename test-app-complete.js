// Script simple para probar el login
const https = require('https');

// Configurar para ignorar certificados autofirmados en desarrollo
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

async function testLogin() {
    console.log('🔐 Probando login...');
    
    try {
        const response = await fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'admin@mail.com',
                password: 'password123'
            })
        });

        const data = await response.json();
        console.log('📊 Response status:', response.status);
        console.log('📋 Response data:', data);
        
        if (response.ok && data.token) {
            console.log('✅ Login exitoso');
            console.log('🔑 Token:', data.token);
            return data.token;
        } else {
            console.log('❌ Login falló');
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
        return null;
    }
}

async function testApplicationAPI(token) {
    console.log('\n📝 Probando endpoint de aplicaciones...');
    
    try {
        // Primero obtener ofertas
        const offersResponse = await fetch('http://localhost:5000/api/offers');
        const offers = await offersResponse.json();
        console.log('📋 Ofertas disponibles:', offers.length);
        
        if (offers.length === 0) {
            console.log('❌ No hay ofertas para probar');
            return;
        }
        
        // Probar aplicar a la primera oferta
        const firstOffer = offers[0];
        console.log('🎯 Aplicando a oferta:', firstOffer.name);
        
        const applicationResponse = await fetch('http://localhost:5000/api/applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                offerId: firstOffer.id,
                message: 'Test de aplicación desde script'
            })
        });

        const applicationData = await applicationResponse.json();
        console.log('📊 Application response status:', applicationResponse.status);
        console.log('📋 Application response data:', applicationData);
        
        if (applicationResponse.ok) {
            console.log('✅ Aplicación enviada exitosamente');
            return applicationData;
        } else {
            console.log('❌ Error enviando aplicación');
            return null;
        }
    } catch (error) {
        console.error('❌ Error en test de aplicaciones:', error.message);
        return null;
    }
}

async function testGetUserApplications(token) {
    console.log('\n📑 Probando obtener aplicaciones del usuario...');
    
    try {
        // Necesitamos obtener el userId del token o usar un ID conocido
        // Para este test, vamos a usar el ID 1 (primer usuario)
        const response = await fetch('http://localhost:5000/api/applications/user/1', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log('📊 User applications response status:', response.status);
        console.log('📋 User applications data:', data);
        
        if (response.ok) {
            console.log('✅ Aplicaciones del usuario obtenidas');
            console.log('📊 Total de aplicaciones:', Array.isArray(data) ? data.length : 'No es array');
            return data;
        } else {
            console.log('❌ Error obteniendo aplicaciones del usuario');
            return null;
        }
    } catch (error) {
        console.error('❌ Error obteniendo aplicaciones:', error.message);
        return null;
    }
}

async function runFullTest() {
    console.log('🚀 Iniciando test completo del sistema de aplicaciones...\n');
    
    // 1. Test de login
    const token = await testLogin();
    if (!token) {
        console.log('❌ Test fallido: No se pudo obtener token');
        return;
    }
    
    // 2. Test de aplicación
    const application = await testApplicationAPI(token);
    
    // 3. Test de obtener aplicaciones
    const userApplications = await testGetUserApplications(token);
    
    console.log('\n📊 Resumen del test:');
    console.log('- Login:', token ? '✅' : '❌');
    console.log('- Aplicar a oferta:', application ? '✅' : '❌');
    console.log('- Obtener aplicaciones:', userApplications ? '✅' : '❌');
    
    if (application && userApplications) {
        console.log('\n🎉 ¡Todos los tests pasaron! El sistema de aplicaciones funciona correctamente.');
    } else {
        console.log('\n⚠️ Algunos tests fallaron. Revisar logs arriba.');
    }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
    runFullTest().catch(console.error);
}

module.exports = { testLogin, testApplicationAPI, testGetUserApplications };
