// Test simple de bcrypt

import 'dotenv/config';
import bcrypt from 'bcrypt';

async function testBcrypt() {
    console.log('BCRYPT_SALT_ROUNDS from env:', process.env.BCRYPT_SALT_ROUNDS);
    console.log('Parsed value:', +process.env.BCRYPT_SALT_ROUNDS);
    
    const saltRounds = +process.env.BCRYPT_SALT_ROUNDS || 10;
    console.log('Salt rounds to use:', saltRounds);
    
    try {
        // Hash de prueba
        const password = 'password123';
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Hash generado:', hash);
        
        // Verificar
        const isValid = await bcrypt.compare(password, hash);
        console.log('Password válida:', isValid);
        
    } catch (error) {
        console.error('Error:', error);
    }
}

testBcrypt();
