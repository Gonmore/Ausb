import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'
import { User, Student, Profamily, Company, Application, UserCompany, Offer } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';
import { TokenService } from '../services/tokenService.js';
import { Op } from 'sequelize';

async function getStudent(req, res) {
    const { userId } = req.user;
    console.log(userId)
    try {
        const student = await Student.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(student);

    }catch(err){
        logger.error('Error getStudent: '+err);
        res.status(500).json({message: 'Server error getting Sdudent'})
    }
}

async function createStudent(req, res){
    const { userId } = req.user;
    const { grade,course,car,tag, disp,
        scenter_id, profamily_id } = req.body;
    
        
    try {
        await sequelize.transaction(async (t) => {
            await Student.update(
                { status: Status.INACTIVE },
                {
                    where: { userId: userId, status: Status.ACTIVE }, 
                    transaction: t 
                }
            );
            const student = await Student.create({
                userId:userId,grade,course,car,tag,disp,
                scenter_id, profamily_id
            },
            { tansaction: t}
            );
            logger.info({ userId }, "Student created");
            res.json(student);
        })
    }catch(err){
        logger.error('Error createStudent: '+err);
        res.status(500).json({message: 'Server error creating student'})
    }
}
async function getPreference(req, res) {
    const { userId } = req.user;
    try {
        const preference = await Preference.findOne({
            where: {
                userId:userId,
            },
        });
        res.json(preference);

    }catch(err){
        logger.error('Error getPreference: '+err);
        res.status(500).json({message: 'Server error getting preference'})
    }
}

async function updateStudent(req, res) {
    const { userId } = req.user;
    const { grade,course,car,tag,
        scenter_id, profamily_id  } = req.body;
    try {
        const student = await Student.update({grade,course,car,tag,
            scenter_id, profamily_id }, {where: {userId:userId}});
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error updateStudent: '+err);
        res.status(500).json({message: 'Server error updating student'})
    }
}

async function activateInactivate(req, res) {
    const { userId }= req.user;
    const {id} = req.params;
    const {active} = req.body;
    try {
        if(!active)   return res.status(400).json({message:'Active is required'});
        
        const student = await Student.findByPk(id);
        if (!student) {
            return res.status(404).json({message: 'student not found'});
        }
        if (student.active === active){
            return res
                .status(400).json({message: 'User already has this status'});
        }
    
        student.active = active;
        await student.save();
        res.json(student);
            
    }catch(error){
        logger.error('Error activateInactivate: '+error);
        res.status(500).json({message: 'Server error'});
    }
}

async function deleteStudent(req,res){
    const { userId }= req.user;
    const {id} = req.params;

    try{
        const student = await Student.destroy({ done }, {where: { id, userId:userId } });
        //destroy no es recomendado
        if (student[0] === 0)
            return res.status(404).json({message: 'Student not found'});
        res.json(student);

    }catch(err){
        logger.error('Error deleteStudent: '+err);
        res.status(500).json({message: 'Server error'})
    }
}

