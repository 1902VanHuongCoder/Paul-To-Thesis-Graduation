import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import { Product, ShoppingCart } from "./index";

class CartItem extends Model {
  public cartItemID!: number;
  public cartID!: number;
  public productID!: number;
  public quantity!: number;
  public price!: number;
  public discount!: number;
}

CartItem.init(
  {
    cartItemID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    cartID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: ShoppingCart,
        key: "cartID",
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: "CartItem",
    tableName: "cart_items",
    timestamps: false, // No createdAt or updatedAt fields
  }
);

export default CartItem;
