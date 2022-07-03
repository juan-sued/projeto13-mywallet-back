import dayjs from 'dayjs';
import db, { connectClient, closeClient } from '../../databases/mongo.js';
// Meus controllers

export async function registerTransactions(request, response) {
  const { typeTransaction } = request.params;
  const { event, price, name } = request.body.user;
  //testar colocar const
  const session = response.locals.session;

  let type = 'entry';
  if (typeTransaction === 'exit') type = 'exit';

  const formatPrice = Number(parseFloat(price).toFixed(2));

  try {
    connectClient();

    await db.collection('transactions').insertOne({
      user_Id: session.user_Id,
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
}

export async function infosHomePage(request, response) {
  //
  //
  //COLOCAR UM LIMITADOR DAS ULTIMAS 50 TRANSAÇÕES
  //
  //
  try {
    connectClient();
    const session = response.locals.session;

    const transactions = await db
      .collection('transactions')
      .find({ user_Id: session.user_Id })
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
}
