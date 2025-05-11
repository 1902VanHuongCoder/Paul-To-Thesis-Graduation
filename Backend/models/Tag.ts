import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Product from "./Product";
import ProductTag from "./ProductTag";

class Tag extends Model {}

Tag.init(
  {
    tagID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tagName: {
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
    modelName: "Tag",
    tableName: "tags",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);



export default Tag;
