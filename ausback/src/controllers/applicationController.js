import { Application } from '../models/application.js';
import { Offer } from '../models/offer.js';
import { Student } from '../models/student.js';
import { Company } from '../models/company.js';
import { Profamily } from '../models/profamily.js';
import { Cv } from '../models/cv.js';
import { CompanyToken, TokenUsage } from '../models/companyToken.js';
import { User } from '../models/users.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     Application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la aplicación
 *         offerId:
 *           type: integer
 *           description: ID de la oferta
 *         studentId:
 *           type: integer
 *           description: ID del estudiante
 *         companyId:
 *           type: integer
 *           description: ID de la empresa
 *         status:
 *           type: string
 *           enum: [pending, reviewed, accepted, rejected, withdrawn]
 *           description: Estado de la aplicación
 *         appliedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de aplicación
 *         reviewedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de revisión
 *         message:
 *           type: string
 *           description: Mensaje del estudiante
 *         companyNotes:
 *           type: string
 *           description: Notas de la empresa
 *         rejectionReason:
 *           type: string
 *           description: Razón del rechazo
 */

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: Aplicar a una oferta
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - offerId
 *             properties:
 *               offerId:
 *                 type: integer
 *                 description: ID de la oferta a la que aplicar
 *               message:
 *                 type: string
 *                 description: Mensaje opcional del estudiante
 *     responses:
 *       201:
 *         description: Aplicación creada exitosamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: Ya has aplicado a esta oferta
 *       500:
 *         description: Error interno del servidor
 */
