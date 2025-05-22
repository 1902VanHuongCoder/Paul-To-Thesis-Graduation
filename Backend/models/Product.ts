import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Category from "./Category";
import Tag from "./Tag";
import Origin from "./Origin";
import SubCategory from "./Subcategory";
import ProductTag from "./ProductTag";

class Product extends Model {
  productID: any;
  productPrice!: number;
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
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    productPriceSale: {
      type: DataTypes.INTEGER,
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
    // tagID: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   references: {
    //     model: Tag, // Reference the Tag model
    //     key: "tagID",
    //   },
    // },
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
      type: DataTypes.FLOAT,
      allowNull: false,
    }
  },
  {
    sequelize,
    modelName: "Product",
    tableName: "products",
  }
);


export default Product;
