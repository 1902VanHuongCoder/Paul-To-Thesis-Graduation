import express from "express";
import cors from "cors"; // Import CORS middleware
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
import productAttributeRoutes from "./routes/productAttributeRoutes";
import attributeRoutes from "./routes/attributeRoutes"; 
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
const app = express();

// Enable CORS
app.use(cors({
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
}));

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

// Middleware to parse JSON request bodies
app.use(express.json()); // Built-in middleware for JSON parsing

// If using body-parser (optional)
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
app.use(bodyParser.json({ limit: "20mb" }));

// Middleware to parse raw body (e.g. binary data)
app.use(bodyParser.raw({ type: "application/octet-stream", limit: "20mb" }));


// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/product",productRoutes);
app.use("/api/product-tag",productTagRoutes);

app.use("/api/category", categoryRoutes);  
app.use("/api/subcategory", subCategoryRoutes); 
app.use("/api/tag", tagRoutes);
app.use("/api/attribute", attributeRoutes); 
app.use("/api/origin", originRoutes); 
app.use("/api/inventory", inventoryRoutes); 
app.use("/api/location", locationRoutes); 
app.use("/api/order", orderRoutes);
app.use("/api/shopping-cart", shoppingCartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/comment", commentRoutes);
app.use("/api/inventory-transaction", inventoryTransactionRoutes);
app.use("/api/product-attributes",productAttributeRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/tag-of-news", tagOfNewsRoutes); 
app.use("/api/create-payment", vnpayRoutes);
app.use("/api/delivery", deliveryRoutes); // Add this line to include the delivery routes
app.use("/api/discount", discountRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/shipping-address", shippingAddressRoutes);
app.use("/api/news-comment", newsCommentRoutes);
app.use("/api/contact",contactRoutes);
// Define the port
const PORT = 3001;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});

export default app;
