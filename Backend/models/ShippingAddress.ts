import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class ShippingAddress extends Model {
  isDefault: any;
}

ShippingAddress.init(
  {
    shippingAddressID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    }, 
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Default value for isDefault
    }
  },
  {
    sequelize, // Assuming sequelize is already defined and imported
    modelName: "ShippingAddress",
    tableName: "shipping_addresses",
  }
);

export default ShippingAddress;