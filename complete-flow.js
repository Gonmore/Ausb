// Script completo para crear todo el flujo desde cero
const API_BASE_URL = 'http://127.0.0.1:5000';

// 1. Crear empresa
async function createCompany() {
    console.log('1. Creando empresa...');
    
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'techcorp',
            email: 'empresa@techcorp.com',
            name: 'TechCorp',
            surname: 'Empresa',
            password: 'password123',
            role: 'company',
            phone: '123456789',
            description: 'Empresa tecnológica'
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Empresa creada:', data.user.email);
        return data.user.id;
    } else {
        console.log('❌ Error creando empresa:', data);
        return null;
    }
}

// 2. Crear estudiante
async function createStudent() {
    console.log('2. Creando estudiante...');
    
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: 'juan_estudiante',
            email: 'juan@estudiante.com',
            name: 'Juan',
            surname: 'Pérez',
            password: 'password123',
            role: 'student',
            phone: '987654321'
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Estudiante creado:', data.user.email);
        return data.user.id;
    } else {
        console.log('❌ Error creando estudiante:', data);
        return null;
    }
}

// 3. Login como empresa para crear ofertas
async function loginAsCompany() {
    console.log('3. Haciendo login como empresa...');
    
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'empresa@techcorp.com',
            password: 'password123'
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Login empresa exitoso');
        return data.token;
    } else {
        console.log('❌ Error en login empresa:', data);
        return null;
    }
}

// 4. Crear oferta (necesitamos el token de empresa)
async function createOffer(companyToken) {
    console.log('4. Creando oferta...');
    
    const response = await fetch(`${API_BASE_URL}/api/offers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${companyToken}`
        },
        body: JSON.stringify({
            name: 'Prácticas Desarrollo Full Stack',
            location: 'Madrid',
            mode: 'Presencial',
            type: 'Tiempo completo',
            period: '3 meses',
            schedule: '9:00 - 17:00',
            min_hr: 200,
            car: false,
            sector: 'Tecnología',
            tag: 'React, Node.js, JavaScript',
            description: 'Prácticas en desarrollo full stack con tecnologías modernas',
            jobs: 'Desarrollo de aplicaciones web, APIs REST, testing',
            requisites: 'Conocimientos básicos de JavaScript, HTML, CSS',
            profamilyId: 1
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Oferta creada:', data.name);
        return data.id;
    } else {
        console.log('❌ Error creando oferta:', data);
        return null;
    }
}

// 5. Login como estudiante
async function loginAsStudent() {
    console.log('5. Haciendo login como estudiante...');
    
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'juan@estudiante.com',
            password: 'password123'
        })
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Login estudiante exitoso');
        return data.token;
    } else {
        console.log('❌ Error en login estudiante:', data);
        return null;
    }
}

// 6. Obtener ofertas disponibles
async function getOffers() {
    console.log('6. Obteniendo ofertas...');
    
    const response = await fetch(`${API_BASE_URL}/api/offers`);
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Ofertas obtenidas:', data.length);
        return data;
    } else {
        console.log('❌ Error obteniendo ofertas:', data);
        return [];
    }
}

// 7. Aplicar a oferta (estudiante aplica a oferta)
async function applyToOffer(studentToken, offerId) {
    console.log('7. Aplicando a oferta...');
    
    const response = await fetch(`${API_BASE_URL}/api/applications`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${studentToken}`
        },
        body: JSON.stringify({
            offerId: offerId,
            message: 'Estoy muy interesado en esta oferta de prácticas'
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
}

// 8. Verificar aplicaciones del estudiante
async function getStudentApplications(studentToken) {
    console.log('8. Obteniendo aplicaciones del estudiante...');
    
    const response = await fetch(`${API_BASE_URL}/api/applications/user`, {
        headers: {
            'Authorization': `Bearer ${studentToken}`
        }
    });
    
    const data = await response.json();
    
    if (response.ok) {
        console.log('✅ Aplicaciones del estudiante:', data.length);
        return data;
    } else {
        console.log('❌ Error obteniendo aplicaciones:', data);
        return [];
    }
}

// Función principal que ejecuta todo el flujo
async function runCompleteFlow() {
    console.log('🚀 INICIANDO FLUJO COMPLETO\n');
    
    try {
        // 1. Crear empresa
        const companyUserId = await createCompany();
        if (!companyUserId) return;
        
        // 2. Crear estudiante
        const studentUserId = await createStudent();
        if (!studentUserId) return;
        
        // 3. Login como empresa
        const companyToken = await loginAsCompany();
        if (!companyToken) return;
        
        // 4. Crear oferta
        const offerId = await createOffer(companyToken);
        if (!offerId) return;
        
        // 5. Login como estudiante
        const studentToken = await loginAsStudent();
        if (!studentToken) return;
        
        // 6. Obtener ofertas
        const offers = await getOffers();
        if (offers.length === 0) return;
        
        // 7. Aplicar a la primera oferta
        const application = await applyToOffer(studentToken, offers[0].id);
        if (!application) return;
        
        // 8. Verificar aplicaciones
        const applications = await getStudentApplications(studentToken);
        
        console.log('\n✅ FLUJO COMPLETADO EXITOSAMENTE!');
        console.log('📊 Resumen:');
        console.log('- Empresa creada: ✅');
        console.log('- Estudiante creado: ✅');
        console.log('- Oferta creada: ✅');
        console.log('- Aplicación enviada: ✅');
        console.log('- Aplicaciones del estudiante:', applications.length);
        
        if (applications.length > 0) {
            console.log('\n📋 Detalles de la aplicación:');
            applications.forEach((app, index) => {
                console.log(`${index + 1}. Oferta: ${app.offer?.name || 'N/A'}`);
                console.log(`   Empresa: ${app.company?.name || 'N/A'}`);
                console.log(`   Estado: ${app.status || 'N/A'}`);
                console.log(`   Mensaje: ${app.message || 'N/A'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error en el flujo:', error);
    }
}

// Ejecutar el flujo completo
runCompleteFlow();
