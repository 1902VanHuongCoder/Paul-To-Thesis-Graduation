import express from "express";
import bodyParser from "body-parser";
import sequelize from "./configs/mysql-database-connect";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes"; // Assuming you have an upload route

const app = express();

// Connect to MySQL
// Connect to MySQL and Sync DB
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    return sequelize.sync({ alter: true }); // Sync models with the database
  })
  .then(() => {
    console.log("✅ Database & tables synced");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// Middleware
app.use(express.json());

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Middleware to parse raw body (e.g. binary data)
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "10mb" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes); // Assuming you have an upload route")

// Define the port
const PORT = 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;
// Export the app for testing purposes
