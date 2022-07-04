import db, { connectClient, closeClient } from '../databases/mongo.js';

// valida token
async function authUser(request, response, next) {
  const { Authorization } = request.headers;
  const token = Authorization?.replace('Bearer ', ''); // o ? significa que é opcional, ja que o token pode vir null
  if (!token)
    return response
      .status(400)
      .send('Token ou Id inválido, não autorizado ou inexistente');
  try {
    connectClient();

    const session = await db.collection('sessions').findOne({ token });
    if (!session) return response(401).send('Usuário não autorizado.');

    response.locals.session = session;
    closeClient();
    next();
  } catch {
    closeClient();
  }
  //diz que pode continuar o fluxo
}

export default authUser;
