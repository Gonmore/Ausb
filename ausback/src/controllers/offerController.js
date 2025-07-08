import { Offer } from '../models/offer.js';
import { Company } from '../models/company.js';
import { Profamily } from '../models/profamily.js';
import { Student } from '../models/student.js';
import { Application } from '../models/application.js';
import { User } from '../models/users.js';
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
                },
                {
                    model: Student,
                    through: { attributes: [] },
                    attributes: ['id', 'name', 'surname']
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
        const company = await Company.findByPk(companyId, {
            include: {
                model: Offer,
                through: { attributes: [] },
                include: [{
                    model: Profamily,
                    attributes: ['id', 'name', 'description']
                }]
            }
        });
        
        if (!company) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada' });
        }
        
        res.json(company.Offers);
    } catch (error) {
        logger.error('Error getOffersByCompany: ' + error);
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

export default {
    listOffers,
    getOffer,
    createOffer,
    updateOffer,
    deleteOffer,
    getOffersByCompany,
    getOffersByProfamily,
    getCompanyOffersWithApplications
}
