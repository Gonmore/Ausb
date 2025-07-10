// Test para verificar que la empresa puede ver sus ofertas
const API_BASE = 'http://localhost:5000';

async function testCompanyOffers() {
  console.log('🧪 Iniciando test de ofertas de empresa...\n');

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

    // 2. Obtener ofertas de la empresa (ID: 1)
    console.log('\n2️⃣ Obteniendo ofertas de la empresa...');
    const companyOffersResponse = await fetch(`${API_BASE}/api/offers/company/1`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!companyOffersResponse.ok) {
      throw new Error(`Get company offers failed: ${companyOffersResponse.status} ${companyOffersResponse.statusText}`);
    }

    const companyOffers = await companyOffersResponse.json();
    console.log(`✅ Ofertas de la empresa obtenidas: ${companyOffers.length}`);
    
    companyOffers.forEach((offer, index) => {
      console.log(`${index + 1}. ${offer.name} (ID: ${offer.id})`);
      console.log(`   - Empresa: ${offer.company?.name || 'Sin empresa'}`);
      console.log(`   - Familia profesional: ${offer.profamily?.name || 'Sin familia'}`);
      console.log(`   - CompanyId: ${offer.companyId}`);
    });

    // 3. Comparar con todas las ofertas para verificar el filtro
    console.log('\n3️⃣ Comparando con todas las ofertas...');
    const allOffersResponse = await fetch(`${API_BASE}/api/offers`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    if (!allOffersResponse.ok) {
      throw new Error(`Get all offers failed: ${allOffersResponse.status} ${allOffersResponse.statusText}`);
    }

    const allOffers = await allOffersResponse.json();
    console.log(`📋 Total de ofertas en el sistema: ${allOffers.length}`);
    
    const company1Offers = allOffers.filter(offer => offer.companyId === 1);
    console.log(`📋 Ofertas de la empresa 1 en lista general: ${company1Offers.length}`);
    
    if (companyOffers.length === company1Offers.length) {
      console.log('✅ El filtro por empresa funciona correctamente');
    } else {
      console.log('❌ Discrepancia en el filtro por empresa');
    }

    console.log('\n🎉 ¡Test de ofertas de empresa completado!');
    
  } catch (error) {
    console.error('\n❌ Error en el test:', error.message);
  }
}

// Ejecutar el test
if (require.main === module) {
  testCompanyOffers();
}

module.exports = { testCompanyOffers };
