import db, { connectClient, closeClient } from '../databases/mongo.js';
async function validateUser(request, response, next) {
  const { authorization } = request.headers;
  const token = authorization?.replace('Baerer ', ''); // o ? significa que é opcional, ja que o token pode vir null
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

export default validateUser;
