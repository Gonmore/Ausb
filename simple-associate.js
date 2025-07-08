// Script simple para asociar ofertas con empresa
const API_BASE_URL = 'http://localhost:5000';

async function simpleAssociate() {
    console.log('🔗 Asociando ofertas con empresa...\n');
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/admin-temp/associate-offers-company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Sin parámetros, tomará la primera empresa
        });
        
        const result = await response.json();
        
        if (response.ok) {
            console.log('✅ Asociación exitosa!');
            console.log('Empresa:', result.company.name);
            console.log('Ofertas asociadas:', result.total);
            console.log('Detalles:', result.associations);
        } else {
            console.log('❌ Error en asociación:');
            console.log('Status:', response.status);
            console.log('Message:', result.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

simpleAssociate();
