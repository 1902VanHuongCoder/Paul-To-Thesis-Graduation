import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import { User, Product } from "./index"; 

class NewsComment extends Model {
  public newsCommentID!: number;
  public userID!: string;
  public newsID!: number;
  public content!: string;
  public likeCount!: number;
  public dislikeCount!: number;
  public commentAt!: Date;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

NewsComment.init(
  {
    commentID: {
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
    newsID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "news", // Use lowercase table name
        key: "newsID",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    likeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default like count is 0
    }, 
    dislikeCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0, // Default dislike count is 0
    },
    commentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active", // Default status is "active"
    },
  },
  {
    sequelize,
    modelName: "NewsComment",
    tableName: "news_comments",
    timestamps: true, // Enables createdAt and updatedAt
  }
);


export default NewsComment;