import { Offer, Profamily, Company, Application, Student, User, Skill, UserCompany } from '../models/relations.js';
import companyService from '../services/companyService.js'; // 🔥 AÑADIR ESTE IMPORT
import affinityCalculator from '../services/affinityCalculator.js';
import logger from '../logs/logger.js';
import sequelize from '../database/database.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       required:
 *         - name
 *         - location
 *         - mode
 *         - type
 *         - period
 *         - sector
 *         - description
 *         - jobs
 *         - requisites
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la oferta
 *         name:
 *           type: string
 *           description: Nombre de la oferta
 *         location:
 *           type: string
 *           description: Ubicación de la oferta
 *         mode:
 *           type: string
 *           description: Modalidad (presencial, remoto, híbrido)
 *         type:
 *           type: string
 *           description: Tipo de oferta
 *         period:
 *           type: string
 *           description: Período de duración
 *         schedule:
 *           type: string
 *           description: Horario
 *         min_hr:
 *           type: integer
 *           description: Horas mínimas requeridas
 *           default: 200
 *         car:
 *           type: boolean
 *           description: Requiere vehículo propio
 *           default: false
 *         sector:
 *           type: string
 *           description: Sector empresarial (opcional)
 *         description:
 *           type: string
 *           description: Descripción detallada
 *         jobs:
 *           type: string
 *           description: Trabajos a realizar
 *         requisites:
 *           type: string
 *           description: Requisitos necesarios
 *         profamilyId:
 *           type: integer
 *           description: ID de la familia profesional
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

// ELIMINADO: función extractSkillsFromOffer con datos hardcodeados
// Las skills ahora vienen de la relación profesional Offer -> OfferSkill -> Skill

/**
 * @swagger
 * /api/offers:
 *   get:
 *     summary: Obtener todas las ofertas
 *     tags: [Offers]
 *     security: []
 *     responses:
 *       200:
 *         description: Lista de ofertas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Offer'
 *       404:
 *         description: No hay ofertas disponibles
 *       500:
 *         description: Error interno del servidor
 */
async function listOffers(req, res) {
    try {
        const offers = await Offer.findAll({
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                },
                {
                    model: Skill,
                    as: 'skills',
                    attributes: ['id', 'name'],
                    through: { attributes: [] } // Esto oculta los atributos de la tabla intermedia
                }
            ]
        });
        
        if (!offers || offers.length === 0) {
            return res.status(404).json({ mensaje: 'No hay ofertas disponibles' });
        }
        
        return res.json(offers);
    } catch (error) {
        console.error('Error obteniendo ofertas:', error);
        return res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function getOffer(req, res) {
    const { id } = req.params;
    
    console.log('👁️ getOffer called with id:', id);
    
    // Validar que el ID sea numérico
    if (isNaN(id) || !Number.isInteger(Number(id))) {
        console.log('❌ Invalid ID received:', id);
        return res.status(400).json({ mensaje: 'ID de oferta inválido' });
    }
    
    try {
        const { Skill } = await import('../models/skill.js');
        const offer = await Offer.findByPk(id, {
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                },
                {
                    model: Skill,
                    attributes: ['id', 'name']
                }
            ]
        });
        
        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada' });
        }
        
        res.json(offer);
    } catch (err) {
        logger.error('Error getOffer: ' + err);
        res.status(500).json({ message: 'Error del servidor obteniendo la oferta' });
    }
}

