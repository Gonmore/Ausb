import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import { User, Student, Profamily, Company } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';

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
 *     summary: Búsqueda inteligente de estudiantes con algoritmo de afinidad
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skills:
 *                 type: object
 *                 description: Habilidades valoradas por la empresa
 *                 example: {"JavaScript": 3, "React": 2, "Node.js": 3}
 *               filters:
 *                 type: object
 *                 properties:
 *                   profamilyId:
 *                     type: integer
 *                   grade:
 *                     type: string
 *                   car:
 *                     type: boolean
 *                   minAffinity:
 *                     type: string
 *                     enum: ["bajo", "medio", "alto", "muy alto"]
 */
router.post('/search-intelligent', authenticateJWT, async (req, res) => {
  try {
    const { userId } = req.user;
    const { skills: companySkills, filters = {} } = req.body;

    if (!companySkills || Object.keys(companySkills).length === 0) {
      return res.status(400).json({ mensaje: 'Se requieren habilidades para la búsqueda' });
    }

    // Verificar que la empresa existe
    const userCompanyMapping = {
      2: 1, // María → Tech Corp
      3: 2, // Carlos → Innovate SL  
      4: 3  // Ana → Future Labs
    };

    const companyId = userCompanyMapping[userId];
    if (!companyId) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    // Construir filtros WHERE
    const whereClause = { active: true };
    if (filters.profamilyId) whereClause.profamilyId = filters.profamilyId;
    if (filters.grade) whereClause.grade = filters.grade;
    if (filters.car !== undefined) whereClause.car = filters.car;

    // Obtener estudiantes
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

    // Calcular afinidad para cada estudiante
    const affinityCalculator = new AffinityCalculator();
    const studentsWithAffinity = [];

    for (const student of students) {
      // Convertir tags del estudiante a objeto de skills
      const studentSkills = {};
      if (student.tag) {
        const tags = student.tag.split(',').map(tag => tag.trim());
        tags.forEach(tag => {
          // Asignar valores aleatorios de 1-3 o usar lógica más sofisticada
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
        }
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

    console.log(`✅ Búsqueda inteligente: ${studentsWithAffinity.length} estudiantes encontrados`);
    console.log(`📊 Skills buscados:`, companySkills);
    
    res.json({
      students: studentsWithAffinity,
      searchCriteria: {
        skills: companySkills,
        filters,
        totalFound: studentsWithAffinity.length
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

export default router;