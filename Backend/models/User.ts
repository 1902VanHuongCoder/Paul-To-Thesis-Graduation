import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
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
      allowNull: false,
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
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
  }
);

export default User;
