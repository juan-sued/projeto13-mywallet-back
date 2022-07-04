import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import transationsRoutes from './routes/transactionsRoutes.js';

const server = express();

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
server.use(express.json());

server.use(authRouter);
server.use(transationsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(chalk.cyan('Rodando'));
});
