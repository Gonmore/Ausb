#!/usr/bin/env node

const http = require('http');

async function checkServer() {
  const ports = [3001, 3000];
  
  for (const port of ports) {
    try {
      console.log(`🔍 Verificando puerto ${port}...`);
      
      const options = {
        hostname: 'localhost',
        port: port,
        path: '/',
        method: 'GET',
        timeout: 5000
      };
      
      const req = http.request(options, (res) => {
        console.log(`✅ Puerto ${port}: ${res.statusCode} ${res.statusMessage}`);
        
        if (port === 3001) {
          // Test dashboard
          const dashboardOptions = {
            hostname: 'localhost',
            port: port,
            path: '/dashboard',
            method: 'GET',
            timeout: 5000
          };
          
          const dashboardReq = http.request(dashboardOptions, (dashRes) => {
            console.log(`✅ Dashboard: ${dashRes.statusCode} ${dashRes.statusMessage}`);
            
            if (dashRes.statusCode === 200) {
              console.log('🎉 Dashboard está funcionando correctamente!');
            } else {
              console.log('❌ Dashboard tiene problemas');
            }
          });
          
          dashboardReq.on('error', (err) => {
            console.log('❌ Error en dashboard:', err.message);
          });
          
          dashboardReq.end();
        }
      });
      
      req.on('error', (err) => {
        console.log(`❌ Puerto ${port} no responde:`, err.message);
      });
      
      req.end();
      
      // Esperar un poco antes del siguiente test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ Error verificando puerto ${port}:`, error.message);
    }
  }
}

checkServer();

// También verificar API route
setTimeout(() => {
  const apiOptions = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/dashboard-test',
    method: 'GET',
    timeout: 5000
  };
  
  const apiReq = http.request(apiOptions, (res) => {
    console.log(`✅ API Dashboard Test: ${res.statusCode} ${res.statusMessage}`);
    
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        console.log('✅ API Response:', parsed);
      } catch (e) {
        console.log('✅ API Response (raw):', data);
      }
    });
  });
  
  apiReq.on('error', (err) => {
    console.log('❌ Error en API:', err.message);
  });
  
  apiReq.end();
}, 3000);
