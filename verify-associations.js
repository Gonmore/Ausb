// Script para verificar las asociaciones entre ofertas y empresas
const API_BASE_URL = 'http://127.0.0.1:5000';

async function verifyAssociations() {
    console.log('🔍 Verificando asociaciones entre ofertas y empresas...\n');
    
    try {
        // Obtener ofertas
        const offersResponse = await fetch(`${API_BASE_URL}/api/offers`);
        const offers = await offersResponse.json();
        console.log('Total ofertas:', offers.length);
        
        // Mostrar detalles de cada oferta
        offers.forEach((offer, index) => {
            console.log(`${index + 1}. Oferta: ${offer.name}`);
            console.log(`   ID: ${offer.id}`);
            console.log(`   Descripción: ${offer.description}`);
            console.log(`   Companies: ${offer.Companies ? offer.Companies.length : 'No incluido'}`);
            console.log('---');
        });
        
        // Intentar obtener una oferta específica con sus empresas
        if (offers.length > 0) {
            console.log('\n🔍 Intentando obtener detalles de la primera oferta...');
            const firstOfferId = offers[0].id;
            
            try {
                const offerDetailResponse = await fetch(`${API_BASE_URL}/api/offers/${firstOfferId}`);
                const offerDetail = await offerDetailResponse.json();
                
                if (offerDetailResponse.ok) {
                    console.log('✅ Detalles de la oferta obtenidos:');
                    console.log(JSON.stringify(offerDetail, null, 2));
                } else {
                    console.log('❌ Error obteniendo detalles de la oferta:', offerDetail);
                }
            } catch (error) {
                console.log('❌ Error al obtener detalles de la oferta:', error.message);
            }
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

verifyAssociations();
