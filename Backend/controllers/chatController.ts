import { Op } from "sequelize";
import {
  Conversation,
  ConversationParticipant,
  Message,
  User,
} from "../models";
import { io } from "../server";
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
    // Update the newest message in the conversation
    await Conversation.update(
      { newestMessage: content },
      { where: { conversationID } }
    );

    // Fetch all admin userIDs
    const adminUsers = await User.findAll({ where: { role: 'adm' }, attributes: ['userID'] });
    const adminIDs = adminUsers.map((u: any) => u.userID);
    // Calculate unread messages count except those sent by admins
    const unreadCount = await Message.count({
      where: {
        isRead: false,
        senderID: { [Op.notIn]: adminIDs },
      },
    });
    console.log("Unread messages count for admin (excluding admin's messages):", unreadCount);
    // Emit the unread count to the admin room
    io.to("admin-room").emit("unread_count_update", {
      unreadCount,
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
  const {
    conversationID,
    conversationName,
    participants,
    isGroup,
    hostID,
    conversationAvatar,
  } = req.body;

  let existingConversation;

  try {
    // Check if a conversation already exists with the possible IDs
    console.log("Checking for existing conversation with participants:", participants[0]);
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
  // If it existed, return the existing conversation
  if (existingConversation) {
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
        conversationAvatar,
        hostID: participants[0],
        newestMessage: "",
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
  if (!userID) {
    res.status(400).json({ message: "userID is required" });
    return;
  }

  try {
    // Fetch conversations where the user is a paticipant
    // and count unread messages for each conversation
    const conversations = await ConversationParticipant.findAll({
      where: { userID },
      include: [
      {
        model: Conversation,
        as: "conversation",
        include: [
        {
          model: Message,
          as: "messages",
          where: { isRead: false, senderID: { [Op.ne]: userID } },
          required: false,
        },
        ],
      },
      ],
    });

    // Sort by number of unread messages (descending)
    conversations.sort((a: any, b: any) => {
      const aUnread = a.conversation?.messages?.length || 0;
      const bUnread = b.conversation?.messages?.length || 0;
      return bUnread - aUnread;
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching conversations for user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all conversations and messages belongs to that conversation (use for admin dashboard)
export const getAllConversationsAndMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const conversations = await Conversation.findAll({
      include: [
        {
          model: Message,
          as: "messages",
          include: [{ model: User, as: "sender" }],
        },
      ],
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error("Error fetching all conversations and messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationID, userID } = req.body;

  if (!conversationID || !userID) {
    res.status(400).json({ message: "conversationID and userID are required" });
    return;
  }

  try {
    // Mark all unread messages in the conversation as read
    await Message.update(
      { isRead: true },
      {
        where: {
          conversationID,
          isRead: false,
          senderID: { [Op.ne]: userID }, // Only mark messages not sent by the user
        },
      }
    );

    // Fetch all admin userIDs
    const adminUsers = await User.findAll({
      where: { role: "adm" },
      attributes: ["userID"],
    });
    const adminIDs = adminUsers.map((u: any) => u.userID);
    // Calculate unread messages count except those sent by admins
    const unreadCount = await Message.count({
      where: {
        isRead: false,
        senderID: { [Op.notIn]: adminIDs },
      },
    });
    console.log(
      "Unread messages count for admin (excluding admin's messages):",
      unreadCount
    );
    // Emit the unread count to the admin room
    io.to("admin-room").emit("unread_count_update", {
      unreadCount,
    });

    res.status(200).json({ message: "Messages marked as read successfully" });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
