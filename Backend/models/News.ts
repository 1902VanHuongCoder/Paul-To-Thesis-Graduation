
import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import{ User } from "../models";

class News extends Model {
  public newsID!: number;
  public userID!: number;
  public title!: string;
  public subtitle?: string;
  public images?: string; // Can store a single image URL or multiple as a JSON string
  public views!: number;
  public tags?: string; // Can store tags as a JSON string or comma-separated values
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

News.init(
  {
    newsID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "userID",
      },
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT, // Use TEXT to store large data like JSON or multiple image URLs
      allowNull: true,
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default views to 0
    },
    tags: {
      type: DataTypes.TEXT, // Use TEXT to store tags as a JSON string or comma-separated values
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "News",
    tableName: "news",
    timestamps: true, // Enables createdAt and updatedAt
  }
);

export default News;