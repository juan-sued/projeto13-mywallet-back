import {
  registerTransactions,
  infosHomePage
} from '../controllers/Transactions/transactionsController.js';

import { Router } from 'express';

import authUser from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/transactions/:typeTransaction', authUser, registerTransactions);

router.get('/home', authUser, infosHomePage);

export default router;
