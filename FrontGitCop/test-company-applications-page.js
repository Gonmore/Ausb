// Test para verificar que el endpoint /api/applications/company funciona correctamente
async function testCompanyApplicationsEndpoint() {
  try {
    console.log('=== TEST: Endpoint /api/applications/company ===');
    
    // Primero, hacer login con la empresa
    const loginResponse = await fetch('http://localhost:5000/login', {
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
      console.error('❌ Error en login:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso:', {
      userId: loginData.user.id,
      name: loginData.user.name,
      role: loginData.user.role
    });
    
    // Luego, obtener las aplicaciones de la empresa
    const applicationsResponse = await fetch('http://localhost:5000/api/applications/company', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!applicationsResponse.ok) {
      console.error('❌ Error en aplicaciones:', await applicationsResponse.text());
      return;
    }
    
    const applications = await applicationsResponse.json();
    console.log('✅ Aplicaciones recibidas:', applications.length);
    
    if (applications.length > 0) {
      console.log('\n=== PRIMERA APLICACIÓN ===');
      console.log('ID:', applications[0].id);
      console.log('Status:', applications[0].status);
      console.log('Fecha:', applications[0].appliedAt);
      console.log('Estudiante:', applications[0].Student?.User?.name, applications[0].Student?.User?.surname);
      console.log('Oferta:', applications[0].offer?.name);
      console.log('Estructura completa:', JSON.stringify(applications[0], null, 2));
    } else {
      console.log('⚠️  No hay aplicaciones encontradas');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar el test
testCompanyApplicationsEndpoint();
