// Test para verificar aplicaciones del estudiante
const API_BASE = 'http://localhost:5000';

async function testStudentApplications() {
  console.log('🧪 Verificando aplicaciones del estudiante...\n');

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

    // 2. Obtener aplicaciones del usuario
    console.log('2️⃣ Obteniendo aplicaciones del usuario...');
    const userAppsResponse = await fetch(`${API_BASE}/api/applications/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log(`📊 Status: ${userAppsResponse.status} ${userAppsResponse.statusText}`);

    if (!userAppsResponse.ok) {
      const errorText = await userAppsResponse.text();
      console.log(`❌ Error: ${errorText}`);
      return;
    }

    const userApps = await userAppsResponse.json();
    console.log(`✅ Aplicaciones encontradas: ${userApps.length}\n`);

    if (userApps.length === 0) {
      console.log('ℹ️ No hay aplicaciones registradas para este usuario');
    } else {
      console.log('📋 Detalles de las aplicaciones:');
      userApps.forEach((app, index) => {
        console.log(`\n   ${index + 1}. ID: ${app.id}`);
        console.log(`      Oferta: ${app.offer?.name || app.Offer?.name || 'Sin nombre'}`);
        console.log(`      Empresa: ${app.offer?.company?.name || app.Offer?.company?.name || 'Sin empresa'}`);
        console.log(`      Estado: ${app.status}`);
        console.log(`      Fecha: ${app.appliedAt || app.createdAt}`);
        console.log(`      Mensaje: ${app.message || 'Sin mensaje'}`);
      });
    }

    // 3. También obtener todas las ofertas para referencia
    console.log('\n3️⃣ Obteniendo ofertas disponibles para referencia...');
    const offersResponse = await fetch(`${API_BASE}/api/offers`);
    
    if (offersResponse.ok) {
      const offers = await offersResponse.json();
      console.log(`✅ Ofertas disponibles: ${offers.length}\n`);
      
      if (offers.length > 0) {
        console.log('📋 Primeras ofertas:');
        offers.slice(0, 3).forEach((offer, index) => {
          console.log(`   ${index + 1}. ${offer.name} (ID: ${offer.id}) - ${offer.company?.name || 'Sin empresa'}`);
        });
      }
    }

    console.log('\n🎉 Verificación completada');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }
}

testStudentApplications();
