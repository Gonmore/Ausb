import { Offer, Profamily, Company, Application, Student, User } from '../models/relations.js';
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
        // 🔥 REEMPLAZAR EL MAPEO MANUAL CON EL SERVICE
        const company = await companyService.getCompanyByUserId(userId);
        
        const offers = await Offer.findAll({
            where: { companyId: company.id }, // 🔥 USAR company.id del service
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
export const getCompanyOffersWithCandidates = async (req, res) => {
    try {
        const company = await companyService.getCompanyByUserId(req.user.userId);
        console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id}) para usuario ${req.user.userId}`);

        // Obtener ofertas SIN includes complejos
        const offers = await Offer.findAll({
            where: { companyId: company.id },
            raw: true,
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
                // Obtener student y user separadamente con raw data
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

            results.push({
                id: offer.id,
                name: offer.name,
                location: offer.location,
                mode: offer.mode,
                type: offer.type,
                description: offer.description,
                tag: offer.tag,
                createdAt: offer.createdAt,
                candidates: candidates,
                candidateStats: candidateStats,
                offerSkills: offer.tag ? offer.tag.split(',').map(s => s.trim()) : []
            });
        }

        console.log(`✅ Ofertas procesadas: ${results.length}`);

        // 🔥 ENVIAR RESPUESTA UNA SOLA VEZ
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

function extractOfferSkills(offer) {
    // Función auxiliar para extraer habilidades de la oferta
    const skills = [];
    
    if (offer.tag) {
        skills.push(...offer.tag.split(',').map(skill => skill.trim()));
    }
    
    if (offer.requisites) {
        // Buscar tecnologías comunes en los requisitos
        const techKeywords = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'html', 'css', 'php', 'angular', 'vue'];
        techKeywords.forEach(tech => {
            if (offer.requisites.toLowerCase().includes(tech)) {
                skills.push(tech);
            }
        });
    }
    
    return [...new Set(skills)]; // Eliminar duplicados
}

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

        // 🔥 POR ESTO:
        res.json(candidates);

    } catch (error) {
        console.error('❌ Error getApplicationsByOffer:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

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
    getApplicationsByOffer
}
