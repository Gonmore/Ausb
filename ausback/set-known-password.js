// Script to set a known working password hash

import sequelize from './src/database/database.js';
import bcrypt from 'bcrypt';

async function setKnownPassword() {
    console.log('🔐 Setting known working password...\n');
    
    try {
        // Create a hash that we know works
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);
        
        console.log('Generated hash:', hash);
        
        // Test the hash immediately
        const testResult = await bcrypt.compare(password, hash);
        console.log('Hash test result:', testResult);
        
        if (testResult) {
            // Update all users with this hash using raw SQL
            await sequelize.query('UPDATE users SET password = :hash WHERE email = :email', {
                replacements: { hash: hash, email: 'student@example.com' }
            });
            
            await sequelize.query('UPDATE users SET password = :hash WHERE email = :email', {
                replacements: { hash: hash, email: 'company1@example.com' }
            });
            
            await sequelize.query('UPDATE users SET password = :hash WHERE email = :email', {
                replacements: { hash: hash, email: 'company2@example.com' }
            });
            
            console.log('✅ Passwords updated using raw SQL');
            
            // Test retrieval
            const [results] = await sequelize.query('SELECT email, password FROM users WHERE email = :email', {
                replacements: { email: 'student@example.com' }
            });
            
            if (results.length > 0) {
                const user = results[0];
                console.log('Retrieved user:', user.email);
                console.log('Retrieved hash:', user.password);
                
                // Test the retrieved hash
                const retrievedTest = await bcrypt.compare(password, user.password);
                console.log('Retrieved hash test:', retrievedTest);
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

setKnownPassword();
