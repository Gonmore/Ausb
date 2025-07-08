// Test script para probar el flujo de aplicación a ofertas
const API_BASE = 'http://localhost:5000';

async function testApplyFlow() {
  console.log('🧪 Iniciando test del flujo de aplicación a ofertas...\n');

  try {
    // 1. Login como estudiante
    console.log('1️⃣ Haciendo login como estudiante...');
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    console.log(`📋 Usuario: ${loginData.user.username} (${loginData.user.role})`);
    
    const token = loginData.token;
    console.log(`🔑 Token: ${token ? 'Obtenido' : 'No encontrado'}\n`);

    if (!token) {
      throw new Error('No se obtuvo token del login');
    }

    // 2. Obtener ofertas disponibles
    console.log('2️⃣ Obteniendo ofertas disponibles...');
    const offersResponse = await fetch(`${API_BASE}/api/offers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!offersResponse.ok) {
      throw new Error(`Get offers failed: ${offersResponse.status} ${offersResponse.statusText}`);
    }

    const offers = await offersResponse.json();
    console.log(`✅ Ofertas obtenidas: ${offers.length} disponibles`);
    
    if (offers.length === 0) {
      throw new Error('No hay ofertas disponibles para aplicar');
    }

    const firstOffer = offers[0];
    console.log(`🎯 Seleccionada oferta: "${firstOffer.name}" (ID: ${firstOffer.id})\n`);

    // 3. Aplicar a la primera oferta
    console.log('3️⃣ Aplicando a la oferta...');
    const applyResponse = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        offerId: firstOffer.id,
        message: `Aplicación de prueba a ${firstOffer.name}`
      })
    });

    console.log(`📊 Status de aplicación: ${applyResponse.status} ${applyResponse.statusText}`);
    
    if (!applyResponse.ok) {
      const errorText = await applyResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`Apply failed: ${applyResponse.status} ${applyResponse.statusText}\nResponse: ${errorText}`);
    }

    const applyData = await applyResponse.json();
    console.log('✅ Aplicación exitosa');
    console.log(`📋 Respuesta: ${applyData.message}\n`);

    // 4. Verificar que la aplicación se guardó
    console.log('4️⃣ Verificando aplicaciones del usuario...');
    const userAppsResponse = await fetch(`${API_BASE}/api/applications/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!userAppsResponse.ok) {
      throw new Error(`Get user applications failed: ${userAppsResponse.status} ${userAppsResponse.statusText}`);
    }

    const userApps = await userAppsResponse.json();
    console.log(`✅ Aplicaciones del usuario: ${userApps.length}`);
    
    if (userApps.length > 0) {
      const lastApp = userApps[userApps.length - 1];
      console.log(`📋 Última aplicación: ${lastApp.Offer?.name || 'Sin nombre'} - ${lastApp.status}`);
    }

    console.log('\n🎉 ¡Test del flujo de aplicación completado exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el test
if (require.main === module) {
  testApplyFlow();
}

module.exports = { testApplyFlow };
