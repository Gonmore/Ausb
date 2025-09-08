import sequelize from './src/database/database.js';

async function addCVColumns() {
    try {
        console.log('🔄 Agregando columnas cvViewed y cvViewedAt a la tabla applications...');
        
        const queryInterface = sequelize.getQueryInterface();
        
        // Verificar si las columnas ya existen
        const tableDescription = await queryInterface.describeTable('applications');
        
        if (!tableDescription.cvViewed) {
            await queryInterface.addColumn('applications', 'cvViewed', {
                type: sequelize.Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
                comment: 'Si la empresa ya vio el CV del candidato'
            });
            console.log('✅ Columna cvViewed agregada');
        } else {
            console.log('ℹ️ Columna cvViewed ya existe');
        }
        
        if (!tableDescription.cvViewedAt) {
            await queryInterface.addColumn('applications', 'cvViewedAt', {
                type: sequelize.Sequelize.DATE,
                allowNull: true,
                comment: 'Cuándo la empresa vio el CV'
            });
            console.log('✅ Columna cvViewedAt agregada');
        } else {
            console.log('ℹ️ Columna cvViewedAt ya existe');
        }
        
        console.log('🎉 Migración completada exitosamente');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        process.exit(1);
    }
}

addCVColumns();