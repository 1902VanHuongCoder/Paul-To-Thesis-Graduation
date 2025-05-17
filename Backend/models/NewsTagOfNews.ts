import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";
import News from "./News";
import TagOfNews from "./TagOfNew";

class NewsTagOfNews extends Model {
  public newsID!: number;
  public newsTagID!: number;
}

NewsTagOfNews.init(
  {
    newsID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: News,
        key: "newsID",
      },
      primaryKey: true, // Composite primary key
    },
    newsTagID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: TagOfNews,
        key: "newsTagID",
      },
      primaryKey: true, // Composite primary key
    },
  },
  {
    sequelize,
    modelName: "NewsTagOfNews",
    tableName: "news_tag_of_news",
    timestamps: false, // No createdAt or updatedAt fields
  }
);



export default NewsTagOfNews;