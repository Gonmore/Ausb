// Script para agregar columnas faltantes a la base de datos
import sequelize from './src/database/database.js';

async function addMissingColumns() {
    console.log('🔧 Agregando columnas faltantes a la base de datos...\n');
    
    try {
        // 1. Agregar userId a companies (permitir NULL inicialmente)
        console.log('1. Agregando columna userId a companies...');
        await sequelize.query('ALTER TABLE "companies" ADD COLUMN IF NOT EXISTS "userId" INTEGER;');
        console.log('✅ Columna userId agregada a companies\n');
        
        // 2. Agregar userId a students (permitir NULL inicialmente)
        console.log('2. Agregando columna userId a students...');
        await sequelize.query('ALTER TABLE "students" ADD COLUMN IF NOT EXISTS "userId" INTEGER;');
        console.log('✅ Columna userId agregada a students\n');
        
        // 3. Agregar companyId a offers (permitir NULL inicialmente)
        console.log('3. Agregando columna companyId a offers...');
        await sequelize.query('ALTER TABLE "offers" ADD COLUMN IF NOT EXISTS "companyId" INTEGER;');
        console.log('✅ Columna companyId agregada a offers\n');
        
        // 4. Verificar columnas existentes
        console.log('4. Verificando columnas existentes...');
        const companiesColumns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='companies';");
        const studentsColumns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='students';");
        const offersColumns = await sequelize.query("SELECT column_name FROM information_schema.columns WHERE table_name='offers';");
        
        console.log('Columnas en companies:', companiesColumns[0].map(c => c.column_name));
        console.log('Columnas en students:', studentsColumns[0].map(c => c.column_name));
        console.log('Columnas en offers:', offersColumns[0].map(c => c.column_name));
        
        console.log('\n✅ Columnas agregadas exitosamente');
        
    } catch (error) {
        console.error('❌ Error agregando columnas:', error.message);
        throw error;
    }
}

// Ejecutar
addMissingColumns()
    .then(() => {
        console.log('\n🎉 Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Error:', error.message);
        process.exit(1);
    });
