// Script para depurar el problema de asociación de ofertas
const API_BASE_URL = 'http://localhost:5000';

async function debugAssociation() {
    console.log('🔍 Depurando asociación de ofertas...\n');
    
    try {
        // 1. Verificar que la empresa existe
        console.log('1. Verificando empresa...');
        const companyResponse = await fetch(`${API_BASE_URL}/api/companies`);
        const companies = await companyResponse.json();
        console.log('Empresas disponibles:', companies.length);
        
        if (companies.length > 0) {
            const company = companies[0];
            console.log('Primera empresa:', {
                id: company.id,
                name: company.name,
                userId: company.userId
            });
            
            // 2. Verificar ofertas
            console.log('\n2. Verificando ofertas...');
            const offersResponse = await fetch(`${API_BASE_URL}/api/offers`);
            const offers = await offersResponse.json();
            console.log('Ofertas disponibles:', offers.length);
            
            if (offers.length > 0) {
                console.log('Primera oferta:', {
                    id: offers[0].id,
                    name: offers[0].name
                });
                
                // 3. Intentar asociación con más detalles del error
                console.log('\n3. Intentando asociación...');
                try {
                    const associationResponse = await fetch(
                        `${API_BASE_URL}/api/admin-temp/associate-offers-company`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ companyUserId: company.userId })
                        }
                    );
                    
                    const result = await associationResponse.json();
                    
                    if (associationResponse.ok) {
                        console.log('✅ Asociación exitosa:', result);
                    } else {
                        console.log('❌ Error en asociación:');
                        console.log('Status:', associationResponse.status);
                        console.log('Data:', result);
                    }
                } catch (error) {
                    console.log('❌ Error en asociación:', error.message);
                }
            } else {
                console.log('❌ No hay ofertas disponibles');
            }
        } else {
            console.log('❌ No hay empresas disponibles');
        }
        
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

debugAssociation();
