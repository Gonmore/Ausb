// Test para verificar que el endpoint de aplicaciones de empresa funciona correctamente
const API_BASE = 'http://localhost:5000';

async function testCompanyApplicationsEndpoint() {
  console.log('🧪 Probando endpoint de aplicaciones de empresa...\n');

  try {
    // 1. Login como empresa
    console.log('1️⃣ Haciendo login como empresa...');
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
    console.log(`📋 Usuario: ${loginData.user.username} (ID: ${loginData.user.id})`);
    
    const token = loginData.token;

    // 2. Probar el endpoint corregido
    console.log('\n2️⃣ Probando GET /api/applications/company...');
    const applicationsResponse = await fetch(`${API_BASE}/api/applications/company`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log(`📊 Status: ${applicationsResponse.status} ${applicationsResponse.statusText}`);

    if (!applicationsResponse.ok) {
      const errorText = await applicationsResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`Get applications failed: ${applicationsResponse.status}`);
    }

    const applications = await applicationsResponse.json();
    console.log(`✅ Aplicaciones obtenidas: ${applications.length}`);
    
    applications.forEach((app, index) => {
      console.log(`\n${index + 1}. Aplicación ID: ${app.id}`);
      console.log(`   - Estado: ${app.status}`);
      console.log(`   - Fecha: ${new Date(app.appliedAt).toLocaleDateString()}`);
      console.log(`   - Oferta: ${app.Offer?.name || 'Sin nombre'}`);
      console.log(`   - Estudiante: ${app.Student?.User?.name || 'Sin nombre'} ${app.Student?.User?.surname || ''}`);
      console.log(`   - Email: ${app.Student?.User?.email || 'Sin email'}`);
      console.log(`   - Curso: ${app.Student?.grade || 'Sin curso'}`);
      if (app.message) {
        console.log(`   - Mensaje: ${app.message}`);
      }
    });

    console.log('\n🎉 ¡Test del endpoint de aplicaciones completado!');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
  }
}

// Ejecutar el test
if (require.main === module) {
  testCompanyApplicationsEndpoint();
}

module.exports = { testCompanyApplicationsEndpoint };
