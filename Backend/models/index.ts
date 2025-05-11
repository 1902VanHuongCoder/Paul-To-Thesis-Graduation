import User from "./User";
import Product from "./Product";
import Category from "./Category";
import SubCategory from "./Subcategory";
import Tag from "./Tag";
import ProductTag from "./ProductTag";
import ProductAttribute from "./ProductAtribute";
import Attribute from "./Attribute";
import Origin from "./Origin";

SubCategory.hasMany(Product, {
  foreignKey: "subcategoryID", // Foreign key in the Product model
});

SubCategory.belongsTo(Category, {
  foreignKey: "categoryID", // Foreign key in the SubCategory model
});

ProductAttribute.belongsTo(Product, { foreignKey: "productID" });
ProductAttribute.belongsTo(Attribute, { foreignKey: "attributeID" });

Product.belongsTo(Category, { foreignKey: "categoryID" });

Category.hasMany(Product, {
  foreignKey: "categoryID", // Foreign key in the Product model
});

Category.hasMany(SubCategory, {
  foreignKey: "categoryID", // Foreign key in the SubCategory model)
});

Attribute.belongsTo(Category, {
  foreignKey: "categoryID", // Foreign key in the Attribute model
});

Origin.hasMany(Product, {
  foreignKey: "originID", // Foreign key in the Product model
});

// Define associations
Tag.belongsToMany(Product, { through: ProductTag, foreignKey: "tagID" });
Product.belongsToMany(Tag, { through: ProductTag, foreignKey: "productID" });

export {
  User,
  Product,
  Category,
  SubCategory,
  Tag,
  ProductTag,
  ProductAttribute,
  Attribute,
  Origin,
};
