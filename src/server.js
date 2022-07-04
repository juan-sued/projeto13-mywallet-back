import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import transationsRoutes from './routes/transactionsRoutes.js';

const server = express();

server.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

server.use(cors());

server.use(express.json());

server.use(authRouter);
server.use(transationsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(chalk.cyan('Rodando'));
});
