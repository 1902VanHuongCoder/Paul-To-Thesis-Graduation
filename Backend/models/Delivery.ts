import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Delivery extends Model {
  public id!: string;
  public name!: string;
  public description?: string;
  public base_price!: number;
  public min_order_amount?: number;
  public region?: string;
  public speed?: string;
  public is_active!: boolean;
  public is_default!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
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
    base_price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    min_order_amount: {
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
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Delivery",
    tableName: "delivery_methods",
    timestamps: false, // since you use custom created_at/updated_at
    underscored: true,
  }
);

export default Delivery;