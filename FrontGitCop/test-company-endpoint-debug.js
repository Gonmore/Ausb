// Test específico para verificar el problema del endpoint de aplicaciones de empresa
const API_BASE = 'http://localhost:5000';

async function testCompanyApplicationsEndpoint() {
  console.log('🧪 Test específico del endpoint /api/applications/company...\n');

  try {
    // Login como empresa
    const loginResponse = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'company1@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('✅ Empresa logueada:', loginData.user.username);
    console.log('👤 UserId:', loginData.user.id);

    // Probar el endpoint que está fallando
    console.log('\n📋 Probando endpoint /api/applications/company...');
    const response = await fetch(`${API_BASE}/api/applications/company`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Aplicaciones recibidas: ${data.length}`);
      
      if (data.length > 0) {
        console.log('📋 Primera aplicación:');
        const app = data[0];
        console.log(`   - ID: ${app.id}`);
        console.log(`   - Status: ${app.status}`);
        console.log(`   - OfferId: ${app.offerId}`);
        console.log(`   - Offer name: ${app.Offer?.name || 'VACÍO'}`);
        console.log(`   - Student: ${app.Student?.User?.name || 'VACÍO'}`);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
    }

    // También probar endpoint directo de aplicaciones por companyId
    console.log('\n📋 Probando endpoint directo por companyId...');
    const directResponse = await fetch(`${API_BASE}/api/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (directResponse.ok) {
      const allApps = await directResponse.json();
      console.log(`📊 Total aplicaciones en sistema: ${allApps.length}`);
      
      // Filtrar por companyId = 1
      const companyApps = allApps.filter(app => app.companyId === 1);
      console.log(`📊 Aplicaciones para empresa ID 1: ${companyApps.length}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompanyApplicationsEndpoint();
