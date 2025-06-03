import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import { User, Product } from "./index"; 

class Comment extends Model {
  public commentID!: number;
  public userID!: string;
  public productID!: number;
  public content!: string;
  public commentAt!: Date;
  public rating!: number;
  public likeCount!: number;
  public dislikeCount!: number;
  public status!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comment.init(
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
    productID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: "productID",
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    commentAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "active", // Default status is "active"
    },
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true, // Enables createdAt and updatedAt
  }
);


export default Comment;