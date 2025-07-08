// Script para probar el endpoint de empresa
const API_BASE_URL = 'http://127.0.0.1:5000';

async function testCompanyEndpoint() {
    try {
        // Primero hacer login
        const loginResponse = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: 'company2@techcorp.com',
                password: 'password123'
            })
        });

        const loginData = await loginResponse.json();
        
        if (!loginResponse.ok) {
            console.log('❌ Error en login:', loginData);
            return;
        }
        
        console.log('✅ Login exitoso');
        const token = loginData.token;
        
        // Probar el endpoint de empresa
        const companyResponse = await fetch(`${API_BASE_URL}/api/company`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', companyResponse.status);
        console.log('Response headers:', companyResponse.headers);
        
        const responseText = await companyResponse.text();
        console.log('Response text:', responseText);
        
        if (companyResponse.ok) {
            try {
                const companyData = JSON.parse(responseText);
                console.log('✅ Datos de empresa:', companyData);
            } catch (e) {
                console.log('❌ Error parsing JSON:', e.message);
            }
        } else {
            console.log('❌ Error del servidor:', companyResponse.status);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCompanyEndpoint();
