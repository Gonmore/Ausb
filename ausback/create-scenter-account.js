// Script para crear cuenta de centro de estudios

import { User, Student, Company, Offer, Application, Profamily, Scenter } from './src/models/relations.js';
import sequelize from './src/database/database.js';
import bcrypt from 'bcrypt';

async function createScenterAccount() {
    console.log('🏫 Creando cuenta de centro de estudios...\n');
    
    try {
        const password = 'password123';
        const hash = await bcrypt.hash(password, 10);
        
        // Crear usuario de centro de estudios
        const scenterUser = await User.create({
            username: 'scenter_admin',
            email: 'admin@cfp.edu',
            password: hash,
            role: 'scenter',
            name: 'Administrador',
            surname: 'Centro',
            phone: '555123456',
            description: 'Administrador del centro de estudios',
            active: true
        });
        
        console.log('✅ Usuario de centro de estudios creado');
        console.log(`Email: ${scenterUser.email}`);
        console.log(`Password: password123`);
        console.log(`Role: ${scenterUser.role}`);
        
        // Crear perfil de centro de estudios
        const scenter = await Scenter.create({
            name: 'Centro de Formación Profesional',
            code: 'CFP001',
            city: 'Madrid',
            active: true,
            address: 'Calle Educación 123',
            phone: '915551234',
            email: 'admin@cfp.edu',
            codigo_postal: '28001'
        });
        
        console.log('✅ Perfil de centro de estudios creado');
        console.log(`Nombre: ${scenter.name}`);
        console.log(`Código: ${scenter.code}`);
        console.log(`Ciudad: ${scenter.city}`);
        
        // Asociar usuario con centro
        await scenterUser.addScenter(scenter);
        console.log('✅ Usuario asociado al centro de estudios');
        
        // Verificar login
        console.log('\n🔐 Probando login...');
        const testResult = await bcrypt.compare('password123', scenterUser.password);
        console.log(`Login test result: ${testResult}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        process.exit(0);
    }
}

createScenterAccount();
