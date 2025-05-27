import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Product from "./Product";
import SubCategory from "./Subcategory";

class Category extends Model {}

Category.init(
  {
    categoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryDescription: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    categoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    categorySlug: {
      type: DataTypes.STRING,
      allowNull: false,
    }, 
    count: {type: DataTypes.INTEGER, allowNull: false },

  },
  {
    sequelize,
    modelName: "Category",
    tableName: "categories",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default Category;