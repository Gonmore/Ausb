// Script para arreglar la contraseña del centro de estudios

import bcrypt from 'bcrypt';
import sequelize from './src/database/database.js';

async function fixScenterPassword() {
    console.log('🔐 Actualizando contraseña del centro de estudios...\n');
    
    try {
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Generated hash:', hash);
        
        // Verificar que el hash funciona
        const testResult = await bcrypt.compare(password, hash);
        console.log('Hash test result:', testResult);
        
        if (testResult) {
            // Actualizar usando raw SQL
            await sequelize.query('UPDATE users SET password = :hash WHERE email = :email', {
                replacements: { hash: hash, email: 'admin@cfp.edu' }
            });
            
            console.log('✅ Contraseña actualizada exitosamente');
            console.log('Credenciales del centro de estudios:');
            console.log('Email: admin@cfp.edu');
            console.log('Password: password123');
            console.log('Role: scenter');
            
            // Verificar la actualización
            const [results] = await sequelize.query('SELECT email, password FROM users WHERE email = :email', {
                replacements: { email: 'admin@cfp.edu' }
            });
            
            if (results.length > 0) {
                const user = results[0];
                const verifyResult = await bcrypt.compare(password, user.password);
                console.log('Final verification result:', verifyResult);
            }
        } else {
            console.log('❌ Hash test failed');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

fixScenterPassword();
