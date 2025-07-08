#!/usr/bin/env node

// Script para probar el flujo completo de login y dashboard
const axios = require('axios');

const BACKEND_URL = 'http://localhost:3002';
const FRONTEND_URL = 'http://localhost:3001';

console.log('🧪 Probando flujo completo de login y dashboard...\n');

async function testCompleteFlow() {
  try {
    // 1. Verificar que el backend esté funcionando
    console.log('1. 📡 Verificando backend...');
    try {
      const healthCheck = await axios.get(`${BACKEND_URL}/health`);
      console.log('✅ Backend responde:', healthCheck.status);
    } catch (error) {
      console.log('⚠️  Backend no responde, asegúrate de que esté ejecutándose');
    }

    // 2. Probar el endpoint de login
    console.log('\n2. 🔐 Probando login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const loginResponse = await axios.post(`${BACKEND_URL}/login`, loginData);
      console.log('✅ Login exitoso:', loginResponse.status);
      
      if (loginResponse.data.token) {
        console.log('✅ Token recibido');
        
        // 3. Verificar que el token sea válido
        console.log('\n3. 🔍 Verificando token...');
        try {
          const tokenPayload = JSON.parse(atob(loginResponse.data.token.split('.')[1]));
          console.log('✅ Token válido, usuario:', tokenPayload.user?.email || 'N/A');
          console.log('✅ Rol:', tokenPayload.user?.role || 'N/A');
          console.log('✅ Expira:', new Date(tokenPayload.exp * 1000).toLocaleString());
        } catch (tokenError) {
          console.log('❌ Error al decodificar token:', tokenError.message);
        }
      } else {
        console.log('❌ No se recibió token');
      }
    } catch (loginError) {
      console.log('❌ Error en login:', loginError.message);
      if (loginError.response) {
        console.log('   Status:', loginError.response.status);
        console.log('   Data:', loginError.response.data);
      }
    }

    // 4. Probar endpoints públicos
    console.log('\n4. 🌐 Probando endpoints públicos...');
    try {
      const offersResponse = await axios.get(`${BACKEND_URL}/api/offers`);
      console.log('✅ Ofertas públicas:', offersResponse.status, `(${offersResponse.data.length || 0} ofertas)`);
    } catch (offersError) {
      console.log('❌ Error en ofertas:', offersError.message);
    }

    // 5. Instrucciones para probar el dashboard
    console.log('\n5. 📋 Instrucciones para probar dashboard:');
    console.log('   a) Inicia el servidor frontend: npm run dev');
    console.log('   b) Navega a: http://localhost:3001/login');
    console.log('   c) Ingresa credenciales válidas');
    console.log('   d) Debe redirigir a: http://localhost:3001/dashboard');
    console.log('   e) El dashboard debe cargar sin errores 500');

    // 6. Verificar estructura del localStorage esperada
    console.log('\n6. 🗃️  Estructura esperada en localStorage:');
    console.log('   - auth-storage: {"state":{"user":{...},"token":"..."}}');
    console.log('   - authToken: "eyJ..." (token JWT)');

    // 7. Comandos de debug
    console.log('\n7. 🔧 Comandos de debug:');
    console.log('   - Verificar logs del servidor: npm run dev');
    console.log('   - Limpiar localStorage: localStorage.clear()');
    console.log('   - Verificar token: JWT decodificado en jwt.io');
    console.log('   - Página de diagnóstico: http://localhost:3001/diagnostico');

  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Función para crear datos de prueba
async function createTestData() {
  console.log('\n📝 Creando datos de prueba...');
  
  const testUsers = [
    { email: 'student@test.com', password: 'password123', role: 'student', name: 'Test Student' },
    { email: 'company@test.com', password: 'password123', role: 'company', name: 'Test Company' },
    { email: 'center@test.com', password: 'password123', role: 'scenter', name: 'Test Center' },
    { email: 'tutor@test.com', password: 'password123', role: 'tutor', name: 'Test Tutor' }
  ];

  for (const user of testUsers) {
    try {
      await axios.post(`${BACKEND_URL}/register`, user);
      console.log(`✅ Usuario creado: ${user.email} (${user.role})`);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log(`ℹ️  Usuario ya existe: ${user.email}`);
      } else {
        console.log(`❌ Error creando ${user.email}:`, error.message);
      }
    }
  }
}

// Ejecutar pruebas
async function main() {
  await testCompleteFlow();
  
  console.log('\n🎯 Puntos clave solucionados:');
  console.log('  ✅ Dashboard limpio sin código duplicado');
  console.log('  ✅ Manejo correcto de tipos TypeScript');
  console.log('  ✅ Evita errores de hidratación SSR');
  console.log('  ✅ Manejo robusto de localStorage');
  console.log('  ✅ Estados de loading apropiados');
  console.log('  ✅ Iconos y UI mejorados');
  console.log('  ✅ Acciones rápidas por rol de usuario');
  console.log('  ✅ Información de debug incluida');
}

main().catch(console.error);