export const getAllStudents = async (req, res) => {
    try {
        const students = await Student.findAll({
            raw: true,
            order: [['createdAt', 'DESC']]
        });

        const studentsWithData = [];
        for (const student of students) {
            const user = await User.findByPk(student.userId, { raw: true });
            const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
            
            if (user) {
                studentsWithData.push({
                    ...student,
                    User: {
                        id: user.id,
                        name: user.name,
                        surname: user.surname,
                        email: user.email,
                        phone: user.phone
                    },
                    Profamily: profamily ? {
                        id: profamily.id,
                        name: profamily.name
                    } : null
                });
            }
        }

        res.json(studentsWithData);
    } catch (error) {
        logger.error('Error getAllStudents:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

export const getCandidates = async (req, res) => {
  try {
    const students = await Student.findAll({
      raw: true,
      order: [['createdAt', 'DESC']]
    });

    const studentsWithData = [];
    for (const student of students) {
      const user = await User.findByPk(student.userId, { raw: true });
      const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
      
      if (user) {
        studentsWithData.push({
          ...student,
          User: {
            id: user.id,
            name: user.name,
            surname: user.surname,
            email: user.email,
            phone: user.phone
          },
          Profamily: profamily ? {
            id: profamily.id,
            name: profamily.name
          } : null
        });
      }
    }

    console.log(`✅ Candidatos devueltos: ${studentsWithData.length}`);
    res.json(studentsWithData);
  } catch (error) {
    logger.error('Error getCandidates:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const searchIntelligentStudents = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // 🔥 DEBUG: Ver qué llega del frontend
    console.log('🔍 REQUEST BODY completo:', req.body);
    console.log('🔍 REQUEST PARAMS:', req.params);
    console.log('🔍 REQUEST QUERY:', req.query);
    
    const { offerId, skills, filters = {} } = req.body;

    console.log('🔍 Datos extraídos:');
    console.log('   - offerId:', offerId);
    console.log('   - skills:', skills);
    console.log('   - filters:', filters);

    // 🔥 MANEJAR AMBOS CASOS: offerId O skills
    if (!offerId && (!skills || skills.length === 0)) {
      return res.status(400).json({ 
        mensaje: 'Se requiere offerId o skills para la búsqueda',
        received: { offerId, skills, filters }
      });
    }

    let companySkillsObject = {};
    let offerInfo = null;

    if (offerId) {
      // 🔥 CASO 1: Búsqueda por oferta específica
      console.log('📋 MODO: Búsqueda por oferta específica');
      
      const offer = await Offer.findByPk(offerId, { raw: true });
      if (!offer) {
        return res.status(404).json({ mensaje: 'Oferta no encontrada' });
      }

      console.log(`📋 Oferta encontrada: "${offer.name}"`);
      console.log(`🏷️ Skills de la oferta (tag):`, offer.tag);

      if (offer.tag) {
        const offerSkills = offer.tag.split(',').map(skill => skill.trim().toLowerCase());
        console.log('🔍 Skills de la oferta procesados:', offerSkills);
        
        offerSkills.forEach(skill => {
          companySkillsObject[skill] = 3; // nivel requerido
        });
      }

      offerInfo = {
        id: offer.id,
        name: offer.name,
        skills: Object.keys(companySkillsObject)
      };

    } else {
      // 🔥 CASO 2: Búsqueda por skills generales
      console.log('📋 MODO: Búsqueda por skills generales');
      console.log('🔍 Skills recibidas:', skills);
      
      skills.forEach(skill => {
        const normalizedSkill = skill.toLowerCase().trim();
        companySkillsObject[normalizedSkill] = 3; // nivel requerido
      });

      offerInfo = {
        id: null,
        name: 'Búsqueda general',
        skills: Object.keys(companySkillsObject)
      };
    }

    console.log('🏢 Skills finales para comparar:', companySkillsObject);

    // 🔥 OBTENER EMPRESA
    const userCompany = await UserCompany.findOne({
      where: { 
        userId: userId,
        isActive: true 
      },
      include: [{
        model: Company,
        as: 'company'
      }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    console.log(`🏢 Empresa: ${company.name} (ID: ${company.id})`);

    // 🔥 OBTENER ESTUDIANTES QUE YA APLICARON
    let appliedStudentIds = [];
    
    if (offerId) {
      // Excluir solo los que aplicaron a esta oferta específica
      const existingApplications = await Application.findAll({
        where: { offerId: offerId },
        attributes: ['studentId'],
        raw: true
      });
      appliedStudentIds = existingApplications.map(app => app.studentId);
      console.log(`🚫 Estudiantes que ya aplicaron a esta oferta: ${appliedStudentIds.length}`);
    } else {
      // Excluir los que aplicaron a cualquier oferta de la empresa
      const existingApplications = await Application.findAll({
        where: { companyId: company.id },
        attributes: ['studentId'],
        raw: true
      });
      appliedStudentIds = existingApplications.map(app => app.studentId);
      console.log(`🚫 Estudiantes que ya aplicaron a la empresa: ${appliedStudentIds.length}`);
    }

    // Construir filtros
    const whereClause = { 
      active: true,
      id: appliedStudentIds.length > 0 ? { [Op.notIn]: appliedStudentIds } : undefined
    };
    
    if (filters.profamilyId) whereClause.profamilyId = filters.profamilyId;
    if (filters.grade) whereClause.grade = filters.grade;
    if (filters.car !== undefined) whereClause.car = filters.car;

    // Obtener estudiantes
    const students = await Student.findAll({
      where: whereClause,
      raw: true,
      order: [['createdAt', 'DESC']]
    });

    console.log(`📋 Estudiantes candidatos encontrados: ${students.length}`);

    // 🔥 SI NO HAY SKILLS PARA COMPARAR, DEVOLVER ESTUDIANTES SIN AFINIDAD
    if (Object.keys(companySkillsObject).length === 0) {
      console.log('⚠️ No hay skills para comparar, devolviendo estudiantes sin afinidad');
      
      const studentsWithoutAffinity = [];
      for (const student of students) {
        const user = await User.findByPk(student.userId, { raw: true });
        const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
        
        if (user) {
          studentsWithoutAffinity.push({
            ...student,
            User: {
              id: user.id,
              name: user.name,
              surname: user.surname,
              email: user.email,
              phone: user.phone
            },
            Profamily: profamily ? {
              id: profamily.id,
              name: profamily.name
            } : null,
            affinity: {
              level: 'sin datos',
              score: 0,
              matches: 0,
              coverage: 0,
              matchingSkills: [],
              explanation: 'No hay habilidades definidas para comparar'
            },
            isNonCandidate: true
          });
        }
      }

      return res.json({
        students: studentsWithoutAffinity,
        offer: offerInfo,
        searchCriteria: {
          offerId: offerId || null,
          skills: skills || [],
          filters,
          totalFound: studentsWithoutAffinity.length,
          excludedCandidates: appliedStudentIds.length,
          searchType: offerId ? 'for_specific_offer' : 'general_search'
        }
      });
    }

    // Calcular afinidad
    const affinityCalculator = new AffinityCalculator();
    const studentsWithAffinity = [];

    for (const student of students) {
      const user = await User.findByPk(student.userId, { raw: true });
      const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;
      
      if (!user) continue;

      // 🔥 PARSING DE SKILLS DEL ESTUDIANTE
      const studentSkills = {};
      if (student.tag) {
        const tags = student.tag.split(',').map(tag => tag.trim().toLowerCase());
        console.log(`👤 ${user.email} - skills RAW:`, student.tag);
        console.log(`👤 ${user.email} - skills array:`, tags);
        
        tags.forEach(tag => {
          let skillLevel = 2; // nivel medio por defecto
          
          if (student.grade === 'Grado Superior') {
            // Más variabilidad: 2-4 para superiores
            skillLevel = Math.floor(Math.random() * 3) + 2; // 2, 3, o 4
          } else if (student.grade === 'Grado Medio') {
            // Más variabilidad: 1-3 para medios  
            skillLevel = Math.floor(Math.random() * 3) + 1; // 1, 2, o 3
          }
          
          studentSkills[tag] = skillLevel;
        });
      } else {
        console.log(`👤 ${user.email} - SIN SKILLS (tag vacío)`);
      }

      console.log(`👤 ${user.email} - skills procesados:`, studentSkills);

      // 🔥 CALCULAR AFINIDAD
      const affinity = affinityCalculator.calculateAffinity(companySkillsObject, studentSkills);
      console.log(`🎯 Afinidad ${user.email}: ${affinity.level} (score: ${affinity.score}, matches: ${affinity.matches})`);

      // Aplicar filtro de afinidad mínima
      if (filters.minAffinity) {
        const levelOrder = { "sin datos": 0, "bajo": 1, "medio": 2, "alto": 3, "muy alto": 4 };
        if (levelOrder[affinity.level] < levelOrder[filters.minAffinity]) {
          continue;
        }
      }

      studentsWithAffinity.push({
        ...student,
        User: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone
        },
        Profamily: profamily ? {
          id: profamily.id,
          name: profamily.name
        } : null,
        affinity: {
          level: affinity.level,
          score: affinity.score,
          matches: affinity.matches,
          coverage: affinity.coverage,
          matchingSkills: affinity.matchingSkills || [],
          explanation: affinity.explanation || `${affinity.matches} coincidencias encontradas`
        },
        isNonCandidate: true
      });
    }

    // Ordenar por afinidad
    studentsWithAffinity.sort((a, b) => {
      const levelOrder = { "sin datos": 0, "bajo": 1, "medio": 2, "alto": 3, "muy alto": 4 };
      if (levelOrder[a.affinity.level] !== levelOrder[b.affinity.level]) {
        return levelOrder[b.affinity.level] - levelOrder[a.affinity.level];
      }
      return b.affinity.score - a.affinity.score;
    });

    console.log(`✅ Candidatos con afinidad: ${studentsWithAffinity.length}`);
    
    res.json({
      students: studentsWithAffinity,
      offer: offerInfo,
      searchCriteria: {
        offerId: offerId || null,
        skills: skills || Object.keys(companySkillsObject),
        filters,
        totalFound: studentsWithAffinity.length,
        excludedCandidates: appliedStudentIds.length,
        searchType: offerId ? 'for_specific_offer' : 'general_search'
      }
    });

  } catch (error) {
    console.error('❌ Error en búsqueda inteligente:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id, { raw: true });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const user = await User.findByPk(student.userId, { raw: true });
    const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;

    const formattedStudent = {
      ...student,
      User: user ? {
        id: user.id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        phone: user.phone
      } : null,
      Profamily: profamily ? {
        id: profamily.id,
        name: profamily.name
      } : null
    };

    res.json(formattedStudent);
  } catch (error) {
    logger.error('Error getStudentById:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export const getTokenBalance = async (req, res) => {
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
    logger.error('Error getTokenBalance:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// AGREGAR estas líneas al final del archivo, antes del export default:

// 🔥 VER CV - GRATIS para candidatos normales, CON TOKENS para IA
export const viewStudentCV = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false } = req.body;

    console.log(`📄 Solicitud de CV - Estudiante: ${studentId}, Desde IA: ${fromIntelligentSearch}`);

    // Obtener empresa
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, COBRAR TOKENS
    if (fromIntelligentSearch) {
      const tokenCost = 2;
      
      try {
        const newBalance = await TokenService.useTokens(
          company.id,
          tokenCost,
          'view_cv_ai',
          studentId,
          `Ver CV desde búsqueda inteligente - Estudiante ID: ${studentId}`
        );
        
        console.log(`💳 Tokens cobrados: ${tokenCost}, Nuevo balance: ${newBalance}`);
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(400).json({
            mensaje: 'Tokens insuficientes para ver este CV',
            code: 'INSUFFICIENT_TOKENS',
            required: tokenCost
          });
        }
        throw error;
      }
    } else {
      console.log(`🆓 Acceso GRATUITO al CV desde lista de candidatos normales`);
    }

    // Obtener datos del estudiante
    const student = await Student.findByPk(studentId, { raw: true });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const user = await User.findByPk(student.userId, { raw: true });
    const profamily = student.profamilyId ? await Profamily.findByPk(student.profamilyId, { raw: true }) : null;

    const cvData = {
      student: {
        ...student,
        User: user ? {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          phone: user.phone
        } : null,
        Profamily: profamily ? {
          id: profamily.id,
          name: profamily.name
        } : null
      },
      cv: {
        education: `${student.grade} - ${student.course}`,
        skills: student.tag ? student.tag.split(',').map(s => s.trim()) : [],
        hasVehicle: student.car,
        availability: student.disp,
        description: student.description
      },
      accessType: fromIntelligentSearch ? 'paid' : 'free',
      tokensUsed: fromIntelligentSearch ? 2 : 0
    };

    res.json(cvData);

  } catch (error) {
    console.error('❌ Error viendo CV:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// 🔥 CONTACTAR ESTUDIANTE - GRATIS para candidatos normales, CON TOKENS para IA
export const contactStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false, message = '' } = req.body;

    console.log(`📞 Solicitud de contacto - Estudiante: ${studentId}, Desde IA: ${fromIntelligentSearch}`);

    // Obtener empresa
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, COBRAR TOKENS
    if (fromIntelligentSearch) {
      const tokenCost = 3;
      
      try {
        const newBalance = await TokenService.useTokens(
          company.id,
          tokenCost,
          'contact_student_ai',
          studentId,
          `Contactar estudiante desde búsqueda inteligente - Estudiante ID: ${studentId}`
        );
        
        console.log(`💳 Tokens cobrados: ${tokenCost}, Nuevo balance: ${newBalance}`);
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(400).json({
            mensaje: 'Tokens insuficientes para contactar este estudiante',
            code: 'INSUFFICIENT_TOKENS',
            required: tokenCost
          });
        }
        throw error;
      }
    } else {
      console.log(`🆓 Contacto GRATUITO desde lista de candidatos normales`);
    }

    // Obtener datos del estudiante
    const student = await Student.findByPk(studentId, { raw: true });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const user = await User.findByPk(student.userId, { raw: true });

    res.json({
      success: true,
      message: 'Contacto realizado exitosamente',
      student: {
        id: student.id,
        name: user ? `${user.name} ${user.surname}` : 'No disponible',
        email: user ? user.email : 'No disponible',
        phone: user ? user.phone : 'No disponible'
      },
      company: {
        id: company.id,
        name: company.name,
        email: company.email
      },
      accessType: fromIntelligentSearch ? 'paid' : 'free',
      tokensUsed: fromIntelligentSearch ? 3 : 0,
      contactMessage: message
    });

  } catch (error) {
    console.error('❌ Error contactando estudiante:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// VERIFICAR que esta función esté al final del archivo, antes del export default:

export const useTokens = async (req, res) => {
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
    logger.error('Error useTokens:', error);
    
    if (error.message === 'Tokens insuficientes') {
      return res.status(400).json({ 
        mensaje: 'Tokens insuficientes',
        code: 'INSUFFICIENT_TOKENS'
      });
    }
    
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export default {
    getStudent,
    createStudent,
    updateStudent,
    activateInactivate,
    deleteStudent,
    // 🔥 AGREGAR LAS NUEVAS FUNCIONES:
    getAllStudents,
    getCandidates,
    searchIntelligentStudents,
    getStudentById,
    getTokenBalance,
    useTokens,
    viewStudentCV,
    contactStudent
}

