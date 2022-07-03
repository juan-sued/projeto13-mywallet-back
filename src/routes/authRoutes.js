import { createUser, login } from '../controllers/Auth/authController.js';
import { Router } from 'express';

const router = Router();

router.post('/sign-up', createUser);

router.post('/', login);

export default router;