async function createOffer(req, res) {
    const { userId } = req.user;
    const { 
        name, location, mode, type, period, schedule, 
        min_hr, car, sector, tag, description, jobs, 
        requisites, profamilyId, profamilyIds, skills 
    } = req.body;
    
    try {
        await sequelize.transaction(async (t) => {
            // Buscar la empresa del usuario logueado usando UserCompany
            const userCompany = await UserCompany.findOne({
                where: { 
                    userId: userId,
                    isActive: true 
                },
                include: [{
                    model: Company,
                    as: 'company'
                }],
                transaction: t
            });
            
            if (!userCompany || !userCompany.company) {
                return res.status(404).json({ mensaje: 'No tienes una empresa asociada' });
            }
            
            const company = userCompany.company;
            
            // Crear la oferta con companyId directamente
            const offerData = {
                name, location, mode, type, period, schedule,
                min_hr: min_hr || 200,
                car: car || false,
                tag, description, jobs, requisites,
                companyId: company.id
            };
            
            // Agregar sector solo si viene
            if (sector !== undefined) {
                offerData.sector = sector;
            }
            
            const offer = await Offer.create(offerData, { transaction: t });

            // Asociar profamilys - manejar tanto profamilyId (singular) como profamilyIds (plural)
            let profamilyIdsToAssociate = [];
            if (profamilyIds && Array.isArray(profamilyIds) && profamilyIds.length > 0) {
                profamilyIdsToAssociate = profamilyIds;
            } else if (profamilyId) {
                // Si viene profamilyId singular, convertirlo a array
                profamilyIdsToAssociate = [profamilyId];
            }

            if (profamilyIdsToAssociate.length > 0) {
                await offer.setProfamilys(profamilyIdsToAssociate, { transaction: t });
            }

            // Asociar skills si se reciben
            if (skills && Array.isArray(skills) && skills.length > 0) {
                await offer.setSkills(skills, { transaction: t });
            }

            logger.info({ userId, companyId: company.id, offerId: offer.id }, "Offer created and associated with company");
            res.json(offer);
        });
    } catch (err) {
        logger.error('Error createOffer: ' + err);
        res.status(500).json({ message: 'Error del servidor creando la oferta' });
    }
}

