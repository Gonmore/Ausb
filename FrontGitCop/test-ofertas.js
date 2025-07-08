// Test script para verificar los datos de ofertas
console.log('🔍 Verificando datos de ofertas...');

fetch('http://localhost:5000/api/offers')
  .then(response => response.json())
  .then(data => {
    console.log('📊 Datos recibidos:', data);
    console.log('📝 Número de ofertas:', data.length);
    
    if (data.length > 0) {
      console.log('🎯 Primera oferta:', data[0]);
      console.log('📋 Campos disponibles:', Object.keys(data[0]));
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });
