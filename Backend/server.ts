import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import sequelize from "./configs/mysql-database-connect";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import subCategoryRoutes from "./routes/subCategoryRoutes";
import tagRoutes from "./routes/tagRoutes";
import originRoutes from "./routes/originRoutes";
import inventoryTransactionRoutes from "./routes/inventoryTransactionRoutes";
import locationRoutes from "./routes/locationRoutes";
import orderRoutes from "./routes/orderRoutes";
import shoppingCartRoutes from "./routes/shoppingCartRoutes";
import commentRoutes from "./routes/commentRoutes";
import newsRoutes from "./routes/newsRoutes";
import tagOfNewsRoutes from "./routes/tagOfNewsRoutes";
import vnpayRoutes from "./routes/vnpayRoutes";
import productTagRoutes from "./routes/productTagRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import deliveryRoutes from "./routes/deliveryRoutes";
import discountRoutes from "./routes/discountRoutes";
import chatbotRoutes from "./routes/chatbotRoutes";
import shippingAddressRoutes from "./routes/shippingAddressRoutes";
import newsCommentRoutes from "./routes/newsCommentRoutes";
import contactRoutes from "./routes/contactRoutes";
import chatRoutes from "./routes/chatRoutes";
import aboutRoutes from "./routes/aboutRoutes";
import statisticRoutes from "./routes/statisticRoutes";
import diseaseRoutes from "./routes/diseaseRoutes"; // Import disease routes

import http from "http";
import { Server } from "socket.io";

const app = express();

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3000", // Allow requests from this origin
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Connect to MySQL and Sync DB
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
    // Sync all models with the database
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log("✅ Database & tables synced");
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
  });

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));
app.use(bodyParser.json({ limit: "100mb" }));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/shipping-address", shippingAddressRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/product", productRoutes);
app.use("/api/product-tag", productTagRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/subcategory", subCategoryRoutes);
app.use("/api/tag", tagRoutes);
app.use("/api/origin", originRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/shopping-cart", shoppingCartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/inventory-transaction", inventoryTransactionRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/tag-of-news", tagOfNewsRoutes);
app.use("/api/create-payment", vnpayRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/discount", discountRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/news-comment", newsCommentRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/about", aboutRoutes);
app.use("/api/statistic", statisticRoutes);
app.use("/api/disease", diseaseRoutes); // Disease routes

// Create HTTP server and integrate Socket.IO
export const server = http.createServer(app);
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend origin
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // Join a specific room based on room parameter
  socket.on("join_room", (room: string) => {
    console.log(`🟢 User ${socket.id} joined room: ${room}`);
    socket.join(room);
  });

  // Handle leaving a specific room
  socket.on("leave_room", (room: string) => {
    console.log(`🟡 User ${socket.id} left room: ${room}`);
    socket.leave(room);
  });

  // Handle to get and broadcast messages to a specific room
  socket.on("send_message", (data) => {
    socket.to(data.room).emit("send_message", data);
    console.log(`📩 Message sent to room ${data.room}:`, data);
    socket.to("chat-notification").emit("chat-notification", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// Define the port
const PORT = 3001;

// Start the server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;
