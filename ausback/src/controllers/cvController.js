import { Cv } from '../models/cv.js';
import { CvSkill } from '../models/cvSkill.js';
import { Student } from '../models/student.js';
import { Skill } from '../models/skill.js';
import { User } from '../models/users.js';
import { Profamily } from '../models/profamily.js';
import { Company } from '../models/company.js';
import { RevealedCV } from '../models/revealedCV.js';
import sequelize from '../database/database.js';
import logger from '../logs/logger.js';

/**
 * Obtener el CV completo del estudiante actual con toda la información para matching
 */
async function getMyCv(req, res) {
    try {
        const { userId } = req.user;

        const student = await Student.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'surname', 'email', 'phone']
                }
            ]
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Obtener o crear CV si no existe
        let cv = await Cv.findOne({
            where: { studentId: student.id },
            include: [
                {
                    model: CvSkill,
                    as: 'cvSkills',
                    include: [
                        {
                            model: Skill,
                            as: 'skill',
                            attributes: ['id', 'name', 'category']
                        }
                    ]
                }
            ]
        });

        if (!cv) {
            // Crear CV básico si no existe
            cv = await Cv.create({
                studentId: student.id,
                contactEmail: student.user.email,
                contactPhone: student.user.phone,
                isComplete: false
            });
        }

        // Consolidar toda la información del estudiante para el CV
        // Ya no necesitamos educations ni experiences - solo usamos cvSkills

        // Formatear skills desde cvSkills
        const skills = cv.cvSkills ? cv.cvSkills.map(cvSkill => ({
            id: cvSkill.id,
            skillId: cvSkill.skillId,
            skill: {
                id: cvSkill.skill.id,
                name: cvSkill.skill.name,
                category: cvSkill.skill.category
            },
            proficiencyLevel: cvSkill.proficiencyLevel,
            yearsOfExperience: cvSkill.yearsOfExperience,
            isHighlighted: cvSkill.isHighlighted,
            notes: cvSkill.notes,
            addedAt: cvSkill.addedAt
        })) : [];

        // Retornar CV completo con nueva estructura simplificada
        const completeCv = {
            id: cv.id,
            studentId: cv.studentId,
            summary: cv.summary,
            contactEmail: cv.contactEmail,
            contactPhone: cv.contactPhone,
            academicBackground: cv.academicBackground,
            skills: skills,
            availability: cv.availability,
            isComplete: cv.isComplete,
            lastUpdated: cv.lastUpdated,
            // Información del estudiante
            student: {
                id: student.id,
                name: student.user.name,
                surname: student.user.surname,
                grade: student.grade,
                course: student.course,
                photo: student.photo
            }
        };

        res.json(completeCv);

    } catch (error) {
        logger.error('Error getMyCv: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Obtener el CV de un estudiante específico por userId (para dashboards)
 */
async function getStudentCvByUserId(req, res) {
    try {
        const { userId } = req.params;

        // Verificar que el userId sea válido
        if (!userId || isNaN(userId)) {
            return res.status(400).json({ message: 'ID de usuario inválido' });
        }

        const student = await Student.findOne({
            where: { userId: parseInt(userId) },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['name', 'surname', 'email', 'phone']
                }
            ]
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Obtener o crear CV si no existe
        let cv = await Cv.findOne({
            where: { studentId: student.id },
            include: [
                {
                    model: CvSkill,
                    as: 'cvSkills',
                    include: [
                        {
                            model: Skill,
                            as: 'skill',
                            attributes: ['id', 'name', 'category']
                        }
                    ]
                }
            ]
        });

        if (!cv) {
            // Crear CV básico si no existe
            cv = await Cv.create({
                studentId: student.id,
                contactEmail: student.user.email,
                contactPhone: student.user.phone,
                isComplete: false
            });
        }

        // Formatear skills desde cvSkills
        const skills = cv.cvSkills ? cv.cvSkills.map(cvSkill => ({
            id: cvSkill.id,
            skillId: cvSkill.skillId,
            skill: {
                id: cvSkill.skill.id,
                name: cvSkill.skill.name,
                category: cvSkill.skill.category
            },
            proficiencyLevel: cvSkill.proficiencyLevel,
            yearsOfExperience: cvSkill.yearsOfExperience,
            isHighlighted: cvSkill.isHighlighted,
            notes: cvSkill.notes,
            addedAt: cvSkill.addedAt
        })) : [];

        // Retornar CV completo con nueva estructura simplificada
        const completeCv = {
            id: cv.id,
            studentId: cv.studentId,
            summary: cv.summary,
            contactEmail: cv.contactEmail,
            contactPhone: cv.contactPhone,
            academicBackground: cv.academicBackground,
            skills: skills,
            availability: cv.availability,
            isComplete: cv.isComplete,
            lastUpdated: cv.lastUpdated,
            // Información del estudiante
            student: {
                id: student.id,
                name: student.user.name,
                surname: student.user.surname,
                grade: student.grade,
                course: student.course,
                photo: student.photo
            }
        };

        res.json(completeCv);

    } catch (error) {
        logger.error('Error getStudentCvByUserId: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

async function createOrUpdateCv(req, res) {
    const { userId } = req.user;
    const {
        summary,
        academicBackground,
        availability,
        isComplete
    } = req.body;

    try {
        const student = await Student.findOne({
            where: { userId },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['email', 'phone']
                }
            ]
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        // Usar transacción para asegurar consistencia
        const result = await sequelize.transaction(async (t) => {
            // Buscar CV existente o crear uno nuevo
            let cv = await Cv.findOne({
                where: { studentId: student.id },
                transaction: t
            });

            const cvData = {
                summary,
                academicBackground,
                contactEmail: student.user.email,
                contactPhone: student.user.phone,
                availability,
                isComplete: isComplete !== undefined ? isComplete : false,
                lastUpdated: new Date()
            };

            if (cv) {
                // Actualizar CV existente
                await cv.update(cvData, { transaction: t });
            } else {
                // Crear nuevo CV
                cv = await Cv.create({
                    studentId: student.id,
                    ...cvData
                }, { transaction: t });
            }

            return cv;
        });

        logger.info({ userId, cvId: result.id }, "CV created/updated successfully");
        res.json({
            message: 'CV guardado exitosamente',
            cvId: result.id
        });

    } catch (error) {
        logger.error('Error createOrUpdateCv: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Función auxiliar para consolidar toda la información del estudiante en el CV
 */
async function updateCvConsolidatedData(cvId, studentId, transaction = null) {
    // Obtener toda la información relacionada
    const educations = await Education.findAll({
        where: { studentId },
        order: [['startDate', 'DESC']],
        transaction
    });

    const studentSkills = await StudentSkill.findAll({
        where: { studentId },
        include: [{ model: Skill, attributes: ['id', 'name', 'category'] }],
        transaction
    });

    const experiences = await Experience.findAll({
        where: { studentId },
        order: [['startDate', 'DESC']],
        transaction
    });

    const student = await Student.findByPk(studentId, {
        include: [
            { model: User, as: 'user', attributes: ['name', 'surname', 'email', 'phone'] },
            { model: Profamily, as: 'profamily', attributes: ['id', 'name', 'description'] }
        ],
        transaction
    });

    // Formatear datos consolidados
    const academicBackground = educations.map(edu => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        field: edu.field,
        startDate: edu.startDate,
        endDate: edu.endDate,
        status: edu.status,
        grade: edu.grade
    }));

    const skills = studentSkills.map(ss => ({
        id: ss.skill.id,
        name: ss.skill.name,
        category: ss.skill.category,
        proficiencyLevel: ss.proficiencyLevel,
        yearsOfExperience: ss.yearsOfExperience
    }));

    const workExperience = experiences.map(exp => ({
        id: exp.id,
        company: exp.company,
        position: exp.position,
        description: exp.description,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current
    }));

    const professionalOrientation = {
        profamilyId: student.profamilyId,
        profamilyName: student.profamily?.name,
        interests: student.tag,
        description: student.description,
        availability: student.disp,
        hasCar: student.car
    };

    // Verificar si el CV está completo
    const isComplete = (
        academicBackground.length > 0 &&
        skills.length > 0 &&
        professionalOrientation.profamilyId &&
        workExperience.length >= 0 // Experiencia es opcional
    );

    // Actualizar CV con datos consolidados
    await Cv.update({
        professionalOrientation,
        academicBackground,
        skills,
        workExperience,
        isComplete
    }, {
        where: { id: cvId },
        transaction
    });
}

/**
 * Obtener CV para visualización por empresas (solo información pública)
 */
async function getCvForCompany(req, res) {
    try {
        const { cvId } = req.params;
        const { userId } = req.user;

        // Verificar que la empresa tenga tokens suficientes
        const company = await Company.findOne({
            include: [{
                model: User,
                through: { attributes: [] },
                where: { id: userId }
            }]
        });

        if (!company) {
            return res.status(403).json({ message: 'Empresa no encontrada' });
        }

        if (company.tokens < 1) {
            return res.status(403).json({ message: 'No cuenta con suficientes tokens' });
        }

        // Obtener CV completo
        const cv = await Cv.findByPk(cvId, {
            include: [{
                model: Student,
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['name', 'surname', 'email', 'phone']
                }]
            }]
        });

        if (!cv) {
            return res.status(404).json({ message: 'CV no encontrado' });
        }

        // Registrar que el CV fue visto
        await sequelize.transaction(async (t) => {
            // Descontar token
            await company.update({
                tokens: company.tokens - 1
            }, { transaction: t });

            // Registrar en revealed_cvs
            await RevealedCV.create({
                companyId: company.id,
                studentId: cv.studentId,
                cvId: cv.id,
                revealType: 'full'
            }, { transaction: t });
        });

        res.json(cv);

    } catch (error) {
        logger.error('Error getCvForCompany: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Marcar CV como completo después de validación
 */
async function markCvComplete(req, res) {
    try {
        const { userId } = req.user;

        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const cv = await Cv.findOne({
            where: { studentId: student.id },
            include: [
                {
                    model: CvSkill,
                    as: 'cvSkills'
                }
            ]
        });

        if (!cv) {
            return res.status(404).json({ message: 'CV no encontrado' });
        }

        // Validar que tenga información mínima
        const hasAcademicBackground = cv.academicBackground && cv.academicBackground.scenter && cv.academicBackground.profamily;
        const hasSkills = cv.cvSkills && cv.cvSkills.length > 0;
        const hasSummary = cv.summary && cv.summary.trim().length > 10;

        if (!hasAcademicBackground || !hasSkills || !hasSummary) {
            return res.status(400).json({
                message: 'El CV debe tener al menos: información académica, habilidades y resumen profesional'
            });
        }

        await cv.update({
            isComplete: true,
            lastUpdated: new Date()
        });

        res.json({ message: 'CV marcado como completo' });

    } catch (error) {
        logger.error('Error markCvComplete: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Agregar una skill al CV del estudiante
 */
async function addSkillToCv(req, res) {
    const { userId } = req.user;
    const { skillId, proficiencyLevel, yearsOfExperience, isHighlighted, notes } = req.body;

    try {
        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const cv = await Cv.findOne({
            where: { studentId: student.id }
        });

        if (!cv) {
            return res.status(404).json({ message: 'CV no encontrado. Crea un CV primero.' });
        }

        // Verificar que la skill existe
        const skill = await Skill.findByPk(skillId);
        if (!skill) {
            return res.status(404).json({ message: 'Skill no encontrada' });
        }

        // Verificar que no exista ya la relación
        const existingCvSkill = await CvSkill.findOne({
            where: {
                cvId: cv.id,
                skillId: skillId
            }
        });

        if (existingCvSkill) {
            return res.status(400).json({ message: 'Esta skill ya está en tu CV' });
        }

        // Crear la relación cv_skill
        const cvSkill = await CvSkill.create({
            cvId: cv.id,
            skillId: skillId,
            proficiencyLevel: proficiencyLevel || 'medio',
            yearsOfExperience: yearsOfExperience || 0,
            isHighlighted: isHighlighted || false,
            notes: notes || null,
            addedAt: new Date()
        });

        // Actualizar lastUpdated del CV
        await cv.update({ lastUpdated: new Date() });

        res.json({
            message: 'Skill agregada al CV exitosamente',
            cvSkill: {
                id: cvSkill.id,
                skillId: cvSkill.skillId,
                skill: {
                    id: skill.id,
                    name: skill.name,
                    category: skill.category
                },
                proficiencyLevel: cvSkill.proficiencyLevel,
                yearsOfExperience: cvSkill.yearsOfExperience,
                isHighlighted: cvSkill.isHighlighted,
                notes: cvSkill.notes,
                addedAt: cvSkill.addedAt
            }
        });

    } catch (error) {
        logger.error('Error addSkillToCv: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Actualizar una skill en el CV del estudiante
 */
async function updateCvSkill(req, res) {
    const { userId } = req.user;
    const { cvSkillId } = req.params;
    const { proficiencyLevel, yearsOfExperience, isHighlighted, notes } = req.body;

    try {
        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const cvSkill = await CvSkill.findOne({
            where: { id: cvSkillId },
            include: [
                {
                    model: Cv,
                    where: { studentId: student.id }
                },
                {
                    model: Skill,
                    attributes: ['id', 'name', 'category']
                }
            ]
        });

        if (!cvSkill) {
            return res.status(404).json({ message: 'Skill no encontrada en tu CV' });
        }

        // Actualizar la skill
        await cvSkill.update({
            proficiencyLevel: proficiencyLevel || cvSkill.proficiencyLevel,
            yearsOfExperience: yearsOfExperience !== undefined ? yearsOfExperience : cvSkill.yearsOfExperience,
            isHighlighted: isHighlighted !== undefined ? isHighlighted : cvSkill.isHighlighted,
            notes: notes !== undefined ? notes : cvSkill.notes
        });

        // Actualizar lastUpdated del CV
        await cvSkill.cv.update({ lastUpdated: new Date() });

        res.json({
            message: 'Skill actualizada exitosamente',
            cvSkill: {
                id: cvSkill.id,
                skillId: cvSkill.skillId,
                skill: cvSkill.skill,
                proficiencyLevel: cvSkill.proficiencyLevel,
                yearsOfExperience: cvSkill.yearsOfExperience,
                isHighlighted: cvSkill.isHighlighted,
                notes: cvSkill.notes,
                addedAt: cvSkill.addedAt
            }
        });

    } catch (error) {
        logger.error('Error updateCvSkill: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

/**
 * Quitar una skill del CV del estudiante
 */
async function removeSkillFromCv(req, res) {
    const { userId } = req.user;
    const { cvSkillId } = req.params;

    try {
        const student = await Student.findOne({
            where: { userId }
        });

        if (!student) {
            return res.status(404).json({ message: 'Estudiante no encontrado' });
        }

        const cvSkill = await CvSkill.findOne({
            where: { id: cvSkillId },
            include: [
                {
                    model: Cv,
                    where: { studentId: student.id }
                }
            ]
        });

        if (!cvSkill) {
            return res.status(404).json({ message: 'Skill no encontrada en tu CV' });
        }

        // Eliminar la relación
        await cvSkill.destroy();

        // Actualizar lastUpdated del CV
        await cvSkill.cv.update({ lastUpdated: new Date() });

        res.json({ message: 'Skill removida del CV exitosamente' });

    } catch (error) {
        logger.error('Error removeSkillFromCv: ' + error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}

export default {
    getMyCv,
    getStudentCvByUserId,
    createOrUpdateCv,
    getCvForCompany,
    markCvComplete,
    addSkillToCv,
    updateCvSkill,
    removeSkillFromCv
};

