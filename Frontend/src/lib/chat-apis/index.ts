import { baseUrl } from "../others/base-url";

interface User {
  userID: string;
  username: string;
  email: string;
}
interface Message {
  messageID: number;
  conversationID: string;
  senderID: string;
  content: string;
  createdAt: string;
  sender?: User;
  isRead?: boolean;
}


interface Conversation {
  conversationID: string;
  conversationName: string;
  participants: User[];
  isGroup: boolean;
  conversationAvatar?: string;
  newestMessage?: string;
  hostID?: string;
  messages?: Message[];
}

interface ConversationList {
  conversationID: string;
  userID: string;
  conversation: Conversation;
}

export const loadChatMessages = async (
  conversationID: string
): Promise<Message[]> => {
  try {
    const response = await fetch(`${baseUrl}/api/chat/${conversationID}`);
    if (!response.ok) {
      throw new Error("Failed to load messages");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error loading chat messages:", error);
    throw error;
  }
};

export const addNewMessage = async (
  conversationID: string,
  senderID: string,
  content: string
): Promise<Message> => {
  try {
    const response = await fetch(`${baseUrl}/api/chat/add-new-message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationID, senderID, content }),
    });
    if (!response.ok) {
      throw new Error("Failed to send message");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

export const markMessagesAsRead = async (
  conversationID: string,
  userID: string
): Promise<void> => {
  try {
    const response = await fetch(`${baseUrl}/api/chat/mark-messages-read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationID, userID }),
    });
    if (!response.ok) {
      throw new Error("Failed to mark messages as read");
    }
  } catch (error) {
    console.error("Error marking messages as read:", error);
    throw error;
  }
}

export const fetchConversations = async (userID: string): Promise<ConversationList[]> => {
    try {
        const response = await fetch(`${baseUrl}/api/chat/conversations/${userID}`);
        if (!response.ok) {
        throw new Error("Failed to fetch conversations");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching conversations:", error);
        throw error;
    }
};
