// Script para verificar el contenido de las ofertas
const API_BASE_URL = 'http://127.0.0.1:5000';

async function checkOffers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        const offers = await response.json();
        
        console.log('📋 Respuesta completa:');
        console.log(JSON.stringify(offers, null, 2));
        
        console.log('\n📊 Análisis de ofertas:');
        offers.forEach((offer, index) => {
            console.log(`${index + 1}. ${offer.name}`);
            console.log(`   ID: ${offer.id}`);
            console.log(`   CompanyId: ${offer.companyId}`);
            console.log(`   Company object: ${offer.Company ? 'Existe' : 'No existe'}`);
            if (offer.Company) {
                console.log(`   Company name: ${offer.Company.name}`);
            }
            console.log(`   Profamily: ${offer.Profamily ? 'Existe' : 'No existe'}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

checkOffers();
