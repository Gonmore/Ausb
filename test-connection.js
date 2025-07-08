// Test de conectividad simple
const API_BASE_URL = 'http://localhost:5000';

async function testConnection() {
    try {
        console.log('Probando conexión con el servidor...');
        
        const response = await fetch(`${API_BASE_URL}/`, {
            method: 'GET'
        });
        
        const text = await response.text();
        console.log('Respuesta del servidor:', text);
        console.log('Status:', response.status);
        
        if (response.ok) {
            console.log('✅ Conexión exitosa!');
        } else {
            console.log('❌ Error en la conexión');
        }
        
    } catch (error) {
        console.error('❌ Error de conexión:', error.message);
    }
}

testConnection();
