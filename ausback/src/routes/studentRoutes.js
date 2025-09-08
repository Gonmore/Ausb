import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

// 🔥 RUTAS EXISTENTES
router.get('/', authenticateJWT, studentController.getAllStudents);
router.get('/candidates', authenticateJWT, studentController.getCandidates);
router.post('/search-intelligent', authenticateJWT, studentController.searchIntelligentStudents);
router.get('/tokens/balance', authenticateJWT, studentController.getTokenBalance);
router.post('/tokens/use', authenticateJWT, studentController.useTokens);
router.get('/:id', authenticateJWT, studentController.getStudentById);

// 🔥 NUEVAS RUTAS PARA VER CV Y CONTACTAR
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

// AGREGAR esta nueva ruta:
router.get('/revealed-cvs', authenticateJWT, studentController.getRevealedCVs);
router.get('/revealed-cvs-details', authenticateJWT, studentController.getRevealedCVsWithDetails);

export default router;