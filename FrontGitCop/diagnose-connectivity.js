#!/usr/bin/env node

const axios = require('axios');

const BACKEND_URL = 'http://localhost:5000';
const FRONTEND_URL = 'http://localhost:3001';

console.log('🔍 Diagnóstico de Conectividad - Backend Puerto 5000\n');

async function testBackendConnection() {
  console.log('1. 🔌 Verificando conectividad con backend...');
  
  try {
    // Test básico de conectividad
    const response = await axios.get(`${BACKEND_URL}`, { timeout: 5000 });
    console.log('✅ Backend responde:', response.status);
    
    // Test de endpoints específicos
    const endpoints = [
      '/api/offers',
      '/health',
      '/status',
      '/'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const res = await axios.get(`${BACKEND_URL}${endpoint}`, { timeout: 3000 });
        console.log(`✅ ${endpoint}: ${res.status}`);
      } catch (err) {
        console.log(`❌ ${endpoint}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.log('❌ Backend no accesible:', error.message);
    console.log('🔧 Verificar que el backend esté corriendo en puerto 5000');
  }
}

async function testFrontendConnection() {
  console.log('\n2. 🌐 Verificando frontend...');
  
  try {
    const response = await axios.get(`${FRONTEND_URL}`, { timeout: 5000 });
    console.log('✅ Frontend responde:', response.status);
  } catch (error) {
    console.log('❌ Frontend no accesible:', error.message);
  }
}

async function testDashboardSpecific() {
  console.log('\n3. 📊 Probando dashboard específicamente...');
  
  try {
    // Intentar acceder al dashboard
    const dashboardResponse = await axios.get(`${FRONTEND_URL}/dashboard`, { 
      timeout: 10000,
      validateStatus: function (status) {
        return status < 600; // Aceptar cualquier status < 600
      }
    });
    
    console.log(`📋 Dashboard status: ${dashboardResponse.status}`);
    
    if (dashboardResponse.status === 500) {
      console.log('❌ Error 500 confirmado en dashboard');
      console.log('📝 Response headers:', dashboardResponse.headers);
    } else {
      console.log('✅ Dashboard accesible');
    }
    
  } catch (error) {
    console.log('❌ Error al acceder al dashboard:', error.message);
  }
}

async function testPorts() {
  console.log('\n4. 🔍 Verificando puertos...');
  
  const ports = [5000, 3001, 3000, 3002];
  
  for (const port of ports) {
    try {
      const response = await axios.get(`http://localhost:${port}`, { 
        timeout: 2000,
        validateStatus: () => true 
      });
      console.log(`✅ Puerto ${port}: Activo (${response.status})`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Puerto ${port}: No hay servicio`);
      } else {
        console.log(`⚠️  Puerto ${port}: ${error.message}`);
      }
    }
  }
}

async function runDiagnostics() {
  console.log('🏁 Iniciando diagnóstico completo...\n');
  
  await testPorts();
  await testBackendConnection();
  await testFrontendConnection();
  await testDashboardSpecific();
  
  console.log('\n📋 Resumen y Recomendaciones:');
  console.log('1. Verificar que el backend esté corriendo: npm start (puerto 5000)');
  console.log('2. Verificar que el frontend esté corriendo: npm run dev (puerto 3001)');
  console.log('3. Si ambos están activos pero dashboard da 500, revisar logs del servidor');
  console.log('4. Probar endpoints básicos del backend directamente');
  
  console.log('\n🔧 Comandos útiles:');
  console.log('Backend: cd ../ausback && npm start');
  console.log('Frontend: npm run dev');
  console.log('Logs: Revisar terminal donde corre npm run dev');
}

runDiagnostics().catch(console.error);
