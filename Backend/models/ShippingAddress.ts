import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class ShippingAddress extends Model {

  public shippingAddressID!: number;
  public userID!: string;
  public phone!: string;
  public address!: string;
  public isDefault!: boolean; 
  public createdAt!: Date;
  public updatedAt!: Date;
}

ShippingAddress.init(
  {
    shippingAddressID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "users",
        key: "userID",
      },
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