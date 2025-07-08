// Script final para probar el flujo completo de aplicaciones

const API_BASE_URL = 'http://127.0.0.1:5000';

// Función para hacer login y obtener token
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login exitoso');
            return data.token;
        } else {
            console.error('❌ Error en login:', data.message || data.mensaje);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión en login:', error.message);
        return null;
    }
}

// Función para obtener ofertas públicas
async function getOffers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Ofertas obtenidas: ${data.length}`);
            return data;
        } else {
            console.error('❌ Error obteniendo ofertas:', data.message || data.mensaje);
            return [];
        }
    } catch (error) {
        console.error('❌ Error de conexión obteniendo ofertas:', error.message);
        return [];
    }
}

// Función para aplicar a una oferta
async function applyToOffer(token, offerId, message = 'Estoy interesado en esta oferta') {
    try {
        const response = await fetch(`${API_BASE_URL}/api/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                offerId,
                message
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Aplicación enviada exitosamente');
            return data;
        } else {
            console.error('❌ Error enviando aplicación:', data.message || data.mensaje);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión enviando aplicación:', error.message);
        return null;
    }
}

// Función para obtener aplicaciones del usuario
async function getUserApplications(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log(`✅ Aplicaciones del usuario obtenidas: ${data.length}`);
            return data;
        } else {
            console.error('❌ Error obteniendo aplicaciones:', data.message || data.mensaje);
            return [];
        }
    } catch (error) {
        console.error('❌ Error de conexión obteniendo aplicaciones:', error.message);
        return [];
    }
}

// Función principal de prueba
async function testCompleteFlow() {
    console.log('🚀 Iniciando prueba del flujo completo de aplicaciones...\n');
    
    // 1. Login como estudiante
    console.log('📝 PASO 1: Login como estudiante');
    const token = await login('student@example.com', 'password123');
    
    if (!token) {
        console.log('❌ No se pudo obtener token, terminando prueba');
        return false;
    }
    
    // 2. Obtener ofertas
    console.log('\n📋 PASO 2: Obteniendo ofertas disponibles');
    const offers = await getOffers();
    
    if (offers.length === 0) {
        console.log('❌ No hay ofertas disponibles, terminando prueba');
        return false;
    }
    
    // Mostrar información de las ofertas
    console.log('\n📊 Ofertas disponibles:');
    offers.forEach((offer, index) => {
        console.log(`${index + 1}. ${offer.name} - ${offer.location}`);
        console.log(`   Empresa: ${offer.company ? offer.company.name : 'Sin empresa'}`);
        console.log(`   Sector: ${offer.sector}`);
        console.log('');
    });
    
    // 3. Aplicar a la primera oferta que tenga empresa
    console.log('📤 PASO 3: Aplicando a una oferta');
    const validOffers = offers.filter(o => o.company && o.company.id);
    
    if (validOffers.length === 0) {
        console.log('❌ No hay ofertas válidas con empresa asociada');
        return false;
    }
    
    const targetOffer = validOffers[0];
    console.log(`Aplicando a: "${targetOffer.name}" de la empresa "${targetOffer.company.name}"`);
    
    const application = await applyToOffer(token, targetOffer.id, 'Me interesa mucho esta oportunidad');
    
    if (!application) {
        console.log('❌ No se pudo enviar la aplicación');
        return false;
    }
    
    // 4. Verificar que la aplicación aparece en la lista del usuario
    console.log('\n📋 PASO 4: Verificando aplicaciones del usuario');
    const userApplications = await getUserApplications(token);
    
    const newApplication = userApplications.find(app => app.offerId === targetOffer.id);
    
    if (!newApplication) {
        console.log('❌ La aplicación no aparece en la lista del usuario');
        return false;
    }
    
    console.log('✅ Aplicación encontrada en la lista del usuario');
    console.log(`   Estado: ${newApplication.status}`);
    console.log(`   Fecha: ${new Date(newApplication.appliedAt).toLocaleString()}`);
    console.log(`   Oferta: ${newApplication.Offer ? newApplication.Offer.name : newApplication.offer?.name}`);
    console.log(`   Empresa: ${newApplication.Offer ? newApplication.Offer.company?.name : newApplication.offer?.company?.name}`);
    
    // 5. Resumen final
    console.log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE');
    console.log('=====================================');
    console.log('📊 Resumen de la prueba:');
    console.log(`✅ Login exitoso: Sí`);
    console.log(`✅ Ofertas obtenidas: ${offers.length}`);
    console.log(`✅ Ofertas válidas: ${validOffers.length}`);
    console.log(`✅ Aplicación enviada: Sí`);
    console.log(`✅ Aplicación registrada: Sí`);
    console.log(`✅ Total aplicaciones del usuario: ${userApplications.length}`);
    
    return true;
}

// Ejecutar la prueba
if (require.main === module) {
    testCompleteFlow()
        .then((success) => {
            if (success) {
                console.log('\n🎉 ¡FLUJO COMPLETO FUNCIONA CORRECTAMENTE!');
                process.exit(0);
            } else {
                console.log('\n❌ El flujo completo falló');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('💥 Error inesperado:', error);
            process.exit(1);
        });
}

module.exports = { testCompleteFlow };
