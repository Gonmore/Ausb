// Test de conectividad simple para verificar endpoints del backend
const API_BASE = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🔍 Verificando endpoints disponibles del backend...\n');

  const endpoints = [
    '/',
    '/health',
    '/login',
    '/api/login',
    '/auth/login',
    '/api/auth/login',
    '/api/offers',
    '/api/applications'
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Probando: ${API_BASE}${endpoint}`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log(`   Response: ${JSON.stringify(data).substring(0, 100)}...`);
        } else {
          const text = await response.text();
          console.log(`   Response: ${text.substring(0, 100)}...`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Ahora probar POST /login específicamente
  console.log('🔑 Probando POST /login con credenciales de prueba...\n');
  
  const loginEndpoints = ['/login', '/api/login', '/auth/login'];
  
  for (const endpoint of loginEndpoints) {
    try {
      console.log(`🔍 POST: ${API_BASE}${endpoint}`);
      
      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'maria.garcia@example.com',
          password: 'password123'
        })
      });

      console.log(`   Status: ${response.status} ${response.statusText}`);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`   Response: ${JSON.stringify(data).substring(0, 200)}...`);
      } else {
        const text = await response.text();
        console.log(`   Response: ${text.substring(0, 200)}...`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }
}

testEndpoints();
