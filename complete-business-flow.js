// Script completo para crear todo el flujo: Empresas -> Ofertas -> Estudiantes -> Aplicaciones
const API_BASE_URL = 'http://127.0.0.1:5000';

// 1. Función para crear una empresa
async function createCompany() {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'techcorp_user3',
                email: 'company3@techcorp.com',
                name: 'TechCorp Solutions 3',
                surname: 'Enterprise',
                password: 'password123',
                phone: '555-123-4567',
                description: 'Empresa de desarrollo de software',
                role: 'company'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Empresa creada exitosamente:', data.user.name);
            return data;
        } else {
            console.log('❌ Error creando empresa:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 2. Función para crear ofertas (requiere token de empresa)
async function createOffers(companyToken, companyId) {
    const ofertas = [
        {
            name: 'Desarrollador Frontend React',
            location: 'Madrid',
            mode: 'Presencial',
            type: 'Tiempo completo',
            period: '6 meses',
            schedule: '9:00-17:00',
            min_hr: 240,
            car: false,
            sector: 'Tecnología',
            tag: 'React, JavaScript, CSS',
            description: 'Desarrollo de aplicaciones web con React y tecnologías modernas',
            jobs: 'Desarrollo de componentes, testing, documentación',
            requisites: 'Conocimientos en React, JavaScript ES6+, HTML5, CSS3',
            profamilyId: 1,
            companyId: companyId // Agregar el companyId
        },
        {
            name: 'Analista de Datos',
            location: 'Barcelona',
            mode: 'Remoto',
            type: 'Tiempo parcial',
            period: '4 meses',
            schedule: '14:00-18:00',
            min_hr: 160,
            car: false,
            sector: 'Análisis',
            tag: 'Python, SQL, Excel',
            description: 'Análisis de datos y creación de reportes',
            jobs: 'Análisis estadístico, visualización de datos, reportes',
            requisites: 'Python, SQL, estadística básica',
            profamilyId: 1,
            companyId: companyId // Agregar el companyId
        }
    ];

    const createdOffers = [];
    
    for (const oferta of ofertas) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/offers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${companyToken}`
                },
                body: JSON.stringify(oferta)
            });

            const data = await response.json();
            
            if (response.ok) {
                console.log('✅ Oferta creada:', data.name);
                createdOffers.push(data);
            } else {
                console.log('❌ Error creando oferta:', data);
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
    
    return createdOffers;
}

// 3. Función para crear estudiante
async function createStudent() {
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'student_maria',
                email: 'maria@student.com',
                name: 'Maria',
                surname: 'González',
                password: 'password123',
                phone: '555-987-6543',
                role: 'student'
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Estudiante creado exitosamente:', data.user.name);
            return data;
        } else {
            console.log('❌ Error creando estudiante:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 4. Función para hacer login
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
            console.log('✅ Login exitoso para:', data.user.name);
            return data.token;
        } else {
            console.log('❌ Error en login:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 5. Función para obtener ofertas
async function getOffers() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/offers`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Ofertas obtenidas:', data.length);
            return data;
        } else {
            console.log('❌ Error obteniendo ofertas:', data);
            return [];
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// 6. Función para aplicar a una oferta
async function applyToOffer(token, offerId, message = 'Estoy muy interesado en esta posición') {
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
            console.log('❌ Error enviando aplicación:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 7. Función para obtener aplicaciones del usuario
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
            console.log('❌ Error obteniendo aplicaciones:', data);
            return [];
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return [];
    }
}

// 2.1 Función para obtener información de la empresa logueada
async function getCompanyProfile(companyToken) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/company`, {
            headers: {
                'Authorization': `Bearer ${companyToken}`
            }
        });

        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Perfil de empresa obtenido');
            return data[0]; // Asumimos que devuelve la empresa del usuario logueado
        } else {
            console.log('❌ Error obteniendo perfil de empresa:', data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

// 8. Función principal que ejecuta todo el flujo
async function runCompleteFlow() {
    console.log('🚀 INICIANDO FLUJO COMPLETO DE APLICACIONES\n');
    
    // PASO 1: Usar empresa existente
    console.log('📋 PASO 1: Usando empresa existente...');
    
    // PASO 2: Login como empresa para crear ofertas
    console.log('\n📋 PASO 2: Login como empresa...');
    const companyToken = await login('company3@techcorp.com', 'password123');
    if (!companyToken) {
        console.log('❌ No se pudo hacer login como empresa. Terminando.');
        return;
    }
    
    // PASO 2.1: Obtener perfil de la empresa
    console.log('\n📋 PASO 2.1: Obteniendo perfil de la empresa...');
    const companyProfile = await getCompanyProfile(companyToken);
    if (!companyProfile) {
        console.log('❌ No se pudo obtener el perfil de la empresa. Terminando.');
        return;
    }
    
    // PASO 3: Crear ofertas
    console.log('\n📋 PASO 3: Creando ofertas...');
    const offers = await createOffers(companyToken, companyProfile.id);
    if (offers.length === 0) {
        console.log('❌ No se pudieron crear ofertas. Terminando.');
        return;
    }
    
    // PASO 4: Crear estudiante
    console.log('\n📋 PASO 4: Creando estudiante...');
    const student = await createStudent();
    if (!student) {
        console.log('❌ No se pudo crear el estudiante. Terminando.');
        return;
    }
    
    // PASO 5: Login como estudiante
    console.log('\n📋 PASO 5: Login como estudiante...');
    const studentToken = await login('maria@student.com', 'password123');
    if (!studentToken) {
        console.log('❌ No se pudo hacer login como estudiante. Terminando.');
        return;
    }
    
    // PASO 6: Obtener ofertas disponibles
    console.log('\n📋 PASO 6: Obteniendo ofertas disponibles...');
    const availableOffers = await getOffers();
    if (availableOffers.length === 0) {
        console.log('❌ No hay ofertas disponibles. Terminando.');
        return;
    }
    
    // PASO 7: Aplicar a las ofertas
    console.log('\n📋 PASO 7: Aplicando a ofertas...');
    const applications = [];
    
    for (let i = 0; i < Math.min(2, availableOffers.length); i++) {
        const offer = availableOffers[i];
        console.log(`Aplicando a: ${offer.name}`);
        const application = await applyToOffer(studentToken, offer.id, `Me interesa mucho la posición de ${offer.name}`);
        if (application) {
            applications.push(application);
        }
    }
    
    // PASO 8: Verificar aplicaciones del estudiante
    console.log('\n📋 PASO 8: Verificando aplicaciones del estudiante...');
    const userApplications = await getUserApplications(studentToken);
    
    // RESUMEN FINAL
    console.log('\n🎉 FLUJO COMPLETADO EXITOSAMENTE!');
    console.log('📊 RESUMEN:');
    console.log('- Empresa usada: TechCorp Solutions 3');
    console.log('- Ofertas creadas:', offers.length);
    console.log('- Estudiante creado:', student.user.name);
    console.log('- Aplicaciones enviadas:', applications.length);
    console.log('- Aplicaciones confirmadas:', userApplications.length);
    
    if (userApplications.length > 0) {
        console.log('\n📋 APLICACIONES DEL ESTUDIANTE:');
        userApplications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.offer?.name || 'Oferta N/A'} - Estado: ${app.status}`);
        });
    }
    
    console.log('\n✅ El flujo de aplicaciones funciona correctamente!');
}

// Ejecutar el flujo completo
runCompleteFlow().catch(console.error);
