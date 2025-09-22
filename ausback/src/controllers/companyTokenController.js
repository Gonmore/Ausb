import { CompanyToken, TokenUsage } from '../models/companyToken.js';
import { Company } from '../models/company.js';
import { Student } from '../models/student.js';
import { User } from '../models/users.js';
import { Cv } from '../models/cv.js';
import { Profamily } from '../models/profamily.js';
import { Scenter } from '../models/scenter.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

/**
 * @swagger
 * components:
 *   schemas:
 *     CompanyToken:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del registro de tokens
 *         companyId:
 *           type: integer
 *           description: ID de la empresa
 *         tokenBalance:
 *           type: integer
 *           description: Tokens disponibles
 *         tokensUsed:
 *           type: integer
 *           description: Tokens utilizados
 *         lastRecharge:
 *           type: string
 *           format: date-time
 *           description: Última recarga de tokens
 *         rechargeAmount:
 *           type: integer
 *           description: Cantidad de la última recarga
 */

// Costos de tokens por acción
const TOKEN_COSTS = {
    STUDENT_SEARCH: 1,
    STUDENT_CONTACT: 2,
    CV_ACCESS: 3
};

/**
 * @swagger
 * /api/tokens/balance:
 *   get:
 *     summary: Obtener balance de tokens de la empresa
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Balance de tokens obtenido exitosamente
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getTokenBalance(req, res) {
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

        // Buscar o crear el registro de tokens
        let companyToken = await CompanyToken.findOne({
            where: { companyId: company.id }
        });

        if (!companyToken) {
            companyToken = await CompanyToken.create({
                companyId: company.id,
                tokenBalance: 10, // Tokens gratis iniciales
                tokensUsed: 0
            });
        }

        res.json({
            companyId: company.id,
            companyName: company.name,
            tokenBalance: companyToken.tokenBalance,
            tokensUsed: companyToken.tokensUsed,
            lastRecharge: companyToken.lastRecharge,
            tokenCosts: TOKEN_COSTS
        });
    } catch (error) {
        logger.error('Error getTokenBalance: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/tokens/recharge:
 *   post:
 *     summary: Recargar tokens de la empresa
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: integer
 *                 description: Cantidad de tokens a recargar
 *     responses:
 *       200:
 *         description: Tokens recargados exitosamente
 *       400:
 *         description: Cantidad inválida
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function rechargeTokens(req, res) {
    const { userId } = req.user;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ mensaje: 'Cantidad de tokens inválida' });
    }

    try {
        await sequelize.transaction(async (t) => {
            // Buscar la empresa del usuario
            const company = await Company.findOne({
                include: [{
                    model: User,
                    through: { attributes: [] },
                    where: { id: userId }
                }],
                transaction: t
            });

            if (!company) {
                return res.status(404).json({ mensaje: 'Empresa no encontrada' });
            }

            // Buscar o crear el registro de tokens
            let companyToken = await CompanyToken.findOne({
                where: { companyId: company.id },
                transaction: t
            });

            if (!companyToken) {
                companyToken = await CompanyToken.create({
                    companyId: company.id,
                    tokenBalance: 0,
                    tokensUsed: 0
                }, { transaction: t });
            }

            // Actualizar el balance
            await companyToken.update({
                tokenBalance: companyToken.tokenBalance + amount,
                lastRecharge: new Date(),
                rechargeAmount: amount
            }, { transaction: t });

            logger.info({ userId, companyId: company.id, amount }, "Tokens recharged");
            res.json({
                mensaje: 'Tokens recargados exitosamente',
                newBalance: companyToken.tokenBalance + amount,
                rechargedAmount: amount
            });
        });
    } catch (error) {
        logger.error('Error rechargeTokens: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/tokens/search-students:
 *   post:
 *     summary: Buscar estudiantes usando tokens
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profamilyId:
 *                 type: integer
 *                 description: ID de la familia profesional
 *               grade:
 *                 type: string
 *                 description: Grado del estudiante
 *               course:
 *                 type: string
 *                 description: Curso del estudiante
 *               car:
 *                 type: boolean
 *                 description: Tiene vehículo propio
 *               tag:
 *                 type: string
 *                 description: Etiquetas del estudiante
 *               limit:
 *                 type: integer
 *                 description: Límite de resultados
 *                 default: 10
 *     responses:
 *       200:
 *         description: Búsqueda realizada exitosamente
 *       400:
 *         description: Tokens insuficientes
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function searchStudents(req, res) {
    const { userId } = req.user;
    const { profamilyId, grade, course, car, tag, limit = 10 } = req.body;

    try {
        await sequelize.transaction(async (t) => {
            // Buscar la empresa del usuario
            const company = await Company.findOne({
                include: [{
                    model: User,
                    through: { attributes: [] },
                    where: { id: userId }
                }],
                transaction: t
            });

            if (!company) {
                return res.status(404).json({ mensaje: 'Empresa no encontrada' });
            }

            // Verificar balance de tokens
            let companyToken = await CompanyToken.findOne({
                where: { companyId: company.id },
                transaction: t
            });

            if (!companyToken) {
                companyToken = await CompanyToken.create({
                    companyId: company.id,
                    tokenBalance: 10,
                    tokensUsed: 0
                }, { transaction: t });
            }

            const costPerStudent = TOKEN_COSTS.STUDENT_SEARCH;
            const totalCost = Math.min(limit, 20) * costPerStudent; // Máximo 20 resultados

            if (companyToken.tokenBalance < totalCost) {
                return res.status(400).json({ 
                    mensaje: 'Tokens insuficientes',
                    required: totalCost,
                    available: companyToken.tokenBalance
                });
            }

            // Construir filtros de búsqueda
            const whereClause = {};
            if (profamilyId) whereClause.profamilyId = profamilyId;
            if (grade) whereClause.grade = grade;
            if (course) whereClause.course = course;
            if (car !== undefined) whereClause.car = car;
            // ELIMINADO: búsqueda por tag hardcodeado - usar Skills profesionales
            // if (tag) whereClause.tag = { [sequelize.Op.like]: `%${tag}%` };

            // Buscar estudiantes
            const students = await Student.findAll({
                where: whereClause,
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'surname', 'email', 'phone']
                    },
                    {
                        model: Profamily,
                        attributes: ['id', 'name', 'description']
                    },
                    {
                        model: Scenter,
                        attributes: ['id', 'name', 'city']
                    }
                ],
                limit: Math.min(limit, 20),
                transaction: t
            });

            // Calcular costo real basado en resultados
            const actualCost = students.length * costPerStudent;

            // Actualizar balance de tokens
            await companyToken.update({
                tokenBalance: companyToken.tokenBalance - actualCost,
                tokensUsed: companyToken.tokensUsed + actualCost
            }, { transaction: t });

            // Registrar uso de tokens para cada estudiante
            for (const student of students) {
                await TokenUsage.create({
                    companyId: company.id,
                    studentId: student.id,
                    tokensUsed: costPerStudent,
                    action: 'student_search'
                }, { transaction: t });
            }

            logger.info({ userId, companyId: company.id, studentsFound: students.length, tokensUsed: actualCost }, "Students searched");
            res.json({
                mensaje: 'Búsqueda realizada exitosamente',
                students: students.map(student => ({
                    id: student.id,
                    name: student.User.name,
                    surname: student.User.surname,
                    email: student.User.email,
                    phone: student.User.phone,
                    grade: student.grade,
                    course: student.course,
                    car: student.car,
                    tag: student.tag,
                    profamily: student.Profamily,
                    scenter: student.Scenter
                })),
                tokensUsed: actualCost,
                remainingTokens: companyToken.tokenBalance - actualCost
            });
        });
    } catch (error) {
        logger.error('Error searchStudents: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/tokens/access-cv/{studentId}:
 *   post:
 *     summary: Acceder al CV de un estudiante usando tokens
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del estudiante
 *     responses:
 *       200:
 *         description: CV obtenido exitosamente
 *       400:
 *         description: Tokens insuficientes
 *       404:
 *         description: Estudiante o CV no encontrado
 *       500:
 *         description: Error interno del servidor
 */
