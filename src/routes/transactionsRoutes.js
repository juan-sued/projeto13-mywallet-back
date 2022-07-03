import {
  registerTransactions,
  infosHomePage
} from '../controllers/Transactions/transactionsController.js';

import { Router } from 'express';
import validateUser from '../middlewares/validateUser.js';

const router = Router();

router.post('/transactions/:typeTransaction', validateUser, registerTransactions);

router.get('/home', validateUser, infosHomePage);

export default router;
