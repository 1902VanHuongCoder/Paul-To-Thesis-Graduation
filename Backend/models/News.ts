
import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import{ User } from "../models";

class News extends Model {
  public newsID!: number;
  public userID!: number;
  public title!: string;
  public titleImageUrl!: string;
  public subtitle?: string;
  public content?: string; // Optional content field for news details
  public slug?: string; // Optional slug for SEO-friendly URLs
  public images?: string; // Can store a single image URL or multiple as a JSON string
  public views!: number;
  public tags?: string; // Can store tags as a JSON string or comma-separated values
  public isDraft!: boolean; // Indicates if the news is a draft
  public isPublished!: boolean; // Indicates if the news is published
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
    titleImageUrl: {
      type:DataTypes.STRING,
      allowNull: false, // Title image URL is required
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT, // Use TEXT for larger content
      allowNull: true, // Content is optional
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: true, // Slug is optional
      unique: true, // Ensure slug uniqueness for SEO
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
    isDraft: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true, // Default to draft status
    }, 
    isPublished: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default to not published
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