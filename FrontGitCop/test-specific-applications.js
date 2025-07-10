// Test para verificar aplicaciones específicas en la base de datos
async function testSpecificApplications() {
  try {
    console.log('=== TEST: Verificar aplicaciones específicas ===');
    
    // Login como empresa
    const loginResponse = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'company1@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso como empresa');
    
    // Obtener TODAS las ofertas de la empresa
    const offersResponse = await fetch('http://localhost:5000/api/offers/company', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const offers = await offersResponse.json();
    console.log('✅ Ofertas de la empresa:', offers.length);
    
    // Buscar la oferta "planta externa"
    const plantaExternaOffer = offers.find(offer => 
      offer.name.toLowerCase().includes('planta externa') || 
      offer.name.toLowerCase().includes('externa')
    );
    
    if (plantaExternaOffer) {
      console.log('🏭 Oferta "Planta Externa" encontrada:', {
        id: plantaExternaOffer.id,
        name: plantaExternaOffer.name
      });
      
      // Verificar aplicaciones a esta oferta específica
      const applicationsResponse = await fetch(`http://localhost:5000/api/applications/offer/${plantaExternaOffer.id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      const applications = await applicationsResponse.json();
      console.log('📋 Aplicaciones a "Planta Externa":', applications.length);
      
      if (applications.length > 0) {
        applications.forEach((app, index) => {
          console.log(`   ${index + 1}. ${app.Student?.User?.name} ${app.Student?.User?.surname} (${app.Student?.User?.email})`);
          console.log(`      Status: ${app.status}, Fecha: ${app.appliedAt}`);
        });
      }
    } else {
      console.log('❌ No se encontró oferta "Planta Externa"');
      console.log('📋 Ofertas disponibles:');
      offers.forEach((offer, index) => {
        console.log(`   ${index + 1}. ${offer.name} (ID: ${offer.id})`);
      });
    }
    
    // Verificar TODAS las aplicaciones de la empresa
    console.log('\n=== TODAS LAS APLICACIONES DE LA EMPRESA ===');
    const allApplicationsResponse = await fetch('http://localhost:5000/api/applications/company', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const allApplications = await allApplicationsResponse.json();
    console.log('📊 Total aplicaciones recibidas:', allApplications.length);
    
    if (allApplications.length > 0) {
      allApplications.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.Student?.User?.name} ${app.Student?.User?.surname} → ${app.offer?.name}`);
        console.log(`      Email: ${app.Student?.User?.email}, Status: ${app.status}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar el test
testSpecificApplications();
