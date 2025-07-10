// Test directo del endpoint de familias profesionales
const API_BASE = 'http://localhost:5000';

async function testProfamiliesEndpoint() {
  console.log('🔍 Probando endpoint de familias profesionales...\n');

  try {
    // 1. Login como empresa para obtener token
    console.log('1️⃣ Haciendo login...');
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'company1@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    
    const token = loginData.token;
    console.log(`🔑 Token obtenido: ${token ? 'Sí' : 'No'}\n`);

    // 2. Probar GET /api/profamilies
    console.log('2️⃣ Probando GET /api/profamilies...');
    const profamiliesResponse = await fetch(`${API_BASE}/api/profamilies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`📊 Status: ${profamiliesResponse.status} ${profamiliesResponse.statusText}`);
    console.log(`📋 Content-Type: ${profamiliesResponse.headers.get('content-type')}`);
    
    if (!profamiliesResponse.ok) {
      const errorText = await profamiliesResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`Get profamilies failed: ${profamiliesResponse.status} ${profamiliesResponse.statusText}`);
    }

    const profamiliesData = await profamiliesResponse.json();
    console.log(`✅ Familias profesionales obtenidas: ${profamiliesData.length}`);
    
    if (profamiliesData.length > 0) {
      console.log('📋 Primera familia profesional:');
      console.log(`   - ID: ${profamiliesData[0].id}`);
      console.log(`   - Nombre: ${profamiliesData[0].name}`);
      console.log(`   - Descripción: ${profamiliesData[0].description}`);
    }

  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

testProfamiliesEndpoint();
