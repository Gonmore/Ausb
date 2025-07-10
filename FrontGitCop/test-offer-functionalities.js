// Test para verificar las nuevas funcionalidades de ofertas
async function testOfferFunctionalities() {
  try {
    console.log('=== TEST: Funcionalidades de Ofertas ===');
    
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
    
    // Obtener ofertas de la empresa
    const offersResponse = await fetch('http://localhost:5000/api/offers/company', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!offersResponse.ok) {
      console.error('❌ Error obteniendo ofertas:', await offersResponse.text());
      return;
    }
    
    const offers = await offersResponse.json();
    console.log('✅ Ofertas encontradas:', offers.length);
    
    if (offers.length > 0) {
      const firstOffer = offers[0];
      console.log('\n=== TEST: Aplicaciones de oferta específica ===');
      console.log('Probando oferta:', firstOffer.name, '(ID:', firstOffer.id, ')');
      
      // Obtener aplicaciones de la primera oferta
      const applicationsResponse = await fetch(`http://localhost:5000/api/applications/offer/${firstOffer.id}`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!applicationsResponse.ok) {
        console.error('❌ Error obteniendo aplicaciones de oferta:', await applicationsResponse.text());
        return;
      }
      
      const applications = await applicationsResponse.json();
      console.log('✅ Aplicaciones a esta oferta:', applications.length);
      
      if (applications.length > 0) {
        console.log('\n=== PRIMERA APLICACIÓN DE LA OFERTA ===');
        console.log('Estudiante:', applications[0].Student?.User?.name, applications[0].Student?.User?.surname);
        console.log('Email:', applications[0].Student?.User?.email);
        console.log('Status:', applications[0].status);
        console.log('Fecha:', applications[0].appliedAt);
        console.log('Oferta:', applications[0].offer?.name);
      } else {
        console.log('⚠️  No hay aplicaciones para esta oferta');
      }
    } else {
      console.log('⚠️  No hay ofertas para probar');
    }
    
  } catch (error) {
    console.error('❌ Error en el test:', error);
  }
}

// Ejecutar el test
testOfferFunctionalities();
