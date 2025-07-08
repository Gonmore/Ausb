// Script final para asociar ofertas existentes con empresas y probar el flujo
const API_BASE_URL = 'http://127.0.0.1:5000';

async function fixAndTestFlow() {
    console.log('🔧 REPARANDO Y PROBANDO EL FLUJO COMPLETO\n');
    
    try {
        // PASO 1: Asociar ofertas existentes con empresas
        console.log('1. Asociando ofertas existentes con empresas...');
        const response = await fetch(`${API_BASE_URL}/api/admin-temp/associate-offers-company`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({}) // Sin parámetros específicos
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Ofertas asociadas:', result.total || 0);
        } else {
            console.log('⚠️ No se pudieron asociar ofertas automáticamente, continuando...');
        }
        
        // PASO 2: Login como estudiante existente
        console.log('\n2. Haciendo login como estudiante...');
        const studentToken = await login('student@example.com', 'password123');
        
        if (!studentToken) {
            console.log('⚠️ Estudiante no existe, creando uno nuevo...');
            const newStudent = await createStudent();
            if (newStudent) {
                const newStudentToken = await login('maria@student.com', 'password123');
                if (newStudentToken) {
                    return await testApplication(newStudentToken);
                }
            }
            console.log('❌ No se pudo crear o logear estudiante');
            return;
        }
        
        return await testApplication(studentToken);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

async function testApplication(token) {
    // PASO 3: Obtener ofertas
    console.log('\n3. Obteniendo ofertas...');
    const response = await fetch(`${API_BASE_URL}/api/offers`);
    const offers = await response.json();
    
    if (!response.ok || offers.length === 0) {
        console.log('❌ No hay ofertas disponibles');
        return;
    }
    
    console.log('✅ Ofertas encontradas:', offers.length);
    
    // Mostrar si las ofertas tienen empresas asociadas
    const offersWithCompanies = offers.filter(offer => offer.companies && offer.companies.length > 0);
    console.log('✅ Ofertas con empresa asociada:', offersWithCompanies.length);
    
    if (offersWithCompanies.length === 0) {
        console.log('❌ Ninguna oferta tiene empresa asociada');
        return;
    }
    
    // PASO 4: Aplicar a la primera oferta con empresa
    const firstOfferWithCompany = offersWithCompanies[0];
    console.log(`\n4. Aplicando a: ${firstOfferWithCompany.name}`);
    console.log(`   Empresa: ${firstOfferWithCompany.companies[0].name}`);
    
    const appResponse = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            offerId: firstOfferWithCompany.id,
            message: 'Estoy muy interesado en esta posición'
        })
    });
    
    const appData = await appResponse.json();
    
    if (appResponse.ok) {
        console.log('✅ Aplicación enviada exitosamente!');
        
        // PASO 5: Verificar aplicaciones del usuario
        console.log('\n5. Verificando aplicaciones del usuario...');
        const userAppsResponse = await fetch(`${API_BASE_URL}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const userApps = await userAppsResponse.json();
        
        if (userAppsResponse.ok) {
            console.log('✅ Aplicaciones del usuario:', userApps.length);
            
            if (userApps.length > 0) {
                console.log('\n🎉 ¡FLUJO COMPLETADO EXITOSAMENTE!');
                console.log('📋 Aplicaciones:');
                userApps.forEach((app, index) => {
                    console.log(`  ${index + 1}. ${app.offer?.name || 'N/A'} - ${app.company?.name || 'N/A'}`);
                });
                return true;
            }
        }
    } else {
        console.log('❌ Error enviando aplicación:', appData);
    }
    
    return false;
}

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
        return response.ok ? data.token : null;
    } catch (error) {
        return null;
    }
}

async function createStudent() {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'maria_student',
                email: 'maria@student.com',
                name: 'Maria',
                surname: 'García',
                password: 'password123',
                role: 'student'
            })
        });

        const data = await response.json();
        return response.ok ? data : null;
    } catch (error) {
        return null;
    }
}

fixAndTestFlow();
