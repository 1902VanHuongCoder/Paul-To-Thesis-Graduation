import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import { User, Product } from "./index"; 

class Comment extends Model {
  public commentID!: number;
  public userID!: number;
  public productID!: number;
  public content!: string;
  public commentAt!: Date;
  public rating!: number;
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
      type: DataTypes.INTEGER,
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