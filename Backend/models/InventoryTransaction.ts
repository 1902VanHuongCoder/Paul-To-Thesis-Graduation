import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class InventoryTransaction extends Model {
  public transactionID!: number;
  // public inventoryID!: number;
  public productID!: number;
  public quantityChange!: number;
  public transactionType!: string;
  public note?: string;
  public performedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

InventoryTransaction.init(
  {
    transactionID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    // inventoryID: {
    //   type: DataTypes.INTEGER,
    //   allowNull: false,
    // },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "products", // Assuming the products table is named 'products'
        key: "productID",
      },
    },
    quantityChange: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    transactionType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    performedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "InventoryTransaction",
    tableName: "inventory_transactions",
    timestamps: true, // Enables createdAt and updatedAt
  }
);

export default InventoryTransaction;