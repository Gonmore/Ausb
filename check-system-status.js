// Script para verificar el estado de las ofertas y sus relaciones con empresas

const API_BASE_URL = 'http://127.0.0.1:5000';

async function checkOffersStatus() {
    try {
        console.log('🔍 Verificando estado de ofertas...\n');
        
        // Obtener ofertas
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        const offers = await response.json();
        
        console.log(`Total ofertas: ${offers.length}\n`);
        
        offers.forEach((offer, index) => {
            console.log(`${index + 1}. ${offer.name}`);
            console.log(`   ID: ${offer.id}`);
            console.log(`   CompanyId: ${offer.companyId || 'NULL'}`);
            console.log(`   Company Object: ${offer.Company ? JSON.stringify(offer.Company) : 'NULL'}`);
            console.log(`   Location: ${offer.location}`);
            console.log(`   Sector: ${offer.sector}`);
            console.log('   ---');
        });
        
        const offersWithCompany = offers.filter(o => o.companyId);
        const offersWithCompanyObj = offers.filter(o => o.Company);
        
        console.log(`\n📊 Resumen:`);
        console.log(`- Ofertas con companyId: ${offersWithCompany.length}`);
        console.log(`- Ofertas con objeto Company: ${offersWithCompanyObj.length}`);
        
        return offers;
    } catch (error) {
        console.error('❌ Error verificando ofertas:', error);
        return [];
    }
}

// Función para obtener empresas directamente
async function checkCompaniesStatus() {
    try {
        console.log('\n🏢 Verificando empresas...\n');
        
        const response = await fetch(`${API_BASE_URL}/api/companies`);
        const companies = await response.json();
        
        console.log(`Total empresas: ${companies.length}\n`);
        
        companies.forEach((company, index) => {
            console.log(`${index + 1}. ${company.name}`);
            console.log(`   ID: ${company.id}`);
            console.log(`   UserId: ${company.userId || 'NULL'}`);
            console.log(`   City: ${company.city}`);
            console.log(`   Sector: ${company.sector}`);
            console.log('   ---');
        });
        
        return companies;
    } catch (error) {
        console.error('❌ Error verificando empresas:', error);
        return [];
    }
}

// Función principal
async function checkSystemStatus() {
    console.log('🔍 VERIFICANDO ESTADO DEL SISTEMA\n');
    console.log('=====================================\n');
    
    const offers = await checkOffersStatus();
    const companies = await checkCompaniesStatus();
    
    console.log('\n🔧 DIAGNÓSTICO:');
    console.log('===============');
    
    if (offers.length === 0) {
        console.log('❌ No hay ofertas en el sistema');
    } else if (companies.length === 0) {
        console.log('❌ No hay empresas en el sistema');
    } else {
        const offersWithCompanyId = offers.filter(o => o.companyId);
        
        if (offersWithCompanyId.length === 0) {
            console.log('❌ Las ofertas no tienen companyId asignado');
            console.log('💡 Necesitamos ejecutar un script para asociar ofertas con empresas');
        } else {
            console.log('✅ Las ofertas tienen companyId asignado');
            
            if (offers.filter(o => o.Company).length === 0) {
                console.log('❌ Las consultas no incluyen el objeto Company');
                console.log('💡 El controlador de ofertas no está incluyendo la relación Company');
            } else {
                console.log('✅ Las consultas incluyen el objeto Company');
            }
        }
    }
}

// Ejecutar verificación
checkSystemStatus().catch(console.error);
