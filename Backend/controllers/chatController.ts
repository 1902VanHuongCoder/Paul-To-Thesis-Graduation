import { Op } from "sequelize";
import {
  Conversation,
  ConversationParticipant,
  Message,
  User,
} from "../models";
import { Request, Response } from "express";
// Get all conversations based on conversationID
export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationID } = req.params;
  if (!conversationID) {
    res.status(400).json({ message: "conversationID is required" });
    return;
  }
  try {
    const messages = await Message.findAll({
      where: { conversationID },
      include: [{ model: User, as: "sender" }],
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Add new message
export const addNewMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationID, senderID, content } = req.body;
  if (!conversationID || !senderID || !content) {
    res
      .status(400)
      .json({ message: "conversationID, senderID, and content are required" });
    return;
  }
  try {
    const newMessage = await Message.create({
      conversationID,
      senderID,
      content,
      createdAt: new Date(),
    });
    res.status(201).json({
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error adding new message:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createConversation = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationID, conversationName, participants, isGroup } = req.body;

  let existingConversation;

  console.log("Creating conversation with data:", {
    conversationID,
    conversationName,
    participants,
    isGroup,
  });

  // Conversation ID is created by concatenating two first participants's IDs, so if request conversationID is in two cases, it already existed
  // const possibleIDs = [
  //   `CON${participants[0]}${participants[1]}`,
  //   `CON${participants[1]}${participants[0]}`,
  // ];

  try {
    // Check if a conversation already exists with the possible IDs
    existingConversation = await ConversationParticipant.findOne({
      where: {
         userID: participants[0],
      },
    });
  } catch (error) {
    console.error("Error checking conversation existence:", error);
    res.status(500).json({ message: "Internal server error" });
    return;
  }
  // Check if the conversation already exists
  // If it existed, return the existing conversation
  if (existingConversation) {
    console.log("Conversation already exists:", existingConversation);
    res.status(200).json({
      message: "Conversation already exists",
      conversation: existingConversation,
    });
    return;
  } else {
    try {
      const newConversation = await Conversation.create({
        conversationID,
        conversationName,
        isGroup: isGroup,
      });
      await ConversationParticipant.bulkCreate(
        participants.map((userID: number) => ({
          conversationID: newConversation.get("conversationID"),
          userID,
        }))
      );

      res.status(201).json({
        message: "Conversation created successfully",
        conversation: newConversation,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  }
  // Else, create a new conversation

  // if (!isGroup) {
  //   // For 1-1 chat, check if conversationID matches either possible order
  //   const possibleIDs = [
  //     `CON${participants[0]}${participants[1]}`,
  //     `CON${participants[1]}${participants[0]}`,
  //   ];

  //   console.log("Possible conversation IDs:", possibleIDs);
  //   try {
  //     existingConversation = await Conversation.findOne({
  //       where: {
  //         isGroup: false,
  //         conversationID: { [Op.in]: possibleIDs },
  //       },
  //     });

  //     if (existingConversation) {
  //       console.log("Conversation already exists:", existingConversation);
  //       res.status(200).json({
  //         message: "Conversation already exists",
  //         conversation: existingConversation,
  //       });
  //       return;
  //     }
  //   } catch (error) {
  //     console.error("Error checking conversation existence:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //     return;
  //   }
  // }

  // if (!existingConversation) {
  //   try {
  //     const newConversation = await Conversation.create({
  //       conversationID,
  //       conversationName,
  //       isGroup: isGroup,
  //     });
  //     await ConversationParticipant.bulkCreate(
  //       participants.map((userID: number) => ({
  //         conversationID: newConversation.get("conversationID"),
  //         userID,
  //       }))
  //     );

  //     res.status(201).json({
  //       message: "Conversation created successfully",
  //       conversation: newConversation,
  //     });
  //   } catch (error) {
  //     console.error("Error creating conversation:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //     return;
  //   }
  // }
};

// Add a member into a group conversation
export const addMemberIntoGroup = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationID, memberID } = req.body;

  if (!conversationID || !memberID) {
    res.status(400).json({ message: "conversationID and userID are required" });
    return;
  }

  try {
    const conversation = await Conversation.findOne({
      where: { conversationID, isGroup: true },
    });

    if (!conversation) {
      res.status(404).json({ message: "Group conversation not found" });
      return;
    }

    const participantExists = await ConversationParticipant.findOne({
      where: { conversationID, userID: memberID },
    });

    if (participantExists) {
      res.status(400).json({ message: "User already in the group" });
      return;
    }

    await ConversationParticipant.create({
      conversationID,
      userID: memberID,
    });

    res.status(200).json({ message: "User added to group successfully" });
  } catch (error) {
    console.error("Error adding member to group:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all conversations that user belongs to
export const getConversationsUserBelongs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userID } = req.params;
  console.log("Fetching conversations for userID:", userID);
  if (!userID) {
    res.status(400).json({ message: "userID is required" });
    return;
  }

  try {
    const conversations = await ConversationParticipant.findAll({
      where: { userID },
      include: [
        {
          model: Conversation,
          as: "conversation",
          include: [{ model: User, as: "participants" }],
        },
      ],
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
