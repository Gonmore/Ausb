// Test bcrypt directly without models

import bcrypt from 'bcrypt';
import 'dotenv/config';

async function testBcryptDirect() {
    console.log('🔍 Testing bcrypt directly...\n');
    
    try {
        const password = 'password123';
        const saltRounds = +process.env.BCRYPT_SALT_ROUNDS;
        
        console.log('BCRYPT_SALT_ROUNDS:', process.env.BCRYPT_SALT_ROUNDS);
        console.log('Parsed salt rounds:', saltRounds);
        
        // Hash the password
        const hash = await bcrypt.hash(password, saltRounds);
        console.log('Generated hash:', hash);
        
        // Test comparison
        const isValid = await bcrypt.compare(password, hash);
        console.log('Direct bcrypt compare result:', isValid);
        
        // Test with different password
        const wrongPassword = 'wrongpassword';
        const isInvalid = await bcrypt.compare(wrongPassword, hash);
        console.log('Wrong password compare result:', isInvalid);
        
        // Test specific hash format
        const testHash = '$2b$10$A3i1tHI21ocnTt374i9Rle.KLv2VZleNrAuM2cRGD.QN1L4wjvfei';
        console.log('\\nTesting specific hash:', testHash);
        const testResult = await bcrypt.compare(password, testHash);
        console.log('Specific hash comparison:', testResult);
        
    } catch (error) {
        console.error('❌ Error:', error);
    }
}

testBcryptDirect();
