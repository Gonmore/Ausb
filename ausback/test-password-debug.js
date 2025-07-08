// Test to debug password validation

import { User } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import { encriptar, comparar } from './src/common/bcrypt.js';

async function testPasswordValidation() {
    console.log('🔍 Testing password validation...\n');
    
    try {
        // First, let's create a new hash and immediately test it
        console.log('1. Creating new hash and testing immediately...');
        const testPassword = 'password123';
        const newHash = await encriptar(testPassword);
        console.log(`Password: ${testPassword}`);
        console.log(`Hash: ${newHash}`);
        const isValid = await comparar(testPassword, newHash);
        console.log(`Validation result: ${isValid}\n`);
        
        // Now let's check what's in the database
        console.log('2. Checking database users...');
        const users = await User.findAll();
        
        for (const user of users) {
            console.log(`User: ${user.email}`);
            console.log(`Stored hash: ${user.password}`);
            
            // Test with the expected password
            const validationResult = await comparar('password123', user.password);
            console.log(`Validation with 'password123': ${validationResult}`);
            
            // Test with the hash that should be generated
            const expectedHash = await encriptar('password123');
            console.log(`New hash for comparison: ${expectedHash}`);
            const newValidation = await comparar('password123', expectedHash);
            console.log(`New hash validation: ${newValidation}\n`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

testPasswordValidation();
