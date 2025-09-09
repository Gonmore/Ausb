import { Router } from 'express';
import applicationController from '../controllers/applicationController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// 🔥 RUTAS ESPECÍFICAS PRIMERO (sin parámetros)
router.route('/user')
    .get(authenticateJWT, applicationController.getUserApplications);

router.route('/company')
    .get(authenticateJWT, applicationController.getCompanyApplications);

router.route('/company/candidates/:offerId')
    .get(authenticateJWT, applicationController.getSmartCandidates);

router.route('/offer/:offerId')
    .get(authenticateJWT, applicationController.getOfferApplications);

router.route('/')
    .post(authenticateJWT, applicationController.applyToOffer);

// 🔥 RUTAS CON PARÁMETROS AL FINAL
router.route('/:applicationId/status')
    .put(authenticateJWT, applicationController.updateApplicationStatus);

router.route('/:applicationId/hire')
    .put(authenticateJWT, applicationController.hireStudent);

// 🔥 RUTA PARA RETIRAR APLICACIÓN (SOLO UNA VEZ)
router.delete('/:applicationId', (req, res, next) => {
  console.log('🔍 DELETE route called with params:', req.params);
  console.log('🔍 applicationId:', req.params.applicationId);
  next();
}, authenticateJWT, applicationController.withdrawApplication);

// 🔥 COMENTAR ESTA LÍNEA HASTA QUE EXISTA LA FUNCIÓN
// router.get('/:id', authenticateJWT, applicationController.getApplicationById);

export default router;
