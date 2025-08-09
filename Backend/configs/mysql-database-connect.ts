import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

import { Sequelize } from "sequelize";

// Create a MySQL connection pool
const sequelize = new Sequelize(
  process.env.DB_NAME as string,
  process.env.DB_USER as string,
  process.env.DB_PASSWORD as string,
  {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false, // Set to true if you want SQL logs
  }
);

export default sequelize;
