import { createUser, login, log_Out } from '../controllers/Auth/authController.js';
import { Router } from 'express';

import validateUser from '../middlewares/userMiddleware.js';

const router = Router();

router.post('/sign-up', validateUser, createUser);

router.post('/', login);

router.delete('/log-out', log_Out);

export default router;
