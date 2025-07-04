import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Statistic extends Model {
    public accessCount!: number;
    public year!: number;
    public month!: number;
}

Statistic.init(
  {
    accessCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: new Date().getMonth() + 1,
    },
  },
  {
    sequelize,
    modelName: "Statistic",
    tableName: "statistic",
  },
 
);

export default Statistic;
