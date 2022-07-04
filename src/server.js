import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import authRouter from './routes/authRoutes.js';
import transationsRoutes from './routes/transactionsRoutes.js';

const server = express();

server.use(
  cors({
    origin: '*'
  })
);

server.use((req, res, next) => {
  //Qual site tem permissão de realizar a conexão, no exemplo abaixo está o "*" indicando que qualquer site pode fazer a conexão
  res.header('Access-Control-Allow-Origin', '*');
  //Quais são os métodos que a conexão pode realizar na API
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  server.use(cors());
  next();
});

server.use(express.json());

server.use(authRouter);
server.use(transationsRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(chalk.cyan('Rodando'));
});
