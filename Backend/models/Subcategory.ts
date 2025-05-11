import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Category from "./Category";
import Product from "./Product";

class SubCategory extends Model {}

SubCategory.init(
  {
    subcategoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category, // Reference the Category model
        key: "categoryID", // Reference the primary key in the Category model
      },
    },
    subcategoryName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "SubCategory",
    tableName: "subcategories",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

export default SubCategory;