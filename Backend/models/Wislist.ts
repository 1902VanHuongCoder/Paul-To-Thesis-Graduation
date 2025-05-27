import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import User from "./User";
import Product from "./Product";

class Wishlist extends Model {
  public wishlistID!: number;
  public customerID!: number;
  public productID!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Wishlist.init(
  {
    wishlistID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customerID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userID",
      },
    },
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "productID",
      },
    },
  },
  {
    sequelize,
    modelName: "Wishlist",
    tableName: "wishlists",
    timestamps: true,
  }
);


export default Wishlist;