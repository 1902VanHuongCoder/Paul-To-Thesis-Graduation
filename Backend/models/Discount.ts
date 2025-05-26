import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Discount extends Model {
  public discountID!: number;
  public discountDescription!: string;
  public discountPercent!: number;
  public discountPriceBase!: number;
  public expireDate!: Date;
  public isActive!: boolean;

  // Suggested additional properties:
  public code?: string; // Discount code for users to enter
  public usageLimit?: number; // Max times this discount can be used
  public usedCount?: number; // How many times it has been used
  public minOrderValue?: number; // Minimum order value to apply discount
  public maxDiscountAmount?: number; // Maximum discount value
  public createdAt!: Date;
  public updatedAt!: Date;
}

Discount.init(
  {
    discountID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    discountDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discountPercent: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discountPriceBase: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expireDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    // Suggested additional fields:
    code: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },
    usageLimit: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    usedCount: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    minOrderValue: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    maxDiscountAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Discount",
    tableName: "discounts",
    timestamps: true,
  }
);

export default Discount;