import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Delivery extends Model {
  public deliveryID!: number;
  public name!: string;
  public description?: string;
  public basePrice!: number;
  public minOrderAmount?: number;
  public region?: string;
  public speed?: string;
  public isActive!: boolean;
  public isDefault!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Delivery.init(
  {
    deliveryID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    basePrice: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    minOrderAmount: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    region: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    speed: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Delivery",
    tableName: "delivery_methods",
    timestamps: true, // use Sequelize's default createdAt/updatedAt
    underscored: false, // don't use snake_case
  }
);

export default Delivery;