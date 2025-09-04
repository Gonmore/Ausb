import { Offer, Company, Application, Student, User, Profamily } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';
import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'

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
 *         - schedule
 *         - sector
 *         - tag
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
 *           description: Sector empresarial
 *         tag:
 *           type: string
 *           description: Etiquetas descriptivas
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
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
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
        const offer = await Offer.findByPk(id, {
            include: [
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                },
                {
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
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
        requisites, profamilyId 
    } = req.body;
    
    try {
        await sequelize.transaction(async (t) => {
            // Buscar la empresa del usuario logueado
            const company = await Company.findOne({
                where: { userId: userId },
                transaction: t
            });
            
            if (!company) {
                return res.status(404).json({ mensaje: 'No tienes una empresa asociada' });
            }
            
            // Crear la oferta con companyId directamente
            const offer = await Offer.create({
                name, location, mode, type, period, schedule,
                min_hr: min_hr || 200,
                car: car || false,
                sector, tag, description, jobs, requisites,
                profamilyId,
                companyId: company.id
            }, { transaction: t });
            
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
        requisites, profamilyId 
    } = req.body;
    
    try {
        const offer = await Offer.findByPk(id);
        
        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada' });
        }
        
        await offer.update({
            name, location, mode, type, period, schedule,
            min_hr, car, sector, tag, description, jobs, 
            requisites, profamilyId
        });
        
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
                    attributes: ['id', 'name', 'description']
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
        // Usar el mapeo manual usuario → empresa
        const userCompanyMapping = {
            2: 1, // María (userId: 2) → Tech Corp (companyId: 1)
            3: 2, // Carlos (userId: 3) → Innovate SL (companyId: 2)
            4: 3  // Ana (userId: 4) → Future Labs (companyId: 3)
        };

        const companyId = userCompanyMapping[userId];
        
        if (!companyId) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }
        
        const offers = await Offer.findAll({
            where: { companyId: companyId },
            include: [
                {
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
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
        console.error('❌ Error getMyCompanyOffers:', error);
        logger.error('Error getMyCompanyOffers: ' + error);
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
                    attributes: ['id', 'name', 'description']
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
async function getCompanyOffersWithCandidates(req, res) {
    const { userId } = req.user;

    try {
        // 🔥 OBTENER EMPRESA DEL USUARIO DESDE LA BASE DE DATOS
        const company = await Company.findOne({
            where: { userId: userId }
        });

        if (!company) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }

        console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id}) para usuario ${userId}`);

        // Obtener ofertas de la empresa con aplicaciones
        const offers = await Offer.findAll({
            where: { companyId: company.id },
            include: [
                {
                    model: Application,
                    required: false, // LEFT JOIN para incluir ofertas sin aplicaciones
                    include: [
                        {
                            model: Student,
                            include: [
                                {
                                    model: User,
                                    attributes: ['id', 'name', 'surname', 'email', 'phone']
                                },
                                {
                                    model: Profamily,
                                    attributes: ['id', 'name'],
                                    as: 'profamily',
                                    required: false
                                }
                            ]
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        console.log(`📋 Ofertas encontradas: ${offers.length}`);

        const affinityCalculator = new AffinityCalculator();
        
        // Procesar cada oferta
        const processedOffers = offers.map(offer => {
            // Convertir tags de la oferta a skills valorados
            const offerSkills = {};
            if (offer.tag) {
                const tags = offer.tag.split(',').map(tag => tag.trim());
                tags.forEach(tag => {
                    // Asignar valores basados en los requisitos (por ejemplo, todos críticos = 3)
                    offerSkills[tag] = 3; // Puedes hacer esto más sofisticado
                });
            }

            // 🔥 VERIFICAR QUE Applications EXISTE Y ES UN ARRAY
            const applications = offer.Applications || [];
            console.log(`Oferta "${offer.name}" (ID: ${offer.id}): ${applications.length} aplicaciones`);

            // Procesar candidatos con valoración
            const candidatesWithAffinity = applications.map(application => {
                const student = application.Student;
                
                // Convertir tags del estudiante a skills
                const studentSkills = {};
                if (student.tag) {
                    const tags = student.tag.split(',').map(tag => tag.trim());
                    tags.forEach(tag => {
                        studentSkills[tag] = Math.floor(Math.random() * 3) + 1; // Temporal
                    });
                }

                // Calcular afinidad solo si hay skills en la oferta
                let affinity = null;
                if (Object.keys(offerSkills).length > 0) {
                    affinity = affinityCalculator.calculateAffinity(offerSkills, studentSkills);
                }

                return {
                    id: application.id,
                    status: application.status,
                    appliedAt: application.appliedAt,
                    message: application.message,
                    student: {
                        id: student.id,
                        grade: student.grade,
                        course: student.course,
                        car: student.car,
                        tag: student.tag,
                        description: student.description,
                        User: student.User,
                        profamily: student.profamily
                    },
                    // Valoración de afinidad
                    affinity: affinity ? {
                        level: affinity.level,
                        score: affinity.score,
                        matches: affinity.matches,
                        coverage: affinity.coverage,
                        explanation: `${affinity.matches} coincidencias, ${affinity.coverage}% cobertura`
                    } : {
                        level: 'sin datos',
                        score: 0,
                        matches: 0,
                        coverage: 0,
                        explanation: 'No hay suficiente información para calcular afinidad'
                    }
                };
            });

            // Ordenar candidatos por afinidad
            candidatesWithAffinity.sort((a, b) => {
                const levelOrder = { "muy alto": 4, "alto": 3, "medio": 2, "bajo": 1, "sin datos": 0 };
                if (levelOrder[a.affinity.level] !== levelOrder[b.affinity.level]) {
                    return levelOrder[b.affinity.level] - levelOrder[a.affinity.level];
                }
                return b.affinity.score - a.affinity.score;
            });

            return {
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
                // Candidatos con valoración
                candidates: candidatesWithAffinity,
                candidateStats: {
                    total: candidatesWithAffinity.length,
                    byAffinity: {
                        'muy alto': candidatesWithAffinity.filter(c => c.affinity.level === 'muy alto').length,
                        'alto': candidatesWithAffinity.filter(c => c.affinity.level === 'alto').length,
                        'medio': candidatesWithAffinity.filter(c => c.affinity.level === 'medio').length,
                        'bajo': candidatesWithAffinity.filter(c => c.affinity.level === 'bajo').length,
                        'sin datos': candidatesWithAffinity.filter(c => c.affinity.level === 'sin datos').length
                    }
                },
                // Skills de la oferta para búsqueda inteligente
                offerSkills
            };
        });

        console.log(`✅ Ofertas procesadas: ${processedOffers.length}`);
        res.json(processedOffers);

    } catch (error) {
        console.error('❌ Error getCompanyOffersWithCandidates:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
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
    getCompanyOffersWithCandidates
}
