// Test script para probar la creación de ofertas por empresa
const API_BASE = 'http://localhost:5000';

async function testCreateOffer() {
  console.log('🧪 Iniciando test de creación de ofertas por empresa...\n');

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
    console.log(`📋 Usuario: ${loginData.user.username} (${loginData.user.role})`);
    
    const token = loginData.token;
    console.log(`🔑 Token: ${token ? 'Obtenido' : 'No encontrado'}\n`);

    if (!token) {
      throw new Error('No se obtuvo token del login');
    }

    // 2. Intentar crear una oferta
    console.log('2️⃣ Creando nueva oferta...');
    const offerData = {
      name: 'Prácticas Desarrollo Full Stack',
      location: 'Madrid',
      mode: 'Híbrido',
      type: 'internship',
      period: '6 meses',
      schedule: 'Mañana (9:00-15:00)',
      min_hr: 300,
      car: false,
      sector: 'Tecnología',
      tag: 'JavaScript, React, Node.js',
      description: 'Prácticas en desarrollo full stack con tecnologías modernas. Trabajarás en proyectos reales y aprenderás las mejores prácticas de desarrollo.',
      jobs: 'Desarrollo de aplicaciones web, APIs REST, testing',
      requisites: 'Conocimientos básicos de JavaScript, HTML, CSS. Ganas de aprender',
      profamilyId: 1
    };

    const createResponse = await fetch(`${API_BASE}/api/offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(offerData)
    });

    console.log(`📊 Status de creación: ${createResponse.status} ${createResponse.statusText}`);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`Create offer failed: ${createResponse.status} ${createResponse.statusText}\nResponse: ${errorText}`);
    }

    const createdOffer = await createResponse.json();
    console.log('✅ Oferta creada exitosamente');
    console.log(`📋 ID: ${createdOffer.id}`);
    console.log(`📋 Nombre: ${createdOffer.name}`);
    console.log(`📋 CompanyId: ${createdOffer.companyId}\n`);

    // 3. Verificar que la oferta aparece en la lista
    console.log('3️⃣ Verificando que la oferta aparece en la lista...');
    const offersResponse = await fetch(`${API_BASE}/api/offers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!offersResponse.ok) {
      throw new Error(`Get offers failed: ${offersResponse.status} ${offersResponse.statusText}`);
    }

    const offers = await offersResponse.json();
    const newOffer = offers.find(offer => offer.id === createdOffer.id);
    
    if (newOffer) {
      console.log('✅ La oferta aparece en la lista');
      console.log(`📋 Empresa asociada: ${newOffer.company?.name || 'No encontrada'}`);
    } else {
      console.log('❌ La oferta no aparece en la lista');
    }

    console.log('\n🎉 ¡Test de creación de ofertas completado!');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el test
if (require.main === module) {
  testCreateOffer();
}

module.exports = { testCreateOffer };
