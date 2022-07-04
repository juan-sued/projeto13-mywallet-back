import { createUser, login } from '../controllers/Auth/authController.js';
import { Router } from 'express';

import validateUser from '../middlewares/userMiddleware.js';

const router = Router();

router.post('/sign-up', validateUser, createUser);

router.post('/', login);

export default router;