async function accessStudentCV(req, res) {
    const { userId } = req.user;
    const { studentId } = req.params;

    try {
        await sequelize.transaction(async (t) => {
            // Buscar la empresa del usuario
            const company = await Company.findOne({
                include: [{
                    model: User,
                    through: { attributes: [] },
                    where: { id: userId }
                }],
                transaction: t
            });

            if (!company) {
                return res.status(404).json({ mensaje: 'Empresa no encontrada' });
            }

            // Verificar balance de tokens
            let companyToken = await CompanyToken.findOne({
                where: { companyId: company.id },
                transaction: t
            });

            if (!companyToken) {
                companyToken = await CompanyToken.create({
                    companyId: company.id,
                    tokenBalance: 10,
                    tokensUsed: 0
                }, { transaction: t });
            }

            const cost = TOKEN_COSTS.CV_ACCESS;

            if (companyToken.tokenBalance < cost) {
                return res.status(400).json({ 
                    mensaje: 'Tokens insuficientes',
                    required: cost,
                    available: companyToken.tokenBalance
                });
            }

            // Buscar estudiante y su CV
            const student = await Student.findByPk(studentId, {
                include: [
                    {
                        model: User,
                        attributes: ['id', 'name', 'surname', 'email', 'phone']
                    },
                    {
                        model: Cv,
                        attributes: ['id', 'skills', 'experience', 'education', 'languages', 'certifications']
                    },
                    {
                        model: Profamily,
                        attributes: ['id', 'name', 'description'],
                        as: 'profamily' // 🔥 AGREGAR ALIAS
                    },
                    {
                        model: Scenter,
                        attributes: ['id', 'name', 'city']
                    }
                ],
                transaction: t
            });

            if (!student) {
                return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
            }

            // Verificar si ya accedió al CV antes (evitar cobrar múltiples veces)
            const existingAccess = await TokenUsage.findOne({
                where: {
                    companyId: company.id,
                    studentId: student.id,
                    action: 'cv_access'
                },
                transaction: t
            });

            let tokensUsed = 0;
            if (!existingAccess) {
                // Actualizar balance de tokens
                await companyToken.update({
                    tokenBalance: companyToken.tokenBalance - cost,
                    tokensUsed: companyToken.tokensUsed + cost
                }, { transaction: t });

                // Registrar uso de tokens
                await TokenUsage.create({
                    companyId: company.id,
                    studentId: student.id,
                    tokensUsed: cost,
                    action: 'cv_access'
                }, { transaction: t });

                tokensUsed = cost;
            }

            logger.info({ userId, companyId: company.id, studentId, tokensUsed }, "CV accessed");
            res.json({
                mensaje: 'CV obtenido exitosamente',
                student: {
                    id: student.id,
                    name: student.User.name,
                    surname: student.User.surname,
                    email: student.User.email,
                    phone: student.User.phone,
                    grade: student.grade,
                    course: student.course,
                    car: student.car,
                    tag: student.tag,
                    profamily: student.Profamily,
                    scenter: student.Scenter,
                    cv: student.Cv
                },
                tokensUsed,
                remainingTokens: companyToken.tokenBalance - tokensUsed,
                alreadyAccessed: !!existingAccess
            });
        });
    } catch (error) {
        logger.error('Error accessStudentCV: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

/**
 * @swagger
 * /api/tokens/usage-history:
 *   get:
 *     summary: Obtener historial de uso de tokens
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historial obtenido exitosamente
 *       404:
 *         description: Empresa no encontrada
 *       500:
 *         description: Error interno del servidor
 */
async function getTokenUsageHistory(req, res) {
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

        // Obtener historial de uso
        const usageHistory = await TokenUsage.findAll({
            where: { companyId: company.id },
            include: [{
                model: Student,
                attributes: ['id', 'grade', 'course'],
                include: [{
                    model: User,
                    attributes: ['id', 'name', 'surname']
                }]
            }],
            order: [['usedAt', 'DESC']],
            limit: 50
        });

        res.json({
            company: {
                id: company.id,
                name: company.name
            },
            usage: usageHistory.map(usage => ({
                id: usage.id,
                action: usage.action,
                tokensUsed: usage.tokensUsed,
                usedAt: usage.usedAt,
                student: {
                    id: usage.Student.id,
                    name: usage.Student.User.name,
                    surname: usage.Student.User.surname,
                    grade: usage.Student.grade,
                    course: usage.Student.course
                }
            }))
        });
    } catch (error) {
        logger.error('Error getTokenUsageHistory: ' + error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
}

export default {
    getTokenBalance,
    rechargeTokens,
    searchStudents,
    accessStudentCV,
    getTokenUsageHistory
};
