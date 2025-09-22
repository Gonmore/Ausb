import { Status } from '../constants/index.js'
import sequelize from '../database/database.js';
import logger from '../logs/logger.js'
import { TokenService } from '../services/tokenService.js';
import * as companyService from '../services/companyService.js'; // 🔥 AGREGAR ESTA LÍNEA
import { Student, User, Profamily, UserCompany, Company, RevealedCV, Application, Offer, Skill, StudentSkill } from '../models/relations.js';
import { AffinityCalculator } from '../services/affinityCalculator.js';
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
      // ELIMINADO: lógica de tag hardcodeado
      console.log(`🔗 Skills de la oferta (desde relación):`, offer.Skills ? offer.Skills.length : 0);

      if (offer.Skills && offer.Skills.length > 0) {
        console.log('🔍 Skills de la oferta profesionales:', offer.Skills.map(s => s.name));
        
        offer.Skills.forEach(skill => {
          companySkillsObject[skill.name.toLowerCase()] = 3; // nivel requerido
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

// AGREGAR esta función también antes del export default:

export const getTokenBalance = async (req, res) => {
  try {
    const { userId } = req.user;

    // Obtener empresa asociada al usuario
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    // Obtener balance de tokens usando TokenService
    const tokenData = await TokenService.getCompanyTokens(userCompany.company.id);

    res.json({
      balance: tokenData.available,
      used: tokenData.used,
      total: tokenData.total,
      companyId: userCompany.company.id,
      companyName: userCompany.company.name
    });

  } catch (error) {
    console.error('❌ Error obteniendo balance de tokens:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR estas funciones al final del archivo, antes del export default:

// 🔥 VER CV - GRATIS para candidatos normales, CON TOKENS para IA
export const viewStudentCV = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false } = req.body;

    console.log(`📄 Solicitud CV - Estudiante: ${studentId}, Desde IA: ${fromIntelligentSearch}, Usuario: ${userId}`);

    // 🔥 OBTENER EMPRESA DEL USUARIO DIRECTAMENTE
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    console.log(`🏢 Empresa encontrada: ${company.name} (ID: ${company.id})`);
    
    let tokensUsed = 0;
    let wasAlreadyRevealed = false;
    let accessType = 'free';

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, VERIFICAR Y COBRAR TOKENS
    if (fromIntelligentSearch) {
      console.log(`🤖 Búsqueda inteligente - Verificando tokens para empresa ${company.id}`);
      
      try {
        const tokenResult = await TokenService.useTokens(
          company.id,
          2, // Costo fijo: 2 tokens por CV
          'view_cv_ai',
          parseInt(studentId),
          `Ver CV completo del estudiante ${studentId} (Búsqueda Inteligente)`
        );
        
        tokensUsed = tokenResult.wasAlreadyRevealed ? 0 : 2;
        wasAlreadyRevealed = tokenResult.wasAlreadyRevealed;
        accessType = wasAlreadyRevealed ? 'previously_revealed' : 'paid';
        
        console.log(`💳 Resultado tokens: ${tokenResult.message || 'Tokens procesados correctamente'}`);
        
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(402).json({
            code: 'INSUFFICIENT_TOKENS',
            mensaje: 'Tokens insuficientes para ver el CV',
            required: 2,
            action: 'view_cv'
          });
        }
        throw error;
      }
    } else {
      console.log(`✅ Acceso gratuito - Candidato aplicó directamente`);
      accessType = 'free';
    }

    // 🔥 MARCAR AUTOMÁTICAMENTE TODAS LAS APLICACIONES COMO "CV REVISADO"
    try {
      const updatedApplications = await Application.update(
        {
          reviewedAt: new Date(),
          status: 'reviewed' // Cambiar de 'pending' a 'reviewed'
        },
        {
          where: {
            studentId: parseInt(studentId),
            companyId: company.id,
            status: 'pending', // Solo cambiar las que están pendientes
            reviewedAt: null    // Solo las que no han sido revisadas
          }
        }
      );

      if (updatedApplications[0] > 0) {
        console.log(`✅ Marcadas ${updatedApplications[0]} aplicaciones como "CV revisado" para estudiante ${studentId}`);
      }
    } catch (updateError) {
      console.error('⚠️ Error actualizando aplicaciones a "revisado":', updateError);
      // No fallar la operación principal por este error
    }

    // 🔥 OBTENER DATOS COMPLETOS DEL ESTUDIANTE
    const student = await Student.findByPk(studentId, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'surname', 'email', 'phone', 'description']
        },
        {
          model: Profamily,
          as: 'profamily',
          attributes: ['id', 'name', 'description'],
          required: false
        }
      ]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // 🔥 PREPARAR RESPUESTA COMPLETA
    const responseData = {
      student: {
        id: student.id,
        grade: student.grade,
        course: student.course,
        car: student.car,
        tag: student.tag,
        description: student.description,
        User: student.user,
        profamily: student.profamily
      },
      cv: {
        education: `${student.grade} - ${student.course}`,
        skills: student.tag ? student.tag.split(',').map(s => s.trim()) : [],
        hasVehicle: student.car,
        availability: student.disp,
        description: student.description || 'Sin descripción adicional'
      },
      access: {
        type: accessType,
        tokensUsed: tokensUsed,
        wasAlreadyRevealed: wasAlreadyRevealed,
        message: wasAlreadyRevealed ? 'CV ya revelado previamente' : 
                fromIntelligentSearch ? `CV revelado usando ${tokensUsed} tokens` : 
                'Acceso gratuito por aplicación directa'
      },
      // 🔥 MANTENER COMPATIBILIDAD CON FRONTEND EXISTENTE
      accessType: accessType,
      tokensUsed: tokensUsed,
      wasAlreadyRevealed: wasAlreadyRevealed,
      // 🔥 AGREGAR INFO DE APLICACIONES ACTUALIZADAS
      applicationsUpdated: true,
      message: 'CV visto exitosamente. Aplicaciones marcadas como revisadas.'
    };

    console.log(`✅ CV enviado exitosamente. Tipo: ${accessType}, Tokens: ${tokensUsed}`);
    res.json(responseData);

  } catch (error) {
    console.error('❌ Error viendo CV:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR función para obtener CVs revelados:
export const getRevealedCVs = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Obtener empresa del usuario directamente
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const company = userCompany.company;
    
    // Obtener todos los CVs revelados de esta empresa
    const revealedCVs = await RevealedCV.findAll({
      where: { companyId: company.id },
      attributes: ['studentId', 'tokensUsed', 'revealType', 'revealedAt'],
      order: [['revealedAt', 'DESC']]
    });

    const revealedStudentIds = revealedCVs.map(cv => cv.studentId);
    
    console.log(`📋 CVs revelados para empresa ${company.id}: ${revealedStudentIds.length} estudiantes`);
    
    res.json({
      revealedStudentIds: revealedStudentIds,
      details: revealedCVs,
      count: revealedStudentIds.length
    });

  } catch (error) {
    console.error('❌ Error obteniendo CVs revelados:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getRevealedCVsWithDetails = async (req, res) => {
  try {
    const { userId } = req.user;

    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const revealedCVsData = await RevealedCV.findAll({
      where: { companyId: userCompany.company.id },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            { 
              model: User, 
              as: 'user', // Usar 'user' en lugar de 'User'
              attributes: ['id', 'name', 'surname', 'email', 'phone']
            },
            { 
              model: Profamily, 
              as: 'profamily',
              attributes: ['id', 'name'],
              required: false 
            }
          ]
        }
      ],
      order: [['revealedAt', 'DESC']]
    });

    const processedData = revealedCVsData.map(revealed => ({
      id: revealed.id,
      studentId: revealed.studentId,
      revealedAt: revealed.revealedAt,
      tokensUsed: revealed.tokensUsed,
      revealType: revealed.revealType,
      student: {
        id: revealed.student.id,
        grade: revealed.student.grade,
        course: revealed.student.course,
        car: revealed.student.car,
        tag: revealed.student.tag,
        description: revealed.student.description,
        active: revealed.student.active,
        user: revealed.student.user,
        profamily: revealed.student.profamily
      }
    }));

    res.json({
      revealedCVs: processedData,
      total: processedData.length,
      company: {
        id: userCompany.company.id,
        name: userCompany.company.name
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo CVs revelados con detalles:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const useTokens = async (req, res) => {
  try {
    const { userId } = req.user;
    const { action, studentId, amount } = req.body;

    // Mapeo de usuarios a empresas (temporal - debería venir de la relación UserCompany)
    const userCompanyMapping = {
      2: 1, 3: 2, 4: 3
    };

    const companyId = userCompanyMapping[userId];
    if (!companyId) {
      return res.status(403).json({ mensaje: 'Usuario no está asociado a ninguna empresa' });
    }

    // Definir costos por acción
    const costs = {
      'view_cv': 2,
      'contact_student': 3
    };

    const cost = amount || costs[action];
    if (!cost) {
      return res.status(400).json({ mensaje: 'Acción no válida' });
    }

    // Usar el TokenService para procesar la transacción
    const result = await TokenService.useTokens(
      companyId, 
      cost, 
      action, 
      studentId,
      `${action} - Estudiante ID: ${studentId}`
    );

    res.json({
      success: true,
      newBalance: result.newBalance,
      used: cost,
      action,
      wasAlreadyRevealed: result.wasAlreadyRevealed || false
    });

  } catch (error) {
    console.error('❌ Error useTokens:', error);
    
    if (error.message === 'Tokens insuficientes') {
      return res.status(400).json({ 
        mensaje: 'Tokens insuficientes',
        code: 'INSUFFICIENT_TOKENS'
      });
    }
    
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

// AGREGAR esta función después de viewStudentCV:

// 🔥 CONTACTAR ESTUDIANTE - GRATIS si ya fue revelado, CON TOKENS si es la primera vez
export const contactStudent = async (req, res) => {
  try {
    const { userId } = req.user;
    const { studentId } = req.params;
    const { fromIntelligentSearch = false, message = '', subject = '' } = req.body;

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
    let wasAlreadyRevealed = false;
    let tokensUsed = 0;

    // 🔥 SI VIENE DE BÚSQUEDA INTELIGENTE, VERIFICAR SI YA FUE REVELADO
    if (fromIntelligentSearch) {
      try {
        const result = await TokenService.useTokens(
          company.id,
          2, // Mismo costo que ver CV (2 tokens por "revelar" estudiante)
          'contact_student_ai',
          studentId,
          `Contactar estudiante desde búsqueda inteligente - Estudiante ID: ${studentId}`
        );
        
        wasAlreadyRevealed = result.wasAlreadyRevealed;
        tokensUsed = wasAlreadyRevealed ? 0 : 2;
        
        if (wasAlreadyRevealed) {
          console.log(`✅ Estudiante ya fue revelado anteriormente - Contacto gratuito`);
        } else {
          console.log(`💳 Tokens cobrados: 2, Nuevo balance: ${result.newBalance}`);
        }
        
      } catch (error) {
        if (error.message === 'Tokens insuficientes') {
          return res.status(400).json({
            mensaje: 'Tokens insuficientes para contactar este estudiante',
            code: 'INSUFFICIENT_TOKENS',
            required: 2
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

    // TODO: Aquí agregar lógica para enviar notificación/email al estudiante
    // Por ahora solo registramos el contacto
    
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
      contactData: {
        subject: subject || `Contacto desde ${company.name}`,
        message: message || 'La empresa está interesada en contactar contigo.',
        sentAt: new Date().toISOString()
      },
      accessType: fromIntelligentSearch ? (wasAlreadyRevealed ? 'previously_revealed' : 'paid') : 'free',
      tokensUsed: tokensUsed,
      wasAlreadyRevealed: wasAlreadyRevealed
    });

  } catch (error) {
    console.error('❌ Error contactando estudiante:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// AGREGAR esta función:

export const getRevealedCandidates = async (req, res) => {
  try {
    const { userId } = req.user;
    console.log(`📋 Obteniendo candidatos con CVs revelados para usuario: ${userId}`);

    // Obtener empresa del usuario
    const userCompany = await UserCompany.findOne({
      where: { userId: userId, isActive: true },
      include: [{ model: Company, as: 'company' }],
      raw: false
    });

    if (!userCompany || !userCompany.company) {
      return res.status(404).json({ mensaje: 'Usuario no está asociado a ninguna empresa activa' });
    }

    const companyId = userCompany.company.id;
    console.log(`🏢 Empresa encontrada: ${userCompany.company.name} (ID: ${companyId})`);

    // Obtener todos los CVs revelados por esta empresa
    const revealedCVs = await RevealedCV.findAll({
      where: { companyId: companyId },
      include: [
        {
          model: Student,
          as: 'student',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'surname', 'email', 'phone']
            },
            {
              model: Profamily,
              as: 'profamily',
              attributes: ['id', 'name'],
              required: false
            }
          ]
        }
      ],
      order: [['revealedAt', 'DESC']]
    });

    console.log(`✅ Encontrados ${revealedCVs.length} CVs revelados`);

    // Formatear datos para el frontend
    const students = revealedCVs.map(revealed => ({
      id: revealed.student.id,
      revealedAt: revealed.revealedAt,
      tokensUsed: revealed.tokensUsed,
      searchMethod: revealed.searchMethod,
      student: {
        id: revealed.student.id,
        grade: revealed.student.grade,
        course: revealed.student.course,
        car: revealed.student.car,
        tag: revealed.student.tag,
        description: revealed.student.description,
        User: revealed.student.user,
        profamily: revealed.student.profamily
      },
      // Verificar si el estudiante también tiene aplicaciones
      hasApplications: false, // Se puede mejorar con una query adicional
      revealInfo: {
        date: revealed.revealedAt,
        tokens: revealed.tokensUsed,
        method: revealed.searchMethod || 'intelligent_search'
      }
    }));

    // Calcular estadísticas
    const totalRevealed = students.length;
    const totalTokensSpent = revealedCVs.reduce((sum, revealed) => sum + (revealed.tokensUsed || 0), 0);
    const averageTokensPerReveal = totalRevealed > 0 ? Math.round(totalTokensSpent / totalRevealed * 10) / 10 : 0;

    const summary = {
      totalRevealed,
      totalTokensSpent,
      averageTokensPerReveal
    };

    console.log(`📊 Estadísticas: ${totalRevealed} revelados, ${totalTokensSpent} tokens gastados`);

    res.json({
      students,
      summary
    });

  } catch (error) {
    console.error('❌ Error getRevealedCandidates:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/student/skills:
 *   get:
 *     summary: Obtener skills del estudiante actual
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Skills del estudiante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 skills:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       area:
 *                         type: string
 *                       proficiencyLevel:
 *                         type: string
 *                         enum: [beginner, intermediate, advanced, expert]
 *                       yearsOfExperience:
 *                         type: number
 */
export const getStudentSkills = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Buscar el estudiante
    const student = await Student.findOne({
      where: { userId },
      include: [{
        model: Skill,
        as: 'skills',
        through: {
          attributes: ['proficiencyLevel', 'yearsOfExperience', 'isVerified', 'notes', 'addedAt']
        }
      }]
    });

    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    const formattedSkills = student.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      area: skill.area,
      proficiencyLevel: skill.student_skills.proficiencyLevel,
      yearsOfExperience: skill.student_skills.yearsOfExperience,
      isVerified: skill.student_skills.isVerified,
      notes: skill.student_skills.notes,
      addedAt: skill.student_skills.addedAt
    }));

    res.json({
      skills: formattedSkills,
      totalSkills: formattedSkills.length
    });

  } catch (error) {
    console.error('❌ Error getStudentSkills:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

/**
 * @swagger
 * /api/student/skills:
 *   post:
 *     summary: Agregar skills al perfil del estudiante
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - skills
 *             properties:
 *               skills:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - skillId
 *                     - proficiencyLevel
 *                   properties:
 *                     skillId:
 *                       type: integer
 *                     proficiencyLevel:
 *                       type: string
 *                       enum: [beginner, intermediate, advanced, expert]
 *                     yearsOfExperience:
 *                       type: number
 *                       minimum: 0
 *                     notes:
 *                       type: string
 */
export const addStudentSkills = async (req, res) => {
  try {
    const { userId } = req.user;
    const { skills } = req.body;

    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ mensaje: 'Se requiere un array de skills' });
    }

    // Buscar el estudiante
    const student = await Student.findOne({ where: { userId } });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    await sequelize.transaction(async (t) => {
      // Agregar cada skill
      for (const skillData of skills) {
        const { skillId, proficiencyLevel, yearsOfExperience = 0, notes } = skillData;

        // Verificar que la skill existe
        const skill = await Skill.findByPk(skillId, { transaction: t });
        if (!skill) {
          throw new Error(`Skill con ID ${skillId} no encontrada`);
        }

        // Verificar si ya existe la relación
        const existingRelation = await StudentSkill.findOne({
          where: { studentId: student.id, skillId },
          transaction: t
        });

        if (existingRelation) {
          // Actualizar si ya existe
          await existingRelation.update({
            proficiencyLevel,
            yearsOfExperience,
            notes,
            lastUpdated: new Date()
          }, { transaction: t });
        } else {
          // Crear nueva relación
          await StudentSkill.create({
            studentId: student.id,
            skillId,
            proficiencyLevel,
            yearsOfExperience,
            notes,
            isVerified: false
          }, { transaction: t });
        }
      }
    });

    // Obtener las skills actualizadas
    const updatedStudent = await Student.findOne({
      where: { userId },
      include: [{
        model: Skill,
        as: 'skills',
        through: {
          attributes: ['proficiencyLevel', 'yearsOfExperience', 'isVerified', 'notes']
        }
      }]
    });

    const formattedSkills = updatedStudent.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      area: skill.area,
      proficiencyLevel: skill.student_skills.proficiencyLevel,
      yearsOfExperience: skill.student_skills.yearsOfExperience,
      isVerified: skill.student_skills.isVerified,
      notes: skill.student_skills.notes
    }));

    res.json({
      mensaje: 'Skills actualizadas exitosamente',
      skills: formattedSkills,
      totalSkills: formattedSkills.length
    });

  } catch (error) {
    console.error('❌ Error addStudentSkills:', error);
    res.status(500).json({ 
      mensaje: 'Error interno del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @swagger
 * /api/student/skills/{skillId}:
 *   delete:
 *     summary: Eliminar skill del perfil del estudiante
 *     tags: [Student Skills]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: skillId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la skill a eliminar
 *     responses:
 *       200:
 *         description: Skill eliminada exitosamente
 */
export const removeStudentSkill = async (req, res) => {
  try {
    const { userId } = req.user;
    const { skillId } = req.params;

    // Buscar el estudiante
    const student = await Student.findOne({ where: { userId } });
    if (!student) {
      return res.status(404).json({ mensaje: 'Estudiante no encontrado' });
    }

    // Eliminar la relación
    const deleted = await StudentSkill.destroy({
      where: { 
        studentId: student.id, 
        skillId: parseInt(skillId) 
      }
    });

    if (deleted === 0) {
      return res.status(404).json({ mensaje: 'Skill no encontrada en el perfil del estudiante' });
    }

    res.json({ mensaje: 'Skill eliminada exitosamente' });

  } catch (error) {
    console.error('❌ Error removeStudentSkill:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
};

export default {
    getStudent,
    createStudent,
    updateStudent,
    activateInactivate,
    deleteStudent,
    getAllStudents,
    getCandidates,
    searchIntelligentStudents,
    getStudentById,
    getTokenBalance,
    useTokens,
    viewStudentCV,
    contactStudent,
    getRevealedCVs,
    getRevealedCandidates,
    getStudentSkills,
    addStudentSkills,
    removeStudentSkill
    //getRevealedCVsWithDetails  // 🔥 AGREGAR
}

