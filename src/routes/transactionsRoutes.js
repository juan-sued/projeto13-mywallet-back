import {
  registerTransactions,
  infosHomePage
} from '../controllers/Transactions/transactionsController.js';
import cors from 'cors';
import { Router } from 'express';

import authUser from '../middlewares/authMiddleware.js';

const router = Router();
server.use(cors());
router.post('/transactions/:typeTransaction', authUser, registerTransactions);

router.get('/home', authUser, infosHomePage);

export default router;
