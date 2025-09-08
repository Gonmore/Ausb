import { Router } from 'express';
import applicationController from '../controllers/applicationController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas para aplicaciones
router.route('/')
    .post(authenticateJWT, applicationController.applyToOffer);  // Aplicar a una oferta

router.route('/user')
    .get(authenticateJWT, applicationController.getUserApplications);  // Obtener aplicaciones del usuario

router.route('/company')
    .get(authenticateJWT, applicationController.getCompanyApplications);  // Obtener aplicaciones de la empresa

router.route('/company/candidates/:offerId')
    .get(authenticateJWT, applicationController.getSmartCandidates);  // Búsqueda inteligente con tokens

router.route('/offer/:offerId')
    .get(authenticateJWT, applicationController.getOfferApplications);  // Obtener aplicaciones de una oferta

router.route('/:applicationId/status')
    .put(authenticateJWT, applicationController.updateApplicationStatus);  // Actualizar estado de aplicación

router.route('/:applicationId')
    .delete(authenticateJWT, applicationController.withdrawApplication);  // Retirar aplicación

router.route('/:applicationId/hire')
    .put(authenticateJWT, applicationController.hireStudent);  // Marcar como contratado

export default router;
