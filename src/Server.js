import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import transationsRoutes from './routes/transactionsRoutes.js';

const server = express();

server.use(cors());
server.use(express.json());

server.use(authRouter);
server.use(transationsRoutes);

server.listen(process.env.PORT || 5000, () => {
  console.log(chalk.cyan('Rodando na porta 5000'));
});
