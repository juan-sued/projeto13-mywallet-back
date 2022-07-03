import joi from 'joi';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import db, { connectClient, closeClient } from '../../databases/mongo.js';
export async function createUser(request, response) {
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
}

export async function login(request, response) {
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
}
