import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();
const client = new MongoClient(process.env.MONGO_URI);
let db;
db = client.db(process.env.MONGO_DATABASE);

export async function connectClient() {
  try {
    await client.connect();
  } catch {
    console.log('Erro ao connectar o client');
  }
}

export async function closeClient() {
  try {
    client.close();
  } catch {
    console.log('Erro ao se desconectar o client');
  }
}

export default db;
