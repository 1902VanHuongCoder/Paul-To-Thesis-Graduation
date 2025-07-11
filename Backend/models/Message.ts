import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

export default class Message extends Model {}
Message.init(
  {
    messageID: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversationID: { type: DataTypes.STRING, allowNull: false },
    senderID: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  { sequelize, modelName: "message", tableName: "messages", timestamps: false }
);