async function updateOffer(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    const {
        name, location, mode, type, period, schedule,
        min_hr, car, sector, tag, description, jobs,
        requisites, profamilyId, profamilyIds, skills
    } = req.body;

    try {
        const offer = await Offer.findByPk(id);

        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada' });
        }

        const updateData = {
            name, location, mode, type, period, schedule,
            min_hr, car, tag, description, jobs,
            requisites
        };
        
        // Agregar sector solo si viene
        if (sector !== undefined) {
            updateData.sector = sector;
        }

        await offer.update(updateData);

        // Update profamilys association - manejar tanto profamilyId como profamilyIds
        let profamilyIdsToAssociate = [];
        if (profamilyIds && Array.isArray(profamilyIds)) {
            profamilyIdsToAssociate = profamilyIds;
        } else if (profamilyId) {
            // Si viene profamilyId singular, convertirlo a array
            profamilyIdsToAssociate = [profamilyId];
        }

        if (profamilyIdsToAssociate.length > 0) {
            await offer.setProfamilys(profamilyIdsToAssociate);
        }

        // Update skills association if provided
        if (skills && Array.isArray(skills)) {
            await offer.setSkills(skills);
        }

        logger.info({ userId }, "Offer updated");
        res.json({ mensaje: 'Oferta actualizada exitosamente', offer });
    } catch (error) {
        logger.error('Error updateOffer: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

async function deleteOffer(req, res) {
    const { userId } = req.user;
    const { id } = req.params;
    
    try {
        const offer = await Offer.findByPk(id);
        
        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada' });
        }
        
        await offer.destroy();
        
        logger.info({ userId }, "Offer deleted");
        res.json({ mensaje: 'Oferta eliminada exitosamente' });
    } catch (err) {
        logger.error('Error deleteOffer: ' + err);
        res.status(500).json({ message: 'Error del servidor eliminando la oferta' });
    }
}

// Endpoint adicional para obtener ofertas por empresa
async function getOffersByCompany(req, res) {
    const { companyId } = req.params;
    
    try {
        const offers = await Offer.findAll({
            where: { companyId: companyId },
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        
        res.json(offers);
    } catch (error) {
        logger.error('Error getOffersByCompany: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

// Endpoint para obtener ofertas de la empresa del usuario logueado
async function getMyCompanyOffers(req, res) {
    const { userId } = req.user;
    
    try {
        // 🔥 REEMPLAZAR EL MAPEO MANUAL CON EL SERVICE
        const company = await companyService.getCompanyByUserId(userId);
        
        const { Skill } = await import('../models/skill.js');
        const offers = await Offer.findAll({
            where: { companyId: company.id },
            include: [
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                },
                {
                    model: Skill,
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(offers);
    } catch (error) {
        console.error('❌ Error getMyCompanyOffers:', error);
        logger.error('Error getMyCompanyOffers: ' + error);
        
        // 🔥 AÑADIR MANEJO DE ERROR DEL SERVICE
        if (error.message.includes('No se encontró empresa')) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

// Endpoint adicional para obtener ofertas por familia profesional
async function getOffersByProfamily(req, res) {
    const { profamilyId } = req.params;
    
    try {
        const offers = await Offer.findAll({
            where: { profamilyId },
            include: [
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Company,
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'city', 'sector']
                }
            ]
        });
        
        res.json(offers);
    } catch (error) {
        logger.error('Error getOffersByProfamily: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

// Endpoint adicional para obtener ofertas de una empresa con sus aplicaciones
async function getCompanyOffersWithApplications(req, res) {
    const { userId } = req.user;
    
    try {
        // Buscar la empresa del usuario
        const company = await Company.findOne({
            include: [{
                model: User,
                through: { attributes: [] },
                where: { id: userId }
            }]
        });

        if (!company) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada' });
        }

        // Obtener ofertas de la empresa con aplicaciones
        const offers = await Offer.findAll({
            include: [
                {
                    model: Company,
                    through: { attributes: [] },
                    where: { id: company.id }
                },
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name', 'description'],
                    through: { attributes: [] }
                },
                {
                    model: Application,
                    include: [{
                        model: Student,
                        attributes: ['id', 'grade', 'course', 'car', 'tag'],
                        include: [{
                            model: User,
                            attributes: ['id', 'name', 'surname', 'email', 'phone']
                        }, {
                            model: Profamily,
                            attributes: ['id', 'name', 'description'],
                            as: 'profamily', // 🔥 AGREGAR ALIAS
                            required: false
                        }]
                    }]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Agregar estadísticas de aplicaciones
        const offersWithStats = offers.map(offer => {
            const applications = offer.Applications || [];
            const stats = {
                total: applications.length,
                pending: applications.filter(app => app.status === 'pending').length,
                reviewed: applications.filter(app => app.status === 'reviewed').length,
                accepted: applications.filter(app => app.status === 'accepted').length,
                rejected: applications.filter(app => app.status === 'rejected').length,
                withdrawn: applications.filter(app => app.status === 'withdrawn').length
            };

            return {
                ...offer.toJSON(),
                applicationStats: stats
            };
        });

        res.json({
            company: {
                id: company.id,
                name: company.name
            },
            offers: offersWithStats
        });
    } catch (error) {
        logger.error('Error getCompanyOffersWithApplications: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/offers/company-with-candidates:
 *   get:
 *     summary: Obtener ofertas de la empresa con candidatos y valoración de afinidad
 */
export const getCompanyOffersWithCandidates = async (req, res) => {
    try {
        const company = await companyService.getCompanyByUserId(req.user.userId);
        console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id}) para usuario ${req.user.userId}`);

        // Obtener ofertas con skills y candidatos
        const { Skill } = await import('../models/skill.js');
        const offers = await Offer.findAll({
            where: { companyId: company.id },
            include: [
                {
                    model: Skill,
                    as: 'skills',
                    attributes: ['id', 'name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`📋 Ofertas encontradas: ${offers.length}`);

        // Para cada oferta, obtener aplicaciones separadamente
        const results = [];
        for (const offer of offers) {
            // Obtener aplicaciones con raw data
            const applications = await Application.findAll({
                where: { offerId: offer.id },
                raw: true
            });

            console.log(`Oferta "${offer.name}" (ID: ${offer.id}): ${applications.length} aplicaciones`);

            const candidates = [];
            for (const app of applications) {
                const student = await Student.findByPk(app.studentId, { raw: true });
                const user = student ? await User.findByPk(student.userId, { raw: true }) : null;
                if (student && user) {
                    candidates.push({
                        id: app.id,
                        status: app.status,
                        appliedAt: app.appliedAt,
                        message: app.message,
                        cvViewed: app.cvViewed,
                        student: {
                            id: student.id,
                            grade: student.grade,
                            course: student.course,
                            car: student.car,
                            tag: student.tag,
                            User: {
                                id: user.id,
                                name: user.name,
                                surname: user.surname,
                                email: user.email,
                                phone: user.phone
                            }
                        },
                        affinity: {
                            level: 'medio',
                            score: 50,
                            matches: 0,
                            coverage: 0,
                            explanation: 'Candidato con perfil compatible para esta oferta'
                        }
                    });
                }
            }

            // Calcular estadísticas
            const candidateStats = {
                total: candidates.length,
                byAffinity: {
                    'muy alto': 0,
                    'alto': 0,
                    'medio': candidates.length,
                    'bajo': 0,
                    'sin datos': 0
                }
            };

            // Convertir skills a formato offerSkills para el frontend
            const offerSkills = {};
            if (offer.skills && offer.skills.length > 0) {
                offer.skills.forEach(skill => {
                    offerSkills[skill.name.toLowerCase()] = 2; // Nivel por defecto
                });
            }

            results.push({
                id: offer.id,
                name: offer.name,
                location: offer.location,
                mode: offer.mode,
                type: offer.type,
                description: offer.description,
                // ELIMINADO: tag hardcodeado reemplazado por skills profesionales
                createdAt: offer.createdAt,
                candidates: candidates,
                candidateStats: candidateStats,
                offerSkills: offerSkills,
                skills: offer.skills ? offer.skills.map(s => ({ id: s.id, name: s.name })) : []
            });
        }

        console.log(`✅ Ofertas procesadas: ${results.length}`);
        res.json(results);

    } catch (error) {
        console.error('❌ Error getCompanyOffersWithCandidates:', error);
        
        // 🔥 VERIFICAR QUE NO SE HA ENVIADO RESPUESTA YA
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
};

// Agregar esta función al final del archivo, antes del export

// ELIMINADO: función con datos hardcodeados reemplazada por sistema profesional de skills
// Las habilidades ahora vienen de la relación Offer -> OfferSkill -> Skill
// function extractOfferSkills(offer) {
//     // Función auxiliar para extraer habilidades de la oferta - YA NO SE USA
// }

// Agregar este endpoint que probablemente falta

export const getApplicationsByOffer = async (req, res) => {
    try {
        const { offerId } = req.params;
        const company = await companyService.getCompanyByUserId(req.user.userId);
        
        console.log(`🔍 Buscando aplicaciones para oferta ${offerId} de empresa ${company.id}`);

        // Verificar que la oferta pertenece a la empresa
        const offer = await Offer.findOne({
            where: { 
                id: offerId,
                companyId: company.id 
            },
            raw: true
        });

        if (!offer) {
            return res.status(404).json({
                success: false,
                error: 'Oferta no encontrada o no pertenece a tu empresa'
            });
        }

        // Obtener aplicaciones con raw data
        const applications = await Application.findAll({
            where: { offerId: offerId },
            raw: true
        });

        console.log(`📋 Aplicaciones encontradas: ${applications.length}`);

        const candidates = [];
        
        for (const app of applications) {
            const student = await Student.findByPk(app.studentId, { raw: true });
            const user = student ? await User.findByPk(student.userId, { raw: true }) : null;
            
            if (student && user) {
                candidates.push({
                    id: app.id,
                    status: app.status,
                    appliedAt: app.appliedAt,
                    message: app.message,
                    cvViewed: app.cvViewed,
                    cvViewedAt: app.cvViewedAt,
                    student: {
                        id: student.id,
                        grade: student.grade,
                        course: student.course,
                        car: student.car,
                        tag: student.tag,
                        description: student.description,
                        User: {
                            id: user.id,
                            name: user.name,
                            surname: user.surname,
                            email: user.email,
                            phone: user.phone
                        }
                    },
                    affinity: {
                        level: 'medio',
                        score: 50,
                        matches: 0,
                        coverage: 0,
                        explanation: 'Calculado automáticamente'
                    }
                });
            }
        }

        res.json({
            success: true,
            data: candidates
        });

    } catch (error) {
        console.error('❌ Error getApplicationsByOffer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * @swagger
 * /api/offers/with-aptitude:
 *   get:
 *     summary: Obtener todas las ofertas con cálculo de aptitud para el estudiante actual
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de ofertas con aptitud calculada
 */
async function getOffersWithAptitude(req, res) {
    try {
        const { userId } = req.user;

        console.log(`🎯 Obteniendo ofertas con aptitud para usuario: ${userId}`);
        console.log('🔍 req.user completo:', req.user);

        // 1. Buscar el estudiante y sus skills
        console.log('👤 Buscando estudiante...');
        const student = await Student.findOne({
            where: { userId },
            include: [{
                model: Skill,
                as: 'skills',
                through: {
                    attributes: ['proficiencyLevel', 'yearsOfExperience']
                }
            }]
        });

        console.log('👤 Estudiante encontrado:', student ? { id: student.id, userId: student.userId } : 'NO ENCONTRADO');

        if (!student) {
            console.log('❌ Estudiante no encontrado para userId:', userId);
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        // 2. Convertir skills del estudiante al formato esperado por el calculador
        console.log('🔄 Convirtiendo skills del estudiante...');
        const studentSkills = {};
        if (student.skills && student.skills.length > 0) {
            student.skills.forEach(skill => {
                // Convertir proficiencyLevel a número para el calculador
                const levelMap = {
                    'beginner': 1,
                    'intermediate': 2,
                    'advanced': 3,
                    'expert': 4
                };
                // Acceder correctamente a los atributos de la tabla intermedia
                const proficiencyLevel = skill.StudentSkill?.proficiencyLevel || skill.student_skills?.proficiencyLevel || 'beginner';
                studentSkills[skill.name.toLowerCase()] = levelMap[proficiencyLevel] || 1;
            });
        }

        console.log(`👤 Estudiante ${student.id} - Skills:`, studentSkills);

        // 3. Obtener todas las ofertas con sus skills
        console.log('📋 Obteniendo ofertas de la base de datos...');
        const offers = await Offer.findAll({
            include: [
                {
                    model: Company,
                    attributes: ['id', 'name', 'sector', 'city']
                },
                {
                    model: Profamily,
                    as: 'profamilys',
                    attributes: ['id', 'name'],
                    through: { attributes: [] }
                },
                {
                    model: Skill,
                    as: 'skills',
                    through: {
                        attributes: [] // OfferSkill table doesn't have level/required columns
                    }
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`📋 Encontradas ${offers.length} ofertas`);
        console.log('🔍 Primera oferta (skills):', offers[0]?.skills);

        // 4. Calcular aptitud para cada oferta
        console.log('🧮 Calculando aptitud para cada oferta...');
        const offersWithAptitude = [];

        for (const offer of offers) {
            try {
                console.log(`🔄 Procesando oferta: ${offer.name} (ID: ${offer.id})`);

                // Convertir skills de la oferta al formato esperado
                const offerSkills = {};
                if (offer.skills && offer.skills.length > 0) {
                    offer.skills.forEach(skill => {
                        // Since OfferSkill doesn't have level, use default level 2 (intermediate)
                        offerSkills[skill.name.toLowerCase()] = 2;
                    });
                }

                console.log(`🎯 Skills de oferta ${offer.name}:`, offerSkills);

                // Calcular aptitud/afinidad
                let aptitude;
                if (Object.keys(offerSkills).length > 0 && Object.keys(studentSkills).length > 0) {
                    aptitude = affinityCalculator.calculateAffinity(offerSkills, studentSkills);
                    console.log(`✅ Aptitud calculada para ${offer.name}:`, aptitude);
                } else {
                    aptitude = {
                        level: 'sin datos',
                        score: 0,
                        matches: 0,
                        coverage: 0,
                        explanation: Object.keys(offerSkills).length === 0
                            ? 'Esta oferta no tiene skills específicos definidos'
                            : 'Necesitas agregar skills a tu perfil para ver tu compatibilidad'
                    };
                    console.log(`⚠️ Aptitud por defecto para ${offer.name}:`, aptitude);
                }

                // Formatear para el frontend
                const formattedOffer = {
                    id: offer.id,
                    name: offer.name,
                    location: offer.location,
                    mode: offer.mode,
                    type: offer.type,
                    period: offer.period,
                    schedule: offer.schedule,
                    min_hr: offer.min_hr,
                    car: offer.car,
                    sector: offer.sector,
                    tag: offer.tag,
                    description: offer.description,
                    jobs: offer.jobs,
                    requisites: offer.requisites,
                    createdAt: offer.createdAt,
                    updatedAt: offer.updatedAt,
                    profamilyId: offer.profamilyId,
                    company: offer.company,
                    profamily: offer.profamilys && offer.profamilys.length > 0 ? offer.profamilys[0] : null,
                    skills: offer.skills.map(skill => ({
                        id: skill.id,
                        name: skill.name,
                        level: 2, // Default level since OfferSkill doesn't have level column
                        required: false // Default since OfferSkill doesn't have required column
                    })),
                    // 🔥 USAR SOLO EL SCORE COMO APTITUDE SIMPLE
                    aptitude: Math.round(aptitude.score || 0),
                    // 🔥 AGREGAR DETALLES DE APTITUD COMO PROPIEDADES SEPARADAS
                    aptitudeDetails: {
                        level: aptitude.level,
                        score: Math.round(aptitude.score * 10) / 10,
                        matches: aptitude.matches,
                        coverage: Math.round(aptitude.coverage || 0),
                        explanation: aptitude.explanation,
                        matchingSkills: aptitude.matchingSkills || []
                    }
                };

                offersWithAptitude.push(formattedOffer);
                console.log(`🎯 Oferta "${offer.name}" - Aptitud: ${aptitude.level} (${Math.round(aptitude.score || 0)}%)`);
            } catch (offerError) {
                console.error(`❌ Error procesando oferta ${offer.id} (${offer.name}):`, offerError);
                // Si hay error en una oferta específica, continuar con las demás
                continue;
            }
        }

        // 5. Ordenar por aptitud (mejores primero)
        offersWithAptitude.sort((a, b) => {
            // Ordenar por score de aptitud (mayor a menor)
            if (a.aptitude !== b.aptitude) {
                return b.aptitude - a.aptitude;
            }
            // Si tienen el mismo score, ordenar por fecha de creación (más reciente primero)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        console.log(`✅ Retornando ${offersWithAptitude.length} ofertas con aptitud calculada`);
        res.json(offersWithAptitude);

    } catch (error) {
        console.error('❌ Error getOffersWithAptitude:', error);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error message:', error.message);
        res.status(500).json({
            mensaje: 'Error interno del servidor',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

export default {
    listOffers,
    getOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    getOffersByCompany,
    getMyCompanyOffers,
    getOffersByProfamily,
    getCompanyOffersWithApplications,
    getCompanyOffersWithCandidates,
    getApplicationsByOffer,
    getOffersWithAptitude
}
