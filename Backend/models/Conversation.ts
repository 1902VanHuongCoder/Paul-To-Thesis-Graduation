import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

export default class Conversation extends Model {}
Conversation.init(
  {
    conversationID: { type: DataTypes.STRING, primaryKey: true,  },
    conversationName: { type: DataTypes.STRING, allowNull: true }, 

    conversationAvatar: { type: DataTypes.STRING, allowNull: true },
    hostID: { type: DataTypes.STRING, allowNull: false },
    newestMessage: { type: DataTypes.STRING, allowNull: true },

    isGroup: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { sequelize, modelName: "conversation", tableName: "conversations", timestamps: false }
);