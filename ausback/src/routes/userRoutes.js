import { Router } from 'express'
import userController from '../controllers/userController.js'
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();
router.route('/').get(userController.getUsers).post(userController.createUsers)

router.route('/:id').get(authenticateJWT, userController.getUser)
                    .put(authenticateJWT, userController.updateUser)
                    .patch(authenticateJWT, userController.activateInactivate)
                    .delete(authenticateJWT, userController.deleteUser)

export default router;