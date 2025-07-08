// Script to manually set correct passwords for all users

import { User } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';

async function setCorrectPasswords() {
    console.log('🔐 Setting correct passwords for all users...\n');
    
    try {
        const testPassword = 'password123';
        const saltRounds = +process.env.BCRYPT_SALT_ROUNDS;
        
        console.log('Using password:', testPassword);
        console.log('Salt rounds:', saltRounds);
        console.log('');
        
        // Generate the correct hash
        const correctHash = await bcrypt.hash(testPassword, saltRounds);
        console.log('Generated hash:', correctHash);
        
        // Verify the hash works
        const verificationResult = await bcrypt.compare(testPassword, correctHash);
        console.log('Hash verification:', verificationResult);
        console.log('');
        
        // Update all users with the correct hash
        const users = await User.findAll();
        console.log(`Found ${users.length} users to update`);
        
        for (const user of users) {
            console.log(`Updating password for: ${user.email}`);
            await user.update({ password: correctHash });
            
            // Test the updated password immediately
            const updatedUser = await User.findByPk(user.id);
            const testResult = await bcrypt.compare(testPassword, updatedUser.password);
            console.log(`Password test result: ${testResult}`);
        }
        
        console.log('\n✅ All passwords updated successfully!');
        console.log('All users should now be able to login with password: password123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

setCorrectPasswords();
