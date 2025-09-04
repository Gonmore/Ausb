import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import { User, Student, Profamily, Company, Application } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';
import { TokenService } from '../services/tokenService.js';
import { Op } from 'sequelize';

const router = express.Router();

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Obtener lista de estudiantes
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const students = await Student.findAll({
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
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      grade: student.grade,
      course: student.course,
      double: student.double,
      car: student.car,
      active: student.active,
      tag: student.tag,
      description: student.description,
      disp: student.disp,
      userId: student.userId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      User: student.User ? {
        id: student.User.id,
        name: student.User.name,
        surname: student.User.surname,
        email: student.User.email,
        phone: student.User.phone
      } : null,
      Profamily: student.profamily ? {
        id: student.profamily.id,
        name: student.profamily.name
      } : null
    }));

    res.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

/**
 * IMPORTANTE: Esta ruta debe ir ANTES de /:id para evitar conflictos
 * @swagger
 * /api/students/candidates:
 *   get:
 *     summary: Obtener candidatos (estudiantes que han aplicado)
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 */
router.get('/candidates', authenticateJWT, async (req, res) => {
  try {
    console.log('🔍 Endpoint /candidates llamado correctamente');
    
    // Por simplicidad, devolvemos todos los estudiantes por ahora
    // Luego puedes filtrar por aplicaciones usando el endpoint de applications
    const students = await Student.findAll({
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
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedStudents = students.map(student => ({
      id: student.id,
      grade: student.grade,
      course: student.course,
      double: student.double,
      car: student.car,
      active: student.active,
      tag: student.tag,
      description: student.description,
      disp: student.disp,
      userId: student.userId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      User: student.User ? {
        id: student.User.id,
        name: student.User.name,
        surname: student.User.surname,
        email: student.User.email,
        phone: student.User.phone
      } : null,
      Profamily: student.profamily ? {
        id: student.profamily.id,
        name: student.profamily.name
      } : null
    }));

    console.log(`✅ Candidatos devueltos: ${formattedStudents.length}`);
    res.json(formattedStudents);
  } catch (error) {
    console.error('❌ Error fetching candidates:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Obtener estudiante por ID
 */
router.get('/:id', authenticateJWT, async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, {
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
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const formattedStudent = {
      id: student.id,
      grade: student.grade,
      course: student.course,
      double: student.double,
      car: student.car,
      active: student.active,
      tag: student.tag,
      description: student.description,
      disp: student.disp,
      userId: student.userId,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      User: student.User ? {
        id: student.User.id,
        name: student.User.name,
        surname: student.User.surname,
        email: student.User.email,
        phone: student.User.phone
      } : null,
      Profamily: student.profamily ? {
        id: student.profamily.id,
        name: student.profamily.name
      } : null
    };

    res.json(formattedStudent);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/students/search-intelligent:
 *   post:
 *     summary: Búsqueda inteligente de estudiantes QUE NO HAN APLICADO a las ofertas de la empresa
 */
router.post('/search-intelligent', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;
    const { skills: companySkills, filters = {} } = req.body;

    if (!companySkills || Object.keys(companySkills).length === 0) {
      return res.status(400).json({ mensaje: 'Se requieren habilidades para la búsqueda' });
    }

    // 🔥 OBTENER EMPRESA DEL USUARIO DESDE LA BASE DE DATOS
    const company = await Company.findOne({
      where: { userId: userId }
    });

    if (!company) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id}) para usuario ${userId}`);

    // 🔍 PASO CLAVE: Obtener IDs de estudiantes que YA APLICARON a ofertas de esta empresa
    const existingApplications = await Application.findAll({
      where: { companyId: company.id },
      attributes: ['studentId'],
      raw: true
    });
    
    const appliedStudentIds = existingApplications.map(app => app.studentId);
    console.log(`🚫 Estudiantes que ya aplicaron a esta empresa:`, appliedStudentIds);

    // Construir filtros WHERE excluyendo candidatos
    const whereClause = { 
      active: true,
      // 🔥 EXCLUSIÓN CLAVE: Solo estudiantes que NO han aplicado
      id: appliedStudentIds.length > 0 ? { [Op.notIn]: appliedStudentIds } : undefined
    };
    
    if (filters.profamilyId) whereClause.profamilyId = filters.profamilyId;
    if (filters.grade) whereClause.grade = filters.grade;
    if (filters.car !== undefined) whereClause.car = filters.car;

    // Obtener estudiantes NO candidatos
    const students = await Student.findAll({
      where: whereClause,
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
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`✅ Estudiantes NO candidatos encontrados: ${students.length}`);

    // Calcular afinidad para cada estudiante
    const affinityCalculator = new AffinityCalculator();
    const studentsWithAffinity = [];

    for (const student of students) {
      // Convertir tags del estudiante a objeto de skills
      const studentSkills = {};
      if (student.tag) {
        const tags = student.tag.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          // Valores aleatorios de 1-3 por ahora (puedes mejorar esta lógica)
          studentSkills[tag] = Math.floor(Math.random() * 3) + 1;
        });
      }

      // Calcular afinidad
      const affinity = affinityCalculator.calculateAffinity(companySkills, studentSkills);

      // Aplicar filtro de afinidad mínima
      if (filters.minAffinity) {
        const levelOrder = { "bajo": 1, "medio": 2, "alto": 3, "muy alto": 4 };
        if (levelOrder[affinity.level] < levelOrder[filters.minAffinity]) {
          continue;
        }
      }

      studentsWithAffinity.push({
        id: student.id,
        grade: student.grade,
        course: student.course,
        double: student.double,
        car: student.car,
        active: student.active,
        tag: student.tag,
        description: student.description,
        disp: student.disp,
        userId: student.userId,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        User: student.User ? {
          id: student.User.id,
          name: student.User.name,
          surname: student.User.surname,
          email: student.User.email,
          phone: student.User.phone
        } : null,
        Profamily: student.profamily ? {
          id: student.profamily.id,
          name: student.profamily.name
        } : null,
        // Información de afinidad
        affinity: {
          level: affinity.level,
          score: affinity.score,
          matches: affinity.matches,
          coverage: affinity.coverage,
          matchingSkills: affinity.matchingSkills,
          hasPremiumMatch: affinity.hasPremiumMatch,
          explanation: `${affinity.matches} coincidencias, ${affinity.coverage}% cobertura, puntuación ${affinity.score}`
        },
        // Indicador de que es un estudiante no candidato
        isNonCandidate: true
      });
    }

    // Ordenar por afinidad (score descendente)
    studentsWithAffinity.sort((a, b) => {
      const levelOrder = { "muy alto": 4, "alto": 3, "medio": 2, "bajo": 1 };
      if (levelOrder[a.affinity.level] !== levelOrder[b.affinity.level]) {
        return levelOrder[b.affinity.level] - levelOrder[a.affinity.level];
      }
      return b.affinity.score - a.affinity.score;
    });

    console.log(`✅ Búsqueda inteligente: ${studentsWithAffinity.length} estudiantes NO candidatos encontrados`);
    
    res.json({
      students: studentsWithAffinity,
      searchCriteria: {
        skills: companySkills,
        filters,
        totalFound: studentsWithAffinity.length,
        excludedCandidates: appliedStudentIds.length,
        searchType: 'non_candidates_only'
      }
    });

  } catch (error) {
    console.error('❌ Error en búsqueda inteligente:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @swagger
 * /api/students/tokens/balance:
 *   get:
 *     summary: Obtener balance de tokens de la empresa
 */
router.get('/tokens/balance', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;
    
    const userCompanyMapping = {
      2: 1, // María → Tech Corp
      3: 2, // Carlos → Innovate SL  
      4: 3  // Ana → Future Labs
    };

    const companyId = userCompanyMapping[userId];
    if (!companyId) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    const tokenRecord = await TokenService.getCompanyTokens(companyId);
    
    res.json({
      balance: tokenRecord.amount,
      used: tokenRecord.usedAmount,
      purchased: tokenRecord.purchasedAmount,
      lastPurchase: tokenRecord.lastPurchaseDate
    });
  } catch (error) {
    console.error('Error obteniendo balance:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

/**
 * @swagger
 * /api/students/tokens/use:
 *   post:
 *     summary: Usar tokens para una acción
 */
router.post('/tokens/use', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;
    const { action, studentId, amount } = req.body;

    const userCompanyMapping = {
      2: 1, 3: 2, 4: 3
    };

    const companyId = userCompanyMapping[userId];
    if (!companyId) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    // Definir costos
    const costs = {
      'view_cv': 2,
      'contact_student': 3
    };

    const cost = amount || costs[action];
    if (!cost) {
      return res.status(400).json({ mensaje: 'Acción no válida' });
    }

    const newBalance = await TokenService.useTokens(
      companyId, 
      cost, 
      action, 
      studentId,
      `${action} - Estudiante ID: ${studentId}`
    );

    res.json({
      success: true,
      newBalance,
      used: cost,
      action
    });
  } catch (error) {
    console.error('Error usando tokens:', error);
    
    if (error.message === 'Tokens insuficientes') {
      return res.status(400).json({ 
        mensaje: 'Tokens insuficientes',
        code: 'INSUFFICIENT_TOKENS'
      });
    }
    
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});

export default router;