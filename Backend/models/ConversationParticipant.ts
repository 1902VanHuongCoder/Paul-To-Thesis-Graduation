import { DataTypes, Model } from "sequelize";
import sequelize from "../configs/mysql-database-connect";

export default class ConversationParticipant extends Model {}
ConversationParticipant.init(
  {
    conversationID: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    userID: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
  },
  {
    sequelize,
    modelName: "conversation_participant",
    tableName: "conversation_participants",
    timestamps: false,
  }
);