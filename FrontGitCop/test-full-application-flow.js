// Test para verificar el flujo completo: empresa crea oferta → estudiante aplica → empresa ve aplicación
const API_BASE = 'http://localhost:5000';

async function testFullApplicationFlow() {
  console.log('🧪 Iniciando test completo del flujo de aplicaciones...\n');

  try {
    // 1. Login como empresa y crear oferta
    console.log('1️⃣ Login como empresa y crear oferta...');
    const companyLoginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'company1@example.com',
        password: 'password123'
      })
    });

    const companyLoginData = await companyLoginResponse.json();
    const companyToken = companyLoginData.token;
    console.log('✅ Empresa logueada:', companyLoginData.user.username);

    // Crear una oferta específica para test
    const newOffer = {
      name: 'Test Oferta - Desarrollador React',
      description: 'Oferta de prueba para test de aplicaciones',
      requisites: 'React, JavaScript',
      location: 'Madrid',
      type: 'full-time',
      mode: 'Presencial',
      period: '12 meses',
      schedule: 'Lunes a Viernes 9:00-18:00',
      min_hr: 40,
      car: false,
      sector: 'Tecnología',
      tag: 'React, Test',
      jobs: 'Desarrollo frontend',
      profamilyId: 1
    };

    const createOfferResponse = await fetch(`${API_BASE}/api/offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${companyToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newOffer)
    });

    const createdOffer = await createOfferResponse.json();
    console.log(`✅ Oferta creada: "${createdOffer.name}" (ID: ${createdOffer.id})`);

    // 2. Login como estudiante y aplicar a la oferta
    console.log('\n2️⃣ Login como estudiante y aplicar...');
    const studentLoginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'student@example.com',
        password: 'password123'
      })
    });

    const studentLoginData = await studentLoginResponse.json();
    const studentToken = studentLoginData.token;
    console.log('✅ Estudiante logueado:', studentLoginData.user.username);

    // Aplicar a la oferta
    const applyResponse = await fetch(`${API_BASE}/api/applications`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${studentToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        offerId: createdOffer.id,
        message: `Aplicación de prueba a ${createdOffer.name}`
      })
    });

    if (applyResponse.ok) {
      const applyData = await applyResponse.json();
      console.log('✅ Aplicación enviada exitosamente');
    } else {
      const errorText = await applyResponse.text();
      console.log('❌ Error al aplicar:', errorText);
    }

    // 3. Verificar que la aplicación se guardó
    console.log('\n3️⃣ Verificando aplicación en base de datos...');
    const studentAppsResponse = await fetch(`${API_BASE}/api/applications/user`, {
      headers: { 'Authorization': `Bearer ${studentToken}` }
    });

    const studentApps = await studentAppsResponse.json();
    console.log(`📋 Aplicaciones del estudiante: ${studentApps.length}`);
    
    const testApp = studentApps.find(app => app.offerId === createdOffer.id);
    if (testApp) {
      console.log(`✅ Aplicación encontrada en perfil estudiante`);
      console.log(`   - ID: ${testApp.id}`);
      console.log(`   - Status: ${testApp.status}`);
      console.log(`   - OfferId: ${testApp.offerId}`);
      console.log(`   - CompanyId: ${testApp.companyId}`);
    } else {
      console.log('❌ Aplicación NO encontrada en perfil estudiante');
    }

    // 4. Login como empresa y verificar aplicaciones recibidas
    console.log('\n4️⃣ Verificando aplicaciones recibidas por empresa...');
    const companyAppsResponse = await fetch(`${API_BASE}/api/applications/company`, {
      headers: { 'Authorization': `Bearer ${companyToken}` }
    });

    console.log(`📊 Status: ${companyAppsResponse.status} ${companyAppsResponse.statusText}`);

    if (companyAppsResponse.ok) {
      const companyApps = await companyAppsResponse.json();
      console.log(`📋 Aplicaciones recibidas por empresa: ${companyApps.length}`);
      
      const testAppForCompany = companyApps.find(app => app.offerId === createdOffer.id);
      if (testAppForCompany) {
        console.log('✅ Aplicación encontrada en panel de empresa');
        console.log(`   - ID: ${testAppForCompany.id}`);
        console.log(`   - Oferta: ${testAppForCompany.Offer?.name || 'Sin nombre'}`);
        console.log(`   - Estudiante: ${testAppForCompany.Student?.userId || 'Sin estudiante'}`);
      } else {
        console.log('❌ Aplicación NO encontrada en panel de empresa');
        console.log('📋 Aplicaciones existentes:');
        companyApps.forEach((app, index) => {
          console.log(`   ${index + 1}. OfferId: ${app.offerId}, Status: ${app.status}`);
        });
      }
    } else {
      const errorText = await companyAppsResponse.text();
      console.log('❌ Error obteniendo aplicaciones de empresa:', errorText);
    }

    console.log('\n🎉 Test completo terminado');

  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
  }
}

testFullApplicationFlow();