async function applyToOffer(req, res) {
    const { userId } = req.user;
    const { offerId, message } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // Buscar el estudiante
            const student = await Student.findOne({
                where: { userId },
                transaction: t
            });

            if (!student) {
                return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
            }

            // Buscar la oferta y la empresa asociada
            const offer = await Offer.findByPk(offerId, {
                include: [{
                    model: Company,
                    attributes: ['id', 'name', 'city', 'sector']
                }],
                transaction: t
            });

            if (!offer) {
                return res.status(404).json({ mensaje: 'Oferta no encontrada' });
            }

            console.log('Offer found:', offer.id, offer.name);
            console.log('Company associated:', offer.company ? offer.company.id : 'null/undefined');

            if (!offer.company) {
                return res.status(400).json({ mensaje: 'La oferta no tiene empresa asociada' });
            }

            const company = offer.company;

            // Verificar si ya aplicó a esta oferta
            const existingApplication = await Application.findOne({
                where: {
                    offerId,
                    studentId: student.id
                },
                transaction: t
            });

            if (existingApplication) {
                return res.status(409).json({ mensaje: 'Ya has aplicado a esta oferta' });
            }

            // Crear la aplicación
            const application = await Application.create({
                offerId,
                studentId: student.id,
                companyId: company.id,
                message: message || null,
                status: 'pending'
            }, { transaction: t });

            logger.info({ userId, applicationId: application.id }, "Application created");
            res.status(201).json({
                mensaje: 'Aplicación enviada exitosamente',
                application: {
                    id: application.id,
                    status: application.status,
                    appliedAt: application.appliedAt,
                    offer: {
                        id: offer.id,
                        name: offer.name,
                        location: offer.location,
                        type: offer.type
                    }
                }
            });
        });
    } catch (error) {
        logger.error('Error applyToOffer: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/user/{userId}:
 *   get:
 *     summary: Obtener aplicaciones de un usuario
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Lista de aplicaciones del usuario
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function getUserApplications(req, res) {
    const { userId } = req.user;

    try {
        // Buscar el estudiante
        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
        }

        // Obtener las aplicaciones del estudiante
        const applications = await Application.findAll({
            where: { studentId: student.id },
            include: [
                {
                    model: Offer,
                    attributes: ['id', 'name', 'location', 'type', 'mode', 'description', 'sector'],
                    include: [{
                        model: Company,
                        attributes: ['id', 'name', 'city', 'sector']
                    }]
                }
            ],
            order: [['appliedAt', 'DESC']]
        });

        res.json(applications);
    } catch (error) {
        logger.error('Error getUserApplications: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/offer/{offerId}:
 *   get:
 *     summary: Obtener aplicaciones de una oferta (para empresas)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: offerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la oferta
 *     responses:
 *       200:
 *         description: Lista de aplicaciones de la oferta
 *       403:
 *         description: No tienes permisos para ver estas aplicaciones
 *       404:
 *         description: Oferta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getOfferApplications(req, res) {
    const { userId } = req.user;
    const { offerId } = req.params;

    try {
        // Verificar que la oferta pertenece al usuario empresa usando el mapeo manual
        const userCompanyMapping = {
            2: 1, // María (userId: 2) → Tech Corp (companyId: 1)
            3: 2, // Carlos (userId: 3) → Innovate SL (companyId: 2)
            4: 3  // Ana (userId: 4) → Future Labs (companyId: 3)
        };

        const companyId = userCompanyMapping[userId];
        if (!companyId) {
            return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
        }

        // Verificar que la oferta pertenece a la empresa del usuario
        const offer = await Offer.findOne({
            where: { 
                id: offerId,
                companyId: companyId
            }
        });

        if (!offer) {
            return res.status(404).json({ mensaje: 'Oferta no encontrada o no tienes permisos para verla' });
        }

        // Obtener las aplicaciones de la oferta con el formato correcto
        console.log('🔍 Searching applications for offerId:', offerId);
        
        const applications = await Application.findAll({
            where: { offerId },
            attributes: ['id', 'status', 'appliedAt', 'message', 'companyNotes', 'rejectionReason'],
            include: [
                {
                    model: Student,
                    attributes: ['id', 'grade', 'course', 'car', 'tag'],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name', 'surname', 'email', 'phone']
                        },
                        {
                            model: Profamily,
                            attributes: ['id', 'name', 'description'],
                            required: false
                        }
                    ]
                },
                {
                    model: Offer,
                    attributes: ['id', 'name', 'location', 'type', 'mode', 'description', 'sector']
                }
            ],
            order: [['appliedAt', 'DESC']]
        });

        console.log('🔍 Found applications:', applications.length);
        
        if (applications.length > 0) {
            console.log('🔍 First application raw data:', JSON.stringify(applications[0].toJSON(), null, 2));
        }

        // Formatear la respuesta para que sea consistente con el frontend
        const formattedApplications = applications.map(app => {
            const appData = app.toJSON();
            console.log('🔍 Raw application data:', {
                id: app.id,
                student: appData.student ? 'exists' : 'missing',
                studentUser: appData.student?.user ? 'exists' : 'missing'
            });
            
            return {
                id: appData.id,
                status: appData.status,
                appliedAt: appData.appliedAt,
                message: appData.message,
                companyNotes: appData.companyNotes,
                rejectionReason: appData.rejectionReason,
                offer: appData.offer,
                Student: {
                    id: appData.student?.id,
                    grade: appData.student?.grade,
                    course: appData.student?.course,
                    car: appData.student?.car,
                    tag: appData.student?.tag,
                    User: {
                        id: appData.student?.user?.id,
                        name: appData.student?.user?.name,
                        surname: appData.student?.user?.surname,
                        email: appData.student?.user?.email,
                        phone: appData.student?.user?.phone
                    },
                    Profamily: appData.student?.profamily ? {
                        id: appData.student.profamily.id,
                        name: appData.student.profamily.name,
                        description: appData.student.profamily.description
                    } : null
                }
            };
        });

        console.log('🎯 Formatted applications count:', formattedApplications.length);
        res.json(formattedApplications);
    } catch (error) {
        logger.error('Error getOfferApplications: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/company:
 *   get:
 *     summary: Obtener todas las aplicaciones de las ofertas de una empresa
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de aplicaciones de la empresa
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getCompanyApplications(req, res) {
    const { userId } = req.user;

    try {
        // Mapeo temporal de usuarios a empresas
        let companyId = null;
        if (userId === 2) { // company1@example.com
            companyId = 1; // TechSolutions España
        } else if (userId === 3) { // company2@example.com  
            companyId = 2; // InnovateLab
        }

        if (!companyId) {
            return res.status(404).json({ mensaje: 'Empresa no encontrada para este usuario' });
        }

        console.log(`🔍 Buscando aplicaciones para empresa ${companyId} (usuario ${userId})`);

        // Obtener todas las aplicaciones a ofertas de esta empresa
        const applications = await Application.findAll({
            where: { companyId: companyId },
            include: [
                {
                    model: Offer,
                    attributes: ['id', 'name', 'location', 'type', 'mode', 'description', 'sector']
                },
                {
                    model: Student,
                    attributes: ['id', 'grade', 'course', 'car', 'tag'],
                    include: [
                        {
                            model: User,
                            attributes: ['id', 'name', 'surname', 'email', 'phone']
                        },
                        {
                            model: Profamily,
                            attributes: ['id', 'name', 'description']
                        }
                    ]
                }
            ],
            order: [['appliedAt', 'DESC']]
        });

        console.log(`✅ Encontradas ${applications.length} aplicaciones para la empresa`);

        // Formatear los datos para que coincidan con el formato esperado por el frontend
        const formattedApplications = applications.map(app => ({
            id: app.id,
            status: app.status,
            appliedAt: app.appliedAt,
            message: app.message,
            companyNotes: app.companyNotes,
            rejectionReason: app.rejectionReason,
            offer: {
                id: app.offer.id,
                name: app.offer.name,
                location: app.offer.location,
                type: app.offer.type,
                mode: app.offer.mode,
                description: app.offer.description,
                sector: app.offer.sector
            },
            Student: {
                id: app.student.id,
                grade: app.student.grade,
                course: app.student.course,
                car: app.student.car,
                tag: app.student.tag,
                User: {
                    id: app.student.user.id,
                    name: app.student.user.name,
                    surname: app.student.user.surname,
                    email: app.student.user.email,
                    phone: app.student.user.phone
                },
                Profamily: app.student.profamily ? {
                    id: app.student.profamily.id,
                    name: app.student.profamily.name,
                    description: app.student.profamily.description
                } : null
            }
        }));

        res.json(formattedApplications);
    } catch (error) {
        logger.error('Error getCompanyApplications: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/{applicationId}/status:
 *   put:
 *     summary: Actualizar estado de una aplicación
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la aplicación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, reviewed, accepted, rejected, withdrawn]
 *                 description: Nuevo estado de la aplicación
 *               companyNotes:
 *                 type: string
 *                 description: Notas de la empresa
 *               rejectionReason:
 *                 type: string
 *                 description: Razón del rechazo (si aplica)
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       403:
 *         description: No tienes permisos para actualizar esta aplicación
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function updateApplicationStatus(req, res) {
    const { userId } = req.user;
    const { applicationId } = req.params;
    const { status, companyNotes, rejectionReason } = req.body;

    try {
        // Buscar la aplicación y verificar permisos
        const application = await Application.findByPk(applicationId, {
            include: [
                {
                    model: Company,
                    include: [{
                        model: User,
                        where: { id: userId }
                    }]
                }
            ]
        });

        if (!application) {
            return res.status(404).json({ mensaje: 'Aplicación no encontrada' });
        }

        if (!application.company || !application.company.user) {
            return res.status(403).json({ mensaje: 'No tienes permisos para actualizar esta aplicación' });
        }

        // Actualizar la aplicación
        await application.update({
            status,
            companyNotes: companyNotes || application.companyNotes,
            rejectionReason: rejectionReason || application.rejectionReason,
            reviewedAt: new Date()
        });

        logger.info({ userId, applicationId }, `Application status updated to ${status}`);
        res.json({
            mensaje: 'Estado de aplicación actualizado exitosamente',
            application: {
                id: application.id,
                status: application.status,
                reviewedAt: application.reviewedAt
            }
        });
    } catch (error) {
        logger.error('Error updateApplicationStatus: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/applications/{applicationId}:
 *   delete:
 *     summary: Retirar aplicación (solo estudiante)
 *     tags: [Applications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la aplicación
 *     responses:
 *       200:
 *         description: Aplicación retirada exitosamente
 *       403:
 *         description: No tienes permisos para retirar esta aplicación
 *       404:
 *         description: Aplicación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function withdrawApplication(req, res) {
    const { userId } = req.user;
    const { applicationId } = req.params;

    try {
        // Buscar la aplicación y verificar que pertenece al estudiante
        const application = await Application.findByPk(applicationId, {
            include: [{
                model: Student,
                include: [{
                    model: User,
                    where: { id: userId }
                }]
            }]
        });

        if (!application) {
            return res.status(404).json({ mensaje: 'Aplicación no encontrada' });
        }

        if (!application.Student || !application.Student.User) {
            return res.status(403).json({ mensaje: 'No tienes permisos para retirar esta aplicación' });
        }

        // Marcar como retirada en lugar de eliminar
        await application.update({
            status: 'withdrawn',
            reviewedAt: new Date()
        });

        logger.info({ userId, applicationId }, "Application withdrawn");
        res.json({ mensaje: 'Aplicación retirada exitosamente' });
    } catch (error) {
        logger.error('Error withdrawApplication: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

export default {
    applyToOffer,
    getUserApplications,
    getOfferApplications,
    getCompanyApplications,
    updateApplicationStatus,
    withdrawApplication
};
