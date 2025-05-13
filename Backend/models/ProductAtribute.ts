import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Product from "./Product";
import Attribute from "./Attribute"; // Assuming the attributes table is represented by the Attribute model

class ProductAttribute extends Model {}

ProductAttribute.init(
  {
    productAttributeID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product, // Reference the Product model
        key: "productID",
      },
    },
    attributeID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Attribute, // Reference the Attribute model (attributes table)
        key: "id",
      },
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "ProductAttribute",
    tableName: "product_attributes",
    timestamps: false, // Disable automatic timestamps since custom Attributes are used
  }
);


export default ProductAttribute;