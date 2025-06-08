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
import inventoryRoutes from "./routes/inventoryRoutes";
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

import http from "http";
import { Server } from "socket.io";

const app = express();

// Enable CORS
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// Connect to MySQL and Sync DB
sequelize
  .authenticate()
  .then(() => {
    console.log("✅ Database connected successfully");
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
app.use("/api/inventory", inventoryRoutes);
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

// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend origin
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room: string) => {
    socket.join(room);
    console.log(`User Id: ${socket.id} joined room: ${room}`);
  });

  socket.on("send_message", (data) => {
    // data: { room, username, message, time }
    socket.to(data.room).emit("send_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Define the port
const PORT = 3001;

// Start the server with Socket.IO
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;