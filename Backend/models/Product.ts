import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Category from "./Category";
import Origin from "./Origin";
import SubCategory from "./Subcategory";

class Product extends Model {
  productID: any;
  productPrice!: number;
  productPriceSale!: number;
  productName!: string;
  quantityAvailable!: number;
  categoryID!: number;
  description!: string;
  originID!: number;
  subcategoryID!: number;
  images!: string[];
  descriptionImages!: string[];
  rating!: number;
  isShow: boolean = true;
  unit!: string;
  expiredAt: Date | null = null;
}

Product.init(
  {
    productID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    productPrice: {
      type: DataTypes.FLOAT, 
      allowNull: true,
    },
    productPriceSale: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    quantityAvailable: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Category, // Reference the Category model
        key: "categoryID", // Reference the primary key in the Category model
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    descriptionImages: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    originID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Origin, // Reference the Origin model
        key: "originID",
      },
    },
    subcategoryID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: SubCategory, // Reference the SubCategory model
        key: "subcategoryID",
      },
    },
    images: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 5, // Default rating value
    },
    isShow: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Default value for isShow
    },
    expiredAt: {
      type: DataTypes.DATE,
      allowNull: true, // Allow null for products that do not expire
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for products that do not have a specific unit
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
  }
);


export default Product;
