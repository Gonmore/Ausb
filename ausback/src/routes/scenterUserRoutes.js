import express from 'express';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';
import scenterUserController from '../controllers/scenterUserController.js';

const router = express.Router();

// Todas las rutas requieren autenticación y verificación de usuario scenter
router.use(authenticateJWT);
router.use(scenterUserController.verifyScenterUser);

// Rutas para gestión del scenter
router.get('/info', scenterUserController.getScenterInfo);
router.put('/info', scenterUserController.updateScenterInfo);

// Rutas para gestión de familias profesionales
router.post('/profamilys', scenterUserController.addProfamilyToScenter);
router.get('/profamilys', scenterUserController.getScenterProfamilys);

// Rutas para gestión de estudiantes
router.post('/students', scenterUserController.addVerifiedStudent);
router.get('/students', scenterUserController.getScenterStudents);
router.put('/students/assign-tutor', scenterUserController.assignTutorToStudent);

// Rutas para estadísticas
router.get('/stats', scenterUserController.getScenterStats);

export default router;