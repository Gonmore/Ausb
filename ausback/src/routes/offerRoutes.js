import { Router } from 'express'
import offerController from '../controllers/offerController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();

// Rutas principales para ofertas
router.route('/')
    .get(offerController.listOffers)  // Listar todas las ofertas (público)
    .post(authenticateJWT, offerController.createOffer);  // Crear nueva oferta (autenticado)

router.route('/:id')
    .get(offerController.getOffer)  // Obtener oferta específica (público)
    .put(authenticateJWT, offerController.updateOffer)  // Actualizar oferta (autenticado)
    .delete(authenticateJWT, offerController.deleteOffer);  // Eliminar oferta (autenticado)

// Rutas adicionales para relaciones
router.route('/company/:companyId')
    .get(offerController.getOffersByCompany);  // Obtener ofertas por empresa

router.route('/profamily/:profamilyId')
    .get(offerController.getOffersByProfamily);  // Obtener ofertas por familia profesional

// Nueva ruta para obtener ofertas con aplicaciones
router.route('/my-offers/applications')
    .get(authenticateJWT, offerController.getCompanyOffersWithApplications);  // Obtener ofertas de la empresa con aplicaciones

export default router
