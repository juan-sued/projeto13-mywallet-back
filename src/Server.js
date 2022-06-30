import dotenv from 'dotenv';
import express, { request, response } from 'express';
import joi from 'joi';
import chalk from 'chalk';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
//apelidamos v4 de uuid
dotenv.config();
const client = new MongoClient(process.env.URL_CONNECT_MONGO);

let db;

db = client.db('MyWallet_db');

const server = express();

server.use(cors());
server.use(express.json());

server.post('/sign-up', async (request, response) => {
  const { email, password, name } = request.body;
  const userRegister = request.body;

  const userSchema = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required()
  });
  const validate = userSchema.validate(userRegister, { abortEarly: false });
  const { error } = validate;
  if (error) {
    const errors = error.details.map(error => error.message);
    response.status(422).send(errors);
    return;
  }

  const passwordCrypted = bcrypt.hashSync(password, 10);

  try {
    connectClient();

    const isRegistered = await db.collection('users').findOne({ email });

    if (isRegistered) {
      response.status(409).send('Usuário ja cadastrado');
      closeClient();
      return;
    }
    const users = await db.collection('users').find().toArray();

    await db.collection('users').insertOne({
      user_Id: users.length,
      name,
      email,
      password: passwordCrypted
    });

    response.status(201).send('Usuário adicionado');

    closeClient();
  } catch {
    response.status(500).send('Erro ao adicionar no banco');
    closeClient();
  }
});

server.post('/', async (request, response) => {
  const { email, password } = request.body;
  const userLogin = request.body;

  const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
  });

  const validate = userSchema.validate(userLogin, { abortEarly: false });
  const { error } = validate;
  if (error) {
    const errors = error.details.map(error => error.message);
    response.status(422).send('erros: ', errors);
    return;
  }

  try {
    connectClient();

    const user = await db.collection('users').findOne({ email });
    const { user_Id } = user;
    const decrypted = bcrypt.compareSync(password, user.password);

    if (!user || !decrypted) {
      closeClient();
      return response.status(401).send('Email ou Senha incorreto(s)');
    }

    const token = uuid();

    await db.collection('sessions').insertOne({
      token,
      user_Id
    });

    response.status(200).send({
      headers: {
        Authorization: 'Baerer ' + token
      },
      user: {
        user_Id,
        name: user.name,
        email: user.email
      }
    });
    closeClient();
  } catch {
    response.status(500).send('Erro ao realizar login');
    closeClient();
  }
});

server.post('/transaction/:typeTransaction', async (request, response) => {
  const { typeTransaction } = request.params;
  const { authorization } = request.headers;
  let { event, price, name } = request.body.user;

  const token = authorization?.replace('Baerer ', ''); // o ? significa que é opcional, ja que o token pode vir null
  if (!token)
    return response
      .status(400)
      .send('Token ou Id inválido, não autorizado ou inexistente');

  let type = 'entry';
  if (typeTransaction === 'exit') type = 'exit';

  const formatPrice = parseFloat(price.toFixed(2));

  try {
    connectClient();
    const userAuthorized = await db.collection('sessions').findOne({ token });
    if (!userAuthorized) return response(401).send('Usuário não autorizado.');

    await db.collection('transactions').insertOne({
      id: userAuthorized.user_Id,
      name,
      type,
      event,
      price: formatPrice,
      time: dayjs().format('HH:mm:ss')
    });

    response.sendStatus(201);
    closeClient();
  } catch {
    response.status(500).send('Erro ao inserir transação.');
    closeClient();
  }
});

server.get('/home', async (request, response) => {
  const { authorization } = request.headers;
  const token = authorization?.replace('Baerer ', ''); // o ? significa que é opcional, ja que o token pode vir null

  if (!token)
    return response
      .status(400)
      .send('Token ou Id inválido, não autorizado ou inexistente');

  //
  //
  //COLOCAR UM LIMITADOR DAS ULTIMAS 50 TRANSAÇÕES
  //
  //
  try {
    connectClient();
    const tokenConfirmed = await db.collection('sessions').findOne({ token });

    if (!tokenConfirmed) return response(401).send('Usuário não autorizado.');

    const transactions = await db
      .collection('transactions')
      .find({ user_Id: token.user_Id })
      .toArray();
    const entriesList = transactions.filter(transaction => transaction.type === 'entry');
    const exitsList = transactions.filter(transaction => transaction.type === 'exit');

    let balanceEntry = 0;
    for (let i = 0; i < entriesList.length; i++) {
      balanceEntry += entriesList[i].price;
    }

    let balanceExit = 0;
    for (let i = 0; i < exitsList.length; i++) {
      balanceExit += exitsList[i].price;
    }

    const totalBalance = (balanceEntry + balanceExit * -1).toFixed(2);

    if (!transactions) {
      response.status(404).send('Não há transações para esse usuário no banco');
      return;
    }
    response.status(200).send({ balance: totalBalance, transactions });

    closeClient();
  } catch {
    response.status(500).send('Erro ao pegar transações.');
    closeClient();
  }
});
server.listen(5000, () => {
  console.log(chalk.cyan('Rodando na porta 5000'));
});

async function connectClient() {
  try {
    await client.connect();
  } catch {
    console.log('Erro ao connectar o client');
  }
}

function closeClient() {
  try {
    client.close();
  } catch {
    console.log('Erro ao se desconectar o client');
  }
}
