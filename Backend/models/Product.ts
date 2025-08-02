import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Category from "./Category";
import Origin from "./Origin";
import SubCategory from "./Subcategory";

class Product extends Model {
  productID: any;
  barcode!: string; 
  boxBarcode!: string;
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
  expiredAt!: Date | null;
  quantityPerBox!: number;
  diseases!: number[]
}

Product.init(
  {
    productID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure that each product has a unique barcode
    },
    boxBarcode: {
      type: DataTypes.STRING,
      allowNull: true, // Allow null for products that do not have a box barcode
      unique: true, // Ensure that each product box has a unique barcode
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
    quantityPerBox: {
      type: DataTypes.INTEGER,
      allowNull: true, // Allow null for products that do not have a quantity per box
      defaultValue: 0, // Default value for quantity per box
    },
    diseases: {
      type: DataTypes.JSON,
      allowNull: true, // Allow null for products that do not have associated diseases
      defaultValue: [], // Default to an empty array if no diseases are associated
    },
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
  }
);


export default Product;
