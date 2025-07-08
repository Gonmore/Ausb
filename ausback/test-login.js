// Script para verificar login

import { User } from './src/models/relations.js';
import { comparar } from './src/common/bcrypt.js';

async function testLogin() {
    try {
        console.log('🔍 Verificando usuarios...\n');
        
        const users = await User.findAll();
        
        for (const user of users) {
            console.log(`Usuario: ${user.email}`);
            console.log(`Role: ${user.role}`);
            console.log(`Password hash: ${user.password}`);
            
            // Probar la contraseña
            const isValid = await comparar('password123', user.password);
            console.log(`Password válida: ${isValid}\n`);
        }
        
        // Intentar login específico
        console.log('🔐 Probando login específico...');
        const student = await User.findOne({
            where: {
                email: 'student@example.com'
            }
        });
        
        if (student) {
            console.log('Estudiante encontrado:', student.email);
            const passwordCheck = await comparar('password123', student.password);
            console.log('Password check result:', passwordCheck);
        } else {
            console.log('Estudiante no encontrado');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit(0);
    }
}

testLogin();
