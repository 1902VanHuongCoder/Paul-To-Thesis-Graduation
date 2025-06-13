import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class User extends Model {
  public userID!: string;
  public username!: string;
  public email!: string;
  public avatar!: string | null;
  public role!: "sta" | "adm" | "cus";
  public password!: string | null;
  public position!: string | null; // for staff users
  public department!: string | null; // for administrator users
  public loyaltyPoints!: number | null; // for customer users
  public provider!: string | null; // for OAuth users 
  public providerID!: string | null;  // is provided by the OAuth provider
  public isActive!: boolean;
  public resetPasswordCode!: string | null; // For password reset functionality
  public resetPasswordCodeExpiry!: Date | null; // Expiry time for the reset password code
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date; 
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
      unique: true, // Ensure email is unique
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["sta", "adm", "cus"]],
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
      allowNull: true,
    },
    providerID: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    resetPasswordCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    resetPasswordCodeExpiry: {
      type: DataTypes.DATE,
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
