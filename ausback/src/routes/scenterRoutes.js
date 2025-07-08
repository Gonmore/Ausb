import { Router } from 'express'
import scenterController from '../controllers/scenterController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();
//router.route('/').get(authenticateJWT, scenterController.getScenters)
//                .post(authenticateJWT, scenterController.createScenter)

router.route('/').get( scenterController.listScenters)
                .put(authenticateJWT, scenterController.getScenters)
                .post(authenticateJWT, scenterController.createScenter)

router.route('/:id').get(authenticateJWT, scenterController.getScenter)
                    .put(authenticateJWT, scenterController.updateScenter)
                    .patch(authenticateJWT, scenterController.activateInactivate)
                    .delete(authenticateJWT, scenterController.deleteScenter)
export default router