import { Router } from 'express'
import studentController from '../controllers/studentController.js';
import { authenticateJWT } from '../middlewares/authenticate.midlleware.js';

const router = Router();
router.route('/').get(authenticateJWT, studentController.getStudent)
                .post(authenticateJWT, studentController.createStudent)
                .put(authenticateJWT, studentController.updateStudent)
                .patch(authenticateJWT, studentController.activateInactivate)
                .delete(authenticateJWT,studentController.deleteStudent)

export default router