// Script para crear el registro de Student faltante
const https = require('https');
const http = require('http');

const API_BASE = 'http://localhost:5000';

// Función helper para hacer requests
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const protocol = urlObj.protocol === 'https:' ? https : http;
        
        const reqOptions = {
            hostname: urlObj.hostname,
            port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = protocol.request(reqOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(data);
                    resolve({ data: parsedData, statusCode: res.statusCode });
                } catch (e) {
                    resolve({ data: data, statusCode: res.statusCode });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function createNewStudentUser() {
    try {
        console.log('🔄 Creando nuevo usuario estudiante...\n');
        
        const timestamp = Date.now();
        const studentData = {
            username: `student_${timestamp}`,
            email: `student_${timestamp}@example.com`,
            password: 'password123',
            role: 'student',
            name: 'Estudiante',
            surname: 'Prueba'
        };
        
        console.log('Datos del usuario:', studentData);
        
        const registerResponse = await makeRequest(`${API_BASE}/register`, {
            method: 'POST',
            body: studentData
        });
        
        console.log('Response status:', registerResponse.statusCode);
        console.log('Response data:', registerResponse.data);
        
        if (registerResponse.statusCode === 201) {
            console.log('✅ Usuario creado exitosamente');
            
            // Hacer login
            const loginResponse = await makeRequest(`${API_BASE}/login`, {
                method: 'POST',
                body: {
                    email: studentData.email,
                    password: studentData.password
                }
            });
            
            if (loginResponse.statusCode === 200) {
                const token = loginResponse.data.token;
                console.log('✅ Login exitoso. Token obtenido');
                
                // Probar obtener aplicaciones
                const appsResponse = await makeRequest(`${API_BASE}/api/applications/user`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                console.log('Aplicaciones response:', appsResponse.statusCode, appsResponse.data);
                
                if (appsResponse.statusCode === 200) {
                    console.log('🎉 ¡ÉXITO! El registro de Student se creó correctamente');
                    console.log('📋 Usuario listo para aplicar a ofertas');
                    
                    // Devolver los datos para usar en el test
                    return {
                        email: studentData.email,
                        password: studentData.password,
                        token: token,
                        userId: loginResponse.data.user.id
                    };
                } else {
                    console.log('❌ Error obteniendo aplicaciones:', appsResponse.data);
                }
            } else {
                console.log('❌ Error en login:', loginResponse.data);
            }
        } else {
            console.log('❌ Error creando usuario:', registerResponse.data);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

createNewStudentUser().then(userData => {
    if (userData) {
        console.log('\n🔗 Datos del usuario para test:');
        console.log('Email:', userData.email);
        console.log('Password:', userData.password);
        console.log('UserID:', userData.userId);
    }
});
