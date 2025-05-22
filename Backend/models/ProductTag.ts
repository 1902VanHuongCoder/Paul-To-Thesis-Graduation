import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class ProductTag extends Model {
    productID!: number;
    tagID!: number;
}

ProductTag.init(
  {
    tagID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ProductTag",
    tableName: "product_tags",
    timestamps: false, // Disable createdAt and updatedAt
  }
);

export default ProductTag;