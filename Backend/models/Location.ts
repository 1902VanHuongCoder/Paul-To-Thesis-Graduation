import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class Location extends Model {
  public locationID!: number;
  public locationName!: string;
  public address!: string;
  public hotline!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Location.init(
  {
    locationID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    locationName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hotline: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Location",
    tableName: "locations",
    timestamps: true, // Enables createdAt and updatedAt
  }
);


export default Location;