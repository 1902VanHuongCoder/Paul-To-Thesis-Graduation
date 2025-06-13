
import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import{ User } from "../models";

class News extends Model {
  public newsID!: number;
  public userID!: string;
  public title!: string;
  public titleImageUrl!: string | null;
  public subtitle?: string | null;
  public content?: string | null; // Optional content field for news details
  public slug?: string; // Optional slug for SEO-friendly URLs
  public images?: string[] | null; // Can store a single image URL or multiple as a JSON string
  public views!: number;
  public tags?: number[] | null; // Can store tags as a JSON string or comma-separated values
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
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true, // Title image URL is required
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
      type: DataTypes.TEXT, // Use TEXT to store images as a JSON string or comma-separated values
      allowNull: true, // Images are optional
      get() {
        const value = this.getDataValue("images");
        return value ? JSON.parse(value) : []; // Parse JSON string to array
      },
      set(value: string[]) {
        this.setDataValue("images", JSON.stringify(value)); // Store as JSON string
      },
    },
    views: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default views to 0
    },
    tags: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue("tags");
        return value ? JSON.parse(value) : [];
      },
      set(value: number[] | null) {
        this.setDataValue("tags", value ? JSON.stringify(value) : null);
      },
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