import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import User from "./User";
import Delivery from "./Delivery";

class Order extends Model {
  public orderID!: string;
  public userID!: number;
  public totalPayment!: number;
  public totalQuantity!: number;
  public note?: string;
  public fullName!: string;
  public phone!: string;
  public address!: string;
  public paymentMethod!: string;
  public deliveryID!: number;
  public cartID!: number;
  public discount?: number;
  public deliveryCost?:number;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    orderID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userID",
      },
    },
    totalPayment: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    fullName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deliveryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Delivery, // Assuming you have a Delivery model
        key: "deliveryID",
      },
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    deliveryCost: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    orderStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "pending", // Default status can be 'pending', 'completed', etc.
    }
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
  }
);

export default Order;