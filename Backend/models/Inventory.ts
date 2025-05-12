import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Inventory extends Model {
  public inventoryID!: number;
  public productID!: number;
  public locationID!: number;
  public quantityInStock!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Inventory.init(
  {
    inventoryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    locationID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantityInStock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "Inventory",
    tableName: "inventories",
    timestamps: true, // Enables createdAt and updatedAt
  }
);


export default Inventory;