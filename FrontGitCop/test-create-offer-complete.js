// Test script para probar la creación de ofertas completa con familias profesionales
const API_BASE = 'http://localhost:5000';

async function testCreateOfferComplete() {
  console.log('🧪 Iniciando test completo de creación de ofertas...\n');

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

    // 2. Obtener familias profesionales
    console.log('2️⃣ Obteniendo familias profesionales...');
    const profamiliesResponse = await fetch(`${API_BASE}/api/profamilies`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!profamiliesResponse.ok) {
      throw new Error(`Get profamilies failed: ${profamiliesResponse.status} ${profamiliesResponse.statusText}`);
    }

    const profamilies = await profamiliesResponse.json();
    console.log(`✅ Familias profesionales obtenidas: ${profamilies.length}`);
    
    if (profamilies.length > 0) {
      console.log(`🎯 Primera familia: "${profamilies[0].name}" (ID: ${profamilies[0].id})`);
    }

    // 3. Crear nueva oferta con todos los campos
    console.log('\n3️⃣ Creando nueva oferta...');
    const newOffer = {
      name: 'Desarrollador Full Stack con React y Node.js',
      description: 'Buscamos un desarrollador full stack para proyectos innovadores usando React en el frontend y Node.js en el backend.',
      requisites: 'Experiencia con React, Node.js, bases de datos SQL y NoSQL, Git',
      location: 'Madrid, España',
      type: 'full-time',
      mode: 'Híbrido',
      period: '12 meses',
      schedule: 'Lunes a Viernes 9:00-18:00',
      min_hr: 40,
      car: false,
      sector: 'Tecnología',
      tag: 'React, Node.js, JavaScript, Full Stack',
      jobs: 'Desarrollo de aplicaciones web, APIs REST, integración de bases de datos, colaboración en equipo',
      profamilyId: profamilies.length > 0 ? profamilies[0].id : 1
    };

    const createResponse = await fetch(`${API_BASE}/api/offers`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newOffer)
    });

    console.log(`📊 Status de creación: ${createResponse.status} ${createResponse.statusText}`);
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.log(`❌ Error response: ${errorText}`);
      throw new Error(`Create offer failed: ${createResponse.status} ${createResponse.statusText}`);
    }

    const createdOffer = await createResponse.json();
    console.log('✅ Oferta creada exitosamente');
    console.log(`📋 ID: ${createdOffer.id}`);
    console.log(`📋 Nombre: ${createdOffer.name}`);
    console.log(`📋 CompanyId: ${createdOffer.companyId}`);
    console.log(`📋 ProfamilyId: ${createdOffer.profamilyId}`);

    // 4. Verificar que la oferta aparece en la lista
    console.log('\n4️⃣ Verificando que la oferta aparece en la lista...');
    const offersResponse = await fetch(`${API_BASE}/api/offers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!offersResponse.ok) {
      throw new Error(`Get offers failed: ${offersResponse.status} ${offersResponse.statusText}`);
    }

    const offers = await offersResponse.json();
    const newOfferInList = offers.find(offer => offer.id === createdOffer.id);
    
    if (newOfferInList) {
      console.log('✅ La oferta aparece en la lista');
      console.log(`📋 Empresa asociada: ${newOfferInList.company?.name || 'Sin nombre'}`);
      console.log(`📋 Familia profesional: ${newOfferInList.profamily?.name || 'Sin nombre'}`);
    } else {
      console.log('❌ La oferta NO aparece en la lista');
    }

    console.log('\n🎉 ¡Test completo de creación de ofertas completado exitosamente!');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Ejecutar el test
if (require.main === module) {
  testCreateOfferComplete();
}

module.exports = { testCreateOfferComplete };
