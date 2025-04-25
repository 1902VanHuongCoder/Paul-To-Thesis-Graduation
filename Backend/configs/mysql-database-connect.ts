import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const MYSQL_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  port: Number(process.env.PORT) || 3306,
};

export const connectToDatabase = async () => {
  try {
    const connection = await mysql.createConnection(MYSQL_CONFIG);
    console.log('✅ Connected to MySQL Workbench successfully');
    return connection;
  } catch (err) {
    console.error('❌ Error connecting to MySQL:', err);
    process.exit(1);
  }
};