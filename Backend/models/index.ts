import User from "./User";
import Product from "./Product";
import Category from "./Category";
import SubCategory from "./Subcategory";
import Tag from "./Tag";
import ProductTag from "./ProductTag";
import Origin from "./Origin";
import InventoryTransaction from "./InventoryTransaction";
import Inventory from "./Inventory";
import Location from "./Location";
import Order from "./Order";
import OrderProduct from "./OrderProduct";
import CartItem from "./CartItem";
import ShoppingCart from "./ShoppingCart";
import Comment from "./Comment";
import News from "./News";
import TagOfNews from "./TagOfNew";
import NewsTagOfNews from "./NewsTagOfNews";
import Wishlist from "./Wislist";
import Delivery from "./Delivery";
import Discount from "./Discount";
import ShippingAddress from "./ShippingAddress";
import NewsComment from "./NewsComment";
import Contact from "./Contact";

// 1. User - ShippingAddress
User.hasMany(ShippingAddress, {
  foreignKey: "userID",
  as: "shipping-address"
})








SubCategory.hasMany(Product, {
  foreignKey: "subcategoryID", // Foreign key in the Product model
});

SubCategory.belongsTo(Category, {
  foreignKey: "categoryID", // Foreign key in the SubCategory model
});

Product.belongsTo(SubCategory, { foreignKey: "subcategoryID", as: "subcategory" }); // Foreign key in the Product model

Product.belongsTo(Category, { foreignKey: "categoryID", as: "category" }); // Foreign key in the Product model

Category.hasMany(Product, {
  foreignKey: "categoryID", // Foreign key in the Product model
});

Category.hasMany(SubCategory, {
  foreignKey: "categoryID", // Foreign key in the SubCategory model)
});

Product.belongsTo(Origin, { foreignKey: "originID", as: "origin" }); // Foreign key in the Product model

Origin.hasMany(Product, {
  foreignKey: "originID", // Foreign key in the Product model
  as: "origin",
});

Tag.belongsToMany(Product, { through: ProductTag, foreignKey: "tagID" });
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: "productID" });

InventoryTransaction.belongsTo(Inventory, { foreignKey: "inventoryID", as: "inventory" });
Inventory.hasMany(InventoryTransaction, { foreignKey: "inventoryID", as: "transactions" });

Inventory.belongsTo(Product, { foreignKey: "productID", as: "product" });
Inventory.belongsTo(Location, { foreignKey: "locationID", as: "location" });

Product.hasMany(Inventory, { foreignKey: "productID", as: "inventories" });
Location.hasMany(Inventory, { foreignKey: "locationID", as: "inventories" });

Order.belongsToMany(Product, {
  through: OrderProduct,
  foreignKey: "orderID",
  as: "products",
});
Product.belongsToMany(Order, {
  through: OrderProduct,
  foreignKey: "productID",
  as: "orders",
});

Order.belongsTo(User, { foreignKey: "userID", as: "user" }); 
Order.belongsTo(Delivery, { foreignKey: "deliveryID", as: "delivery" });

ShoppingCart.belongsToMany(Product, {
  through: CartItem,
  foreignKey: "cartID",
  as: "products",
});

Product.belongsToMany(ShoppingCart, {
  through: CartItem,
  foreignKey: "productID",
  as: "carts",
});

Comment.belongsTo(User, { foreignKey: "userID", as: "user" });
Comment.belongsTo(Product, { foreignKey: "productID", as: "product" });

User.hasMany(Comment, { foreignKey: "userID", as: "comments" });
Product.hasMany(Comment, { foreignKey: "productID", as: "comments" });

News.belongsTo(User, { foreignKey: "userID", as: "author" });
User.hasMany(News, { foreignKey: "userID", as: "news" });

User.hasMany(ShippingAddress, {
  foreignKey: "shippingAddressID", 
  as: "shippingAddresses"
});

News.belongsToMany(TagOfNews, {
  through: NewsTagOfNews,
  foreignKey: "newsID",
  as: "hastags",
});

TagOfNews.belongsToMany(News, {
  through: NewsTagOfNews,
  foreignKey: "newsTagID",
  as: "hasnews",
});

// Associations
Wishlist.belongsTo(User, { foreignKey: "customerID", as: "customer" });
Wishlist.belongsTo(Product, { foreignKey: "productID", as: "product" });

News.hasMany(NewsComment, {foreignKey: "newsID", as: "comments" });
User.hasMany(NewsComment, {foreignKey: "userID", as: "user_comments" });
NewsComment.belongsTo(User,{foreignKey: "userID", as: "user_comments" });

Contact.belongsTo(User, { foreignKey: "userID", as: "user" });
export {
  User,
  Product,
  Category,
  SubCategory,
  Tag,
  ProductTag,
  Origin,
  InventoryTransaction,
  Inventory,
  Location,
  Order,
  OrderProduct,
  CartItem,
  ShoppingCart,
  Comment,
  News,
  TagOfNews,
  NewsTagOfNews,
  Wishlist,
  Delivery,
  Discount,
  ShippingAddress,
  NewsComment,
  Contact
};

