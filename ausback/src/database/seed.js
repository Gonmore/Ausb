import sequelize from "../database/database.js";
import { User } from "../models/users.js";
import { Company } from "../models/company.js";
import { Scenter } from "../models/scenter.js";
import { Offer } from "../models/offer.js";
import { Student } from "../models/student.js";
import { Profamily } from "../models/profamily.js";
import { Tutor } from "../models/tutor.js";
import { Application } from "../models/application.js";
import { CompanyToken } from "../models/companyToken.js";
import logger from '../logs/logger.js';

async function seedDatabase() {
    try {
        logger.info('🌱 Iniciando seed de la base de datos...');

        // Sincronizar base de datos
        await sequelize.sync({ alter: true });

        // 1. Crear Familias Profesionales
        logger.info('📚 Creando familias profesionales...');
        const profamilies = await Profamily.bulkCreate([
            {
                name: "Informática y Comunicaciones",
                description: "Desarrollo de software, redes, sistemas informáticos"
            },
            {
                name: "Administración y Gestión",
                description: "Gestión empresarial, contabilidad, recursos humanos"
            },
            {
                name: "Comercio y Marketing",
                description: "Ventas, marketing digital, comercio internacional"
            },
            {
                name: "Sanidad",
                description: "Auxiliar de enfermería, farmacia, laboratorio"
            },
            {
                name: "Servicios Socioculturales",
                description: "Educación infantil, integración social, animación"
            }
        ], { ignoreDuplicates: true });

        // 2. Crear Centros de Estudios
        logger.info('🏫 Creando centros de estudios...');
        const scenters = await Scenter.bulkCreate([
            {
                name: "IES Tecnológico Madrid",
                code: "IES001",
                city: "Madrid",
                address: "Calle Tecnología 123",
                phone: "911234567",
                email: "info@iestecnologico.edu.es",
                codigo_postal: "28001",
                active: true
            },
            {
                name: "Centro de FP Avanzada Barcelona",
                code: "CFP002", 
                city: "Barcelona",
                address: "Avda. Innovación 456",
                phone: "931234567",
                email: "contacto@fpavanzada.edu.es",
                codigo_postal: "08001",
                active: true
            },
            {
                name: "Instituto Superior Valencia",
                code: "ISV003",
                city: "Valencia", 
                address: "Plaza Educación 789",
                phone: "961234567",
                email: "admin@isuvalencia.edu.es",
                codigo_postal: "46001",
                active: true
            }
        ], { ignoreDuplicates: true });

        // 3. Crear Empresas
        logger.info('🏢 Creando empresas...');
        const companies = await Company.bulkCreate([
            {
                name: "TechSolutions España",
                code: "TECH001",
                city: "Madrid",
                address: "Calle Innovation 100",
                phone: "911111111",
                email: "rrhh@techsolutions.es",
                web: "www.techsolutions.es",
                sector: "Tecnología",
                rrhh: "Maria García",
                main: "Desarrollo de software",
                description: "Empresa líder en desarrollo de aplicaciones web y móviles",
                active: true
            },
            {
                name: "Consultoría Empresarial BCN",
                code: "CONS002",
                city: "Barcelona", 
                address: "Rambla Negocio 200",
                phone: "932222222",
                email: "practicas@consultoriabcn.es",
                web: "www.consultoriabcn.es",
                sector: "Consultoría",
                rrhh: "Pedro Martinez",
                main: "Consultoría de gestión",
                description: "Asesoramiento integral para empresas",
                active: true
            },
            {
                name: "HealthCare Valencia",
                code: "HEAL003",
                city: "Valencia",
                address: "Avda. Salud 300", 
                phone: "963333333",
                email: "recursos@healthcare.es",
                web: "www.healthcare.es",
                sector: "Sanidad",
                rrhh: "Ana López",
                main: "Servicios sanitarios",
                description: "Centro de servicios de salud especializados",
                active: true
            },
            {
                name: "Marketing Digital Pro",
                code: "MARK004",
                city: "Sevilla",
                address: "Calle Publicidad 400",
                phone: "954444444", 
                email: "talento@marketingpro.es",
                web: "www.marketingpro.es",
                sector: "Marketing",
                rrhh: "Carlos Ruiz",
                main: "Marketing digital y publicidad",
                description: "Agencia de marketing digital y comunicación",
                active: true
            }
        ], { ignoreDuplicates: true });

        // 4. Crear Usuarios
        logger.info('👥 Creando usuarios...');
        const users = await User.bulkCreate([
            // Estudiantes
            {
                username: "estudiante1",
                email: "estudiante1@test.com",
                password: "123456", // Se encriptará automáticamente
                role: "student",
                name: "Juan",
                surname: "Pérez",
                phone: "600111111",
                description: "Estudiante de desarrollo web",
                active: true
            },
            {
                username: "estudiante2", 
                email: "estudiante2@test.com",
                password: "123456",
                role: "student",
                name: "María",
                surname: "González",
                phone: "600222222",
                description: "Estudiante de marketing digital",
                active: true
            },
            // Empresa
            {
                username: "empresa1",
                email: "empresa1@test.com", 
                password: "123456",
                role: "company",
                name: "Tech",
                surname: "Solutions",
                phone: "911111111",
                description: "Representante de TechSolutions España",
                active: true
            },
            // Centro
            {
                username: "centro1",
                email: "centro1@test.com",
                password: "123456", 
                role: "scenter",
                name: "IES",
                surname: "Tecnológico",
                phone: "911234567",
                description: "Coordinador del IES Tecnológico Madrid",
                active: true
            },
            // Tutor
            {
                username: "tutor1",
                email: "tutor1@test.com",
                password: "123456",
                role: "tutor", 
                name: "Carmen",
                surname: "Fernández",
                phone: "600333333",
                description: "Tutora de prácticas en informática",
                active: true
            },
            // Admin
            {
                username: "admin",
                email: "admin@ausbildung.com",
                password: "admin123",
                role: "admin",
                name: "Administrador",
                surname: "Sistema",
                phone: "900000000", 
                description: "Administrador del sistema Ausbildung",
                active: true
            }
        ], { ignoreDuplicates: true });

        // 5. Crear Estudiantes (datos adicionales)
        logger.info('🎓 Creando perfiles de estudiantes...');
        const students = await Student.bulkCreate([
            {
                grade: "Grado Superior",
                course: "Desarrollo de Aplicaciones Web",
                double: false,
                car: true,
                active: true,
                tag: "Full Stack",
                description: "Especializado en React y Node.js",
                disp: "2024-09-01"
            },
            {
                grade: "Grado Medio",
                course: "Marketing y Publicidad", 
                double: false,
                car: false,
                active: true,
                tag: "Digital Marketing",
                description: "Enfocado en redes sociales y SEO",
                disp: "2024-10-15"
            },
            {
                grade: "Grado Superior",
                course: "Administración y Finanzas",
                double: true,
                car: true, 
                active: true,
                tag: "Gestión Empresarial",
                description: "Conocimientos en contabilidad y RRHH",
                disp: "2024-11-01"
            }
        ], { ignoreDuplicates: true });

        // 6. Crear Tutores
        logger.info('👨‍🏫 Creando tutores...');
        const tutors = await Tutor.bulkCreate([
            {
                id: "TUT001",
                name: "Carmen Fernández",
                email: "carmen.fernandez@ies001.edu",
                grade: "A",
                degree: "Ingeniería Informática"
            },
            {
                id: "TUT002",
                name: "Roberto Silva",
                email: "roberto.silva@ies002.edu",
                grade: "A",
                degree: "Administración de Empresas"
            },
            {
                id: "TUT003",
                name: "Laura Morales",
                email: "laura.morales@ies003.edu",
                grade: "B",
                degree: "Marketing Digital"
            }
        ], { ignoreDuplicates: true });

        // 7. Crear Ofertas
        logger.info('💼 Creando ofertas de prácticas...');
        const offers = await Offer.bulkCreate([
            {
                name: "Prácticas Desarrollo Frontend",
                location: "Madrid",
                mode: "Presencial", 
                type: "Desarrollo Web",
                period: "6 meses",
                schedule: "Mañana",
                min_hr: 400,
                car: false,
                sector: "Tecnología",
                tag: "React, JavaScript",
                description: "Oportunidad de prácticas en desarrollo frontend con React y tecnologías modernas",
                jobs: "Desarrollo de interfaces, maquetación, testing",
                requisites: "Conocimientos en HTML, CSS, JavaScript. Valorable React"
            },
            {
                name: "Prácticas Marketing Digital",
                location: "Barcelona",
                mode: "Híbrido",
                type: "Marketing",
                period: "4 meses", 
                schedule: "Tarde",
                min_hr: 300,
                car: false,
                sector: "Marketing",
                tag: "SEO, SEM, Redes Sociales",
                description: "Prácticas en agencia de marketing digital especializada en e-commerce",
                jobs: "Gestión de campañas, análisis de métricas, content marketing",
                requisites: "Formación en marketing digital. Conocimientos de Google Ads y Analytics"
            },
            {
                name: "Prácticas Administración",
                location: "Valencia",
                mode: "Presencial",
                type: "Gestión",
                period: "5 meses",
                schedule: "Mañana",
                min_hr: 350, 
                car: true,
                sector: "Consultoría",
                tag: "Contabilidad, RRHH",
                description: "Prácticas en departamento de administración de consultora",
                jobs: "Gestión documental, apoyo contable, procesos de RRHH",
                requisites: "Estudios en administración. Nivel intermedio de Excel"
            },
            {
                name: "Prácticas Soporte IT",
                location: "Sevilla", 
                mode: "Presencial",
                type: "Tecnología",
                period: "6 meses",
                schedule: "Mañana",
                min_hr: 400,
                car: false,
                sector: "Tecnología",
                tag: "Hardware, Software, Redes",
                description: "Soporte técnico en empresa de servicios informáticos",
                jobs: "Resolución de incidencias, mantenimiento equipos, configuración redes",
                requisites: "Formación en sistemas informáticos. Conocimientos de redes y hardware"
            }
        ], { ignoreDuplicates: true });

        logger.info('✅ Seed completado exitosamente!');
        logger.info(`📊 Datos creados:
        - ${profamilies.length} familias profesionales
        - ${scenters.length} centros de estudios  
        - ${companies.length} empresas
        - ${users.length} usuarios
        - ${students.length} perfiles de estudiantes
        - ${tutors.length} tutores
        - ${offers.length} ofertas de prácticas`);

        return {
            success: true,
            data: {
                profamilies: profamilies.length,
                scenters: scenters.length,
                companies: companies.length, 
                users: users.length,
                students: students.length,
                tutors: tutors.length,
                offers: offers.length
            }
        };

    } catch (error) {
        logger.error('❌ Error durante el seed:', error);
        throw error;
    }
}

export default seedDatabase;
