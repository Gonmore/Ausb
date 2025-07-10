// Test para verificar la estructura de datos del usuario empresa
const API_BASE = 'http://localhost:5000';

async function testCompanyLogin() {
  console.log('🧪 Probando login de empresa...\n');

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'company1@example.com',
        password: 'password123'
      })
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    const loginData = await response.json();
    console.log('✅ Login exitoso');
    console.log('📋 Estructura completa del usuario:');
    console.log(JSON.stringify(loginData.user, null, 2));
    console.log('\n📋 Token:', loginData.token ? 'Presente' : 'Ausente');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testCompanyLogin();
