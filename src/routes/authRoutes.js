import { createUser, login } from '../controllers/Auth/authController.js';
import { Router } from 'express';
import cors from 'cors';
import validateUser from '../middlewares/userMiddleware.js';

const router = Router();
server.use(cors());
router.post('/sign-up', validateUser, createUser);

router.post('/', login);

export default router;
