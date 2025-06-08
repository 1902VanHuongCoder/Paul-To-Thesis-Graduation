import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Order from "./Order";
import Product from "./Product";

class OrderProduct extends Model {
  public orderProductID!: number;
  public orderID!: string;
  public productID!: number;
  public quantity!: number;
  public price!: number;
}

OrderProduct.init(
  {
    orderProductID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    orderID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: Order,
        key: "orderID",
      },
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "productID",
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "OrderProduct",
    tableName: "order_products",
    timestamps: false, // No createdAt or updatedAt fields
  }
);

export default OrderProduct;