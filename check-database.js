// Script para verificar la tabla CompanyOffer directamente
async function checkCompanyOfferTable() {
    try {
        console.log('🔍 Verificando tabla CompanyOffer...\n');
        
        // Usar una consulta HTTP al endpoint admin para verificar la BD
        const response = await fetch('http://127.0.0.1:5000/api/admin-temp/check-associations', {
            method: 'GET'
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Respuesta del servidor:');
            console.log('📊 Asociaciones en CompanyOffer:', data.companyOfferAssociations);
            console.log('🏢 Empresas disponibles:', data.companies);
            console.log('📋 Ofertas disponibles:', data.offers);
            console.log('\n🔍 Ofertas con empresas asociadas:');
            data.offersWithCompanies.forEach((offer, index) => {
                console.log(`  ${index + 1}. ${offer.name} (ID: ${offer.id})`);
                console.log(`     Empresas asociadas: ${offer.companiesCount}`);
                if (offer.companies.length > 0) {
                    offer.companies.forEach(company => {
                        console.log(`       - ${company.name} (ID: ${company.id})`);
                    });
                }
            });
            
            if (data.associations.length > 0) {
                console.log('\n🔗 Asociaciones en CompanyOffer:');
                data.associations.forEach((assoc, index) => {
                    console.log(`  ${index + 1}. CompanyId: ${assoc.CompanyId}, OfferId: ${assoc.OfferId}`);
                });
            } else {
                console.log('\n❌ No hay asociaciones en la tabla CompanyOffer');
            }
        } else {
            console.log('❌ Error del servidor:', response.status);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkCompanyOfferTable();

checkCompanyOfferTable();
