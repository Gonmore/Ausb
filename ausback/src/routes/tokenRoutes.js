import { Router } from 'express';
import companyTokenController from '../controllers/companyTokenController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas para gestión de tokens
router.route('/balance')
    .get(authenticateJWT, companyTokenController.getTokenBalance);  // Obtener balance de tokens

router.route('/recharge')
    .post(authenticateJWT, companyTokenController.rechargeTokens);  // Recargar tokens

router.route('/search-students')
    .post(authenticateJWT, companyTokenController.searchStudents);  // Buscar estudiantes

router.route('/access-cv/:studentId')
    .post(authenticateJWT, companyTokenController.accessStudentCV);  // Acceder al CV

router.route('/usage-history')
    .get(authenticateJWT, companyTokenController.getTokenUsageHistory);  // Historial de uso

export default router;
