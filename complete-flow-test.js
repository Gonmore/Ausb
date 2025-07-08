// Script para crear usuario estudiante y probar el flujo
const API_BASE_URL = 'http://127.0.0.1:5000';

async function createStudentUser() {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'student_test',
                email: 'student@example.com',
                name: 'Estudiante Test',
                surname: 'Apellido Test',
                password: 'password123',
                role: 'student'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Usuario estudiante creado exitosamente:', data);
            return true;
        } else {
            console.log('❌ Error creando usuario:', data);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión creando usuario:', error);
        return false;
    }
}

async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Login exitoso:', data);
            return data.token;
        } else {
            console.error('❌ Error en login:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión en login:', error);
        return null;
    }
}

async function getOffers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Ofertas obtenidas:', data.length);
            return data;
        } else {
            console.error('❌ Error obteniendo ofertas:', data);
            return [];
        }
    } catch (error) {
        console.error('❌ Error de conexión obteniendo ofertas:', error);
        return [];
    }
}

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
            console.log('✅ Aplicación enviada exitosamente:', data);
            return data;
        } else {
            console.error('❌ Error enviando aplicación:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error de conexión enviando aplicación:', error);
        return null;
    }
}

async function getUserApplications(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/applications/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Aplicaciones del usuario obtenidas:', data.length);
            return data;
        } else {
            console.error('❌ Error obteniendo aplicaciones:', data);
            return [];
        }
    } catch (error) {
        console.error('❌ Error de conexión obteniendo aplicaciones:', error);
        return [];
    }
}

async function testCompleteFlow() {
    console.log('🚀 Iniciando prueba completa del flujo de aplicaciones...\n');
    
    // 0. Crear usuario estudiante si no existe
    console.log('0. Creando usuario estudiante...');
    await createStudentUser();
    
    // 1. Login como estudiante
    console.log('\n1. Haciendo login...');
    const token = await login('student@example.com', 'password123');
    
    if (!token) {
        console.log('❌ No se pudo obtener token, terminando prueba');
        return;
    }
    
    // 2. Obtener ofertas
    console.log('\n2. Obteniendo ofertas...');
    const offers = await getOffers();
    
    if (offers.length === 0) {
        console.log('❌ No hay ofertas disponibles, terminando prueba');
        return;
    }
    
    // 3. Aplicar a la primera oferta
    console.log('\n3. Aplicando a la primera oferta...');
    const firstOffer = offers[0];
    console.log('Oferta seleccionada:', firstOffer.name);
    
    const application = await applyToOffer(token, firstOffer.id);
    
    if (!application) {
        console.log('❌ No se pudo enviar la aplicación');
        return;
    }
    
    // 4. Verificar que la aplicación aparece en la lista del usuario
    console.log('\n4. Verificando aplicaciones del usuario...');
    const userApplications = await getUserApplications(token);
    
    console.log('\n✅ Prueba completada!');
    console.log('📊 Resumen:');
    console.log('- Token obtenido:', !!token);
    console.log('- Ofertas disponibles:', offers.length);
    console.log('- Aplicación enviada:', !!application);
    console.log('- Aplicaciones del usuario:', userApplications.length);
    
    // Mostrar detalles de las aplicaciones
    if (userApplications.length > 0) {
        console.log('\n📋 Aplicaciones del usuario:');
        userApplications.forEach((app, index) => {
            console.log(`${index + 1}. Oferta: ${app.offer?.name || 'N/A'}`);
            console.log(`   Empresa: ${app.company?.name || 'N/A'}`);
            console.log(`   Estado: ${app.status || 'N/A'}`);
            console.log(`   Mensaje: ${app.message || 'N/A'}`);
            console.log('---');
        });
    }
}

testCompleteFlow();
