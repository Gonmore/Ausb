import { Application, Student, User, Offer, Company } from './src/models/relations.js';

async function diagnoseRelations() {
    try {
        console.log('🔍 Diagnosticando relaciones de modelos...\n');

        // 1. Verificar asociaciones de Application
        console.log('📋 Asociaciones de Application:');
        const appAssociations = Object.keys(Application.associations);
        console.log('  - Asociaciones:', appAssociations);
        
        appAssociations.forEach(assoc => {
            const association = Application.associations[assoc];
            console.log(`  - ${assoc}: ${association.associationType} (as: "${association.as || 'sin alias'}")`);
        });

        // 2. Verificar asociaciones de Student
        console.log('\n👨‍🎓 Asociaciones de Student:');
        const studentAssociations = Object.keys(Student.associations);
        console.log('  - Asociaciones:', studentAssociations);
        
        studentAssociations.forEach(assoc => {
            const association = Student.associations[assoc];
            console.log(`  - ${assoc}: ${association.associationType} (as: "${association.as || 'sin alias'}")`);
        });

        // 3. Probar una consulta simple
        console.log('\n🧪 Probando consulta simple...');
        
        try {
            const testApplication = await Application.findOne({
                include: [
                    {
                        model: Student,
                        required: false
                    }
                ]
            });
            console.log('✅ Consulta sin alias funcionó');
        } catch (error) {
            console.log('❌ Error sin alias:', error.message);
            
            // Probar con alias común
            try {
                const testApplication = await Application.findOne({
                    include: [
                        {
                            model: Student,
                            as: 'student',
                            required: false
                        }
                    ]
                });
                console.log('✅ Consulta con alias "student" funcionó');
            } catch (error2) {
                console.log('❌ Error con alias "student":', error2.message);
                
                // Probar con alias mayúscula
                try {
                    const testApplication = await Application.findOne({
                        include: [
                            {
                                model: Student,
                                as: 'Student',
                                required: false
                            }
                        ]
                    });
                    console.log('✅ Consulta con alias "Student" funcionó');
                } catch (error3) {
                    console.log('❌ Error con alias "Student":', error3.message);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error en diagnóstico:', error);
    } finally {
        process.exit(0);
    }
}

diagnoseRelations();