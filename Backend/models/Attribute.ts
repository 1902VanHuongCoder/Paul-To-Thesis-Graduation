import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Category from "./Category";

class Attribute extends Model {}

Attribute.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    categoryID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    data_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    default_value: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    placeholder: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    options: {
      type: DataTypes.JSON, // Assuming options can store multiple values as JSON
      allowNull: true,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: "Attribute",
    tableName: "attributes",
    timestamps: false, // Assuming no createdAt or updatedAt Attributes
  }
);


export default Attribute;