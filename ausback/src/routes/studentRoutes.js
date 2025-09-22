import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

// 🔥 RUTAS ESPECÍFICAS PRIMERO (antes de las rutas con parámetros)
router.get('/candidates', authenticateJWT, studentController.getCandidates);
router.post('/search-intelligent', authenticateJWT, studentController.searchIntelligentStudents);
router.get('/tokens/balance', authenticateJWT, studentController.getTokenBalance);
router.post('/tokens/use', authenticateJWT, studentController.useTokens);
router.get('/revealed-cvs', authenticateJWT, studentController.getRevealedCVs);
router.get('/revealed-candidates', authenticateJWT, studentController.getRevealedCandidates); // Nueva ruta agregada

// 🔥 RUTAS PARA GESTIÓN DE SKILLS DE ESTUDIANTES
router.get('/skills', authenticateJWT, studentController.getStudentSkills);
router.post('/skills', authenticateJWT, studentController.addStudentSkills);
router.delete('/skills/:skillId', authenticateJWT, studentController.removeStudentSkill);

// 🔥 RUTAS EXISTENTES GENERALES
router.get('/', authenticateJWT, studentController.getAllStudents);

// 🔥 RUTAS CON PARÁMETROS AL FINAL
router.post('/:studentId/view-cv', (req, res, next) => {
  console.log('🔍 RUTA /view-cv llamada para estudiante:', req.params.studentId);
  console.log('🔍 BODY recibido:', req.body);
  next();
}, authenticateJWT, studentController.viewStudentCV);

router.post('/:studentId/contact', (req, res, next) => {
  console.log('🔍 RUTA /contact llamada para estudiante:', req.params.studentId);
  console.log('🔍 BODY recibido:', req.body);
  next();
}, authenticateJWT, studentController.contactStudent);

router.get('/:id', authenticateJWT, studentController.getStudentById);

export default router;