// Script to update user passwords with correct hashes

import { User } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import { encriptar, comparar } from './src/common/bcrypt.js';

async function updatePasswords() {
    console.log('🔐 Updating user passwords with correct hashes...\n');
    
    try {
        // Test password
        const testPassword = 'password123';
        
        // Get all users
        const users = await User.findAll();
        
        for (const user of users) {
            console.log(`Updating password for: ${user.email}`);
            
            // Generate new hash
            const newHash = await encriptar(testPassword);
            console.log(`New hash: ${newHash}`);
            
            // Update user with new hash
            await user.update({ password: newHash });
            
            // Test the updated password
            const updatedUser = await User.findByPk(user.id);
            const isValid = await comparar(testPassword, updatedUser.password);
            console.log(`Password validation: ${isValid}\n`);
        }
        
        console.log('✅ All passwords updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating passwords:', error);
    } finally {
        process.exit(0);
    }
}

updatePasswords();
