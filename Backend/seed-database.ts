import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import { User } from './models';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD!,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    // Sync all models to Railway database
    await sequelize.sync();
    await sequelize.close();
  } catch (error) {
    console.error('Unable to connect or seed:', error);
    process.exit(1);
  }
}

seed();
