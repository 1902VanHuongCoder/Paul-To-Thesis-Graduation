import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import User from "./User";

class ShoppingCart extends Model {
  public cartID!: number;
  public customerID!: string;
  public totalQuantity!: number;
  public payment!: number;
  public discount!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ShoppingCart.init(
  {
    cartID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    customerID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: "userID",
      },
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1,
    },
    payment: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 0.0,
    },
  },
  {
    sequelize,
    modelName: "ShoppingCart",
    tableName: "shopping_carts",
    timestamps: true, // Enables createdAt and updatedAt
  }
);

export default ShoppingCart;