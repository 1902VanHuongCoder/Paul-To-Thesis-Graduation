import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import User from "./User";

class Order extends Model {
  public orderID!: number;
  public userID!: number;
  public orderDate!: Date;
  public total!: number;
  public totalAmount!: number;
  public note?: string;
  public orderStatus!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    orderID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    orderDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // Default status is "pending"
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true, // Enables createdAt and updatedAt
  }
);



export default Order;