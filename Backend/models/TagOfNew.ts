import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

class TagOfNews extends Model {
  public newsTagID!: number;
  public tagName!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TagOfNews.init(
  {
    newsTagID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    tagName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Ensure tag names are unique
    },
  },
  {
    sequelize,
    modelName: "TagOfNews",
    tableName: "tag_of_news",
    timestamps: true, // Enables createdAt and updatedAt
  }
);

export default TagOfNews;