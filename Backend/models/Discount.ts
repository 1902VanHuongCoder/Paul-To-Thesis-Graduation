import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Discount extends Model {
  public discountID!: string;
  public discountDescription!: string;
  public discountPercent!: number;
  public expireDate!: Date;
  public isActive!: boolean;

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
      type: DataTypes.STRING,
      primaryKey: true,
    },
    discountDescription: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    discountPercent: {
      type: DataTypes.INTEGER,
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
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    maxDiscountAmount: {
      type: DataTypes.INTEGER,
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