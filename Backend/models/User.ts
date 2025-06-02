import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import ShoppingCart from "./ShoppingCart";
import ShippingAddress from "./ShippingAddress";

class User extends Model {
  public userID!: string;
  public username!: string;
  public email!: string;
  public avatar!: string | null;
  public role!: "staff" | "administrator" | "customer";
  public password!: string | null;
  public position!: string | null;
  public department!: string | null;
  public loyaltyPoints!: number | null;
  public provider!: string | null; // For OAuth users
  public providerID!: string | null; // For OAuth users
  public shippingAddressID!: number | null;

}

User.init(
  {
    userID: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["staff", "administrator", "customer"]],
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Optional: fields specific to child roles
    position: {
      type: DataTypes.STRING, // For staff
      allowNull: true,
    },
    department: {
      type: DataTypes.STRING, // For administrator
      allowNull: true,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER, // For customer
      allowNull: true,
    },
    provider: {
      type: DataTypes.STRING,
      allowNull: true, // For OAuth users
    },
    providerID: {
      type: DataTypes.STRING,
      allowNull: true, // For OAuth users
    },
    shippingAddressID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ShippingAddress, // Assuming you have a ShippingAddress model
        key: "shippingAddressID",
      },
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

export default User;
