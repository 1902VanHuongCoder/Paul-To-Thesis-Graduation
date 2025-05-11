import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import Product from "./Product";

class Origin extends Model {}

Origin.init(
  {
    originID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    originName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "Origin",
    tableName: "origins",
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);


export default Origin;
