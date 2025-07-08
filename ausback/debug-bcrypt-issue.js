// Test to understand why bcrypt comparison fails with stored hashes

import { User } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import bcrypt from 'bcrypt';
import { comparar } from './src/common/bcrypt.js';
import 'dotenv/config';

async function debugBcryptIssue() {
    console.log('🔍 Debugging bcrypt comparison issue...\n');
    
    try {
        const testPassword = 'password123';
        const saltRounds = +process.env.BCRYPT_SALT_ROUNDS;
        
        console.log('Environment variables:');
        console.log('BCRYPT_SALT_ROUNDS:', process.env.BCRYPT_SALT_ROUNDS);
        console.log('Parsed salt rounds:', saltRounds);
        console.log('');
        
        // Test 1: Direct bcrypt usage
        console.log('Test 1: Direct bcrypt usage');
        const directHash = await bcrypt.hash(testPassword, saltRounds);
        console.log('Direct hash:', directHash);
        const directCompare = await bcrypt.compare(testPassword, directHash);
        console.log('Direct compare:', directCompare);
        console.log('');
        
        // Test 2: Using our bcrypt module
        console.log('Test 2: Using our bcrypt module (comparar function)');
        const moduleCompare = await comparar(testPassword, directHash);
        console.log('Module compare:', moduleCompare);
        console.log('');
        
        // Test 3: Get user from database and test
        console.log('Test 3: Database user test');
        const user = await User.findOne({ where: { email: 'student@example.com' } });
        if (user) {
            console.log('User found:', user.email);
            console.log('Stored hash:', user.password);
            console.log('Hash length:', user.password.length);
            console.log('Hash starts with $2b$:', user.password.startsWith('$2b$'));
            
            // Test with both direct bcrypt and our module
            const dbDirectCompare = await bcrypt.compare(testPassword, user.password);
            console.log('DB - Direct bcrypt compare:', dbDirectCompare);
            
            const dbModuleCompare = await comparar(testPassword, user.password);
            console.log('DB - Module compare:', dbModuleCompare);
            
            // Test with wrong password
            const wrongPassword = 'wrongpassword';
            const wrongDirectCompare = await bcrypt.compare(wrongPassword, user.password);
            console.log('Wrong password - Direct bcrypt compare:', wrongDirectCompare);
            
            const wrongModuleCompare = await comparar(wrongPassword, user.password);
            console.log('Wrong password - Module compare:', wrongModuleCompare);
        } else {
            console.log('User not found!');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

debugBcryptIssue();
