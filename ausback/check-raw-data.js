// Check raw user data to understand password storage

import { User } from './src/models/relations.js';
import sequelize from './src/database/database.js';

async function checkRawUserData() {
    console.log('🔍 Checking raw user data...\n');
    
    try {
        const user = await User.findOne({ where: { email: 'student@example.com' } });
        
        if (user) {
            console.log('Raw user data:');
            console.log(JSON.stringify(user.dataValues, null, 2));
            console.log('\nPassword field analysis:');
            console.log('Password value:', user.password);
            console.log('Password type:', typeof user.password);
            console.log('Password length:', user.password.length);
            console.log('Password bytes:', Buffer.from(user.password, 'utf8').length);
            
            // Check if it contains any non-printable characters
            const hasNonPrintable = /[^\x20-\x7E]/.test(user.password);
            console.log('Has non-printable chars:', hasNonPrintable);
            
            // Check the exact characters
            console.log('Password characters:');
            for (let i = 0; i < user.password.length; i++) {
                const char = user.password[i];
                const code = char.charCodeAt(0);
                console.log(`${i}: '${char}' (${code})`);
            }
        } else {
            console.log('User not found!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

checkRawUserData();
