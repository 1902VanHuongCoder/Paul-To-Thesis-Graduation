import express from 'express';
import { connectToDatabase } from './configs/mysql-database-connect.js';


const app = express();
// Connect to MySQL
connectToDatabase();

// Define a route
app.get('/', (req, res) => {
  res.send('Hello, World!');
});

// Define the port
const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});